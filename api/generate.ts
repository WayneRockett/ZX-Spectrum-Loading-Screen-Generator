import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const REPLICATE_MODEL = 'black-forest-labs/flux-schnell';
const MAX_PROMPT_LENGTH = 500;
const DEFAULT_PER_IP_DAILY_LIMIT = 3;
const DEFAULT_GLOBAL_DAILY_LIMIT = 100;
const DEFAULT_COOLDOWN_SECONDS = 20;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const config = {
    maxDuration: 60,
};

const SPECTRUM_PALETTE = [
    '#000000', '#0000D7', '#D70000', '#D700D7', '#00D700',
    '#00D7D7', '#D7D700', '#D7D7D7', '#0000FF', '#FF0000',
    '#FF00FF', '#00FF00', '#00FFFF', '#FFFF00', '#FFFFFF',
];

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    reason?: 'daily' | 'cooldown' | 'global';
};

type ApiRequest = IncomingMessage & {
    body?: {
        prompt?: unknown;
    };
};

type ApiResponse = ServerResponse & {
    status(statusCode: number): ApiResponse;
    json(body: unknown): void;
};

type ReplicatePrediction = {
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output?: string[];
    error?: string;
    urls?: {
        get?: string;
    };
};

function readPositiveInteger(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getLimits() {
    return {
        perIp: readPositiveInteger(process.env.PER_IP_DAILY_LIMIT, DEFAULT_PER_IP_DAILY_LIMIT),
        global: readPositiveInteger(process.env.GLOBAL_DAILY_LIMIT, DEFAULT_GLOBAL_DAILY_LIMIT),
        cooldown: readPositiveInteger(process.env.GENERATION_COOLDOWN_SECONDS, DEFAULT_COOLDOWN_SECONDS),
    };
}

function getClientIp(request: ApiRequest): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
    return rawIp?.trim() || request.socket.remoteAddress || 'unknown';
}

function getRateLimitKeys(request: ApiRequest) {
    const date = new Date().toISOString().slice(0, 10);
    const ipHash = createHash('sha256').update(getClientIp(request)).digest('hex').slice(0, 24);

    return {
        global: `zx-spectrum:generations:${date}:global`,
        ip: `zx-spectrum:generations:${date}:ip:${ipHash}`,
        cooldown: `zx-spectrum:cooldown:${ipHash}`,
    };
}

function secondsUntilTomorrow(): number {
    const now = new Date();
    const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.ceil((tomorrow - now.getTime()) / 1000) + 60;
}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
        throw new Error('Rate limiting is not configured.');
    }

    const response = await fetch(redisUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
    });

    if (!response.ok) {
        throw new Error(`Rate limit store returned ${response.status}.`);
    }

    const payload = await response.json() as { result?: T; error?: string };
    if (payload.error || payload.result === undefined) {
        throw new Error(payload.error || 'Rate limit store returned an invalid response.');
    }

    return payload.result;
}

async function getRemaining(request: ApiRequest): Promise<number> {
    const keys = getRateLimitKeys(request);
    const limits = getLimits();
    const counts = await redisCommand<Array<string | null>>(['MGET', keys.global, keys.ip]);
    const globalCount = Number.parseInt(counts[0] ?? '0', 10);
    const ipCount = Number.parseInt(counts[1] ?? '0', 10);

    if (globalCount >= limits.global) {
        return 0;
    }

    return Math.max(0, limits.perIp - ipCount);
}

async function reserveGeneration(request: ApiRequest): Promise<RateLimitResult> {
    const keys = getRateLimitKeys(request);
    const limits = getLimits();
    const script = `
        local global_count = tonumber(redis.call('GET', KEYS[1]) or '0')
        local ip_count = tonumber(redis.call('GET', KEYS[2]) or '0')
        if global_count >= tonumber(ARGV[1]) then return {-2, 0} end
        if ip_count >= tonumber(ARGV[2]) then return {0, 0} end
        if not redis.call('SET', KEYS[3], '1', 'EX', ARGV[3], 'NX') then
            return {-1, math.max(0, tonumber(ARGV[2]) - ip_count)}
        end
        global_count = redis.call('INCR', KEYS[1])
        ip_count = redis.call('INCR', KEYS[2])
        if global_count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[4]) end
        if ip_count == 1 then redis.call('EXPIRE', KEYS[2], ARGV[4]) end
        return {1, math.max(0, tonumber(ARGV[2]) - ip_count)}
    `;
    const result = await redisCommand<[number, number]>([
        'EVAL',
        script,
        3,
        keys.global,
        keys.ip,
        keys.cooldown,
        limits.global,
        limits.perIp,
        limits.cooldown,
        secondsUntilTomorrow(),
    ]);

    const [code, remaining] = result;
    if (code === 1) {
        return { allowed: true, remaining };
    }

    const reason = code === -2 ? 'global' : code === -1 ? 'cooldown' : 'daily';
    return { allowed: false, remaining, reason };
}

function buildImagePrompt(userPrompt: string): string {
    return [
        userPrompt,
        '',
        'Create a 1980s ZX Spectrum video game loading screen in 4:3 landscape format.',
        'Use 8-bit pixel art, chunky pixels, clean hard edges, no anti-aliasing, no modern shading, and dithered shading.',
        'Make the composition bold and readable at 256x192 pixels, with the main subject centered and no text, logos, borders, or UI.',
        `Use only colours from this ZX Spectrum palette: ${SPECTRUM_PALETTE.join(', ')}.`,
    ].join('\n');
}

async function replicateRequest(url: string, options?: RequestInit): Promise<Response> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        throw new Error('Image generation is not configured.');
    }

    return fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}

async function createPrediction(prompt: string): Promise<ReplicatePrediction> {
    const response = await replicateRequest(
        `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
        {
            method: 'POST',
            headers: {
                Prefer: 'wait=20',
            },
            body: JSON.stringify({
                input: {
                    prompt: buildImagePrompt(prompt),
                    aspect_ratio: '4:3',
                    output_format: 'webp',
                    output_quality: 90,
                    num_outputs: 1,
                    num_inference_steps: 4,
                    go_fast: true,
                    megapixels: '1',
                    disable_safety_checker: false,
                },
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Image provider returned ${response.status}.`);
    }

    return response.json() as Promise<ReplicatePrediction>;
}

async function waitForPrediction(prediction: ReplicatePrediction): Promise<ReplicatePrediction> {
    const deadline = Date.now() + 20_000;
    let current = prediction;

    while ((current.status === 'starting' || current.status === 'processing') && Date.now() < deadline) {
        if (!current.urls?.get) {
            throw new Error('Image provider did not return a prediction URL.');
        }

        await new Promise((resolve) => setTimeout(resolve, 750));
        const response = await replicateRequest(current.urls.get);
        if (!response.ok) {
            throw new Error(`Image provider status check returned ${response.status}.`);
        }
        current = await response.json() as ReplicatePrediction;
    }

    return current;
}

async function generateImage(prompt: string): Promise<{ base64: string; mimeType: string }> {
    const prediction = await waitForPrediction(await createPrediction(prompt));
    const outputUrl = prediction.output?.[0];

    if (prediction.status !== 'succeeded' || !outputUrl) {
        throw new Error(prediction.error || 'Image generation did not complete.');
    }

    const response = await fetch(outputUrl);
    if (!response.ok) {
        throw new Error(`Generated image download returned ${response.status}.`);
    }

    const image = Buffer.from(await response.arrayBuffer());
    if (image.byteLength > MAX_IMAGE_BYTES) {
        throw new Error('Generated image exceeded the response size limit.');
    }

    const contentType = response.headers.get('content-type');
    return {
        base64: image.toString('base64'),
        mimeType: contentType?.startsWith('image/') ? contentType : 'image/webp',
    };
}

function sendError(response: ApiResponse, status: number, message: string, remaining?: number) {
    response.status(status).json({ error: message, remaining });
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
    response.setHeader('Cache-Control', 'no-store');

    if (request.method === 'GET') {
        try {
            response.status(200).json({ remaining: await getRemaining(request) });
        } catch (error) {
            console.error('Unable to read generation allowance:', error);
            sendError(response, 503, 'Generation limits are temporarily unavailable.');
        }
        return;
    }

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'GET, POST');
        sendError(response, 405, 'Method not allowed.');
        return;
    }

    const prompt = typeof request.body?.prompt === 'string' ? request.body.prompt.trim() : '';
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
        sendError(response, 400, `Prompt must be between 1 and ${MAX_PROMPT_LENGTH} characters.`);
        return;
    }
    if (!process.env.REPLICATE_API_TOKEN) {
        console.error('REPLICATE_API_TOKEN is not configured.');
        sendError(response, 503, 'Image generation is not configured.');
        return;
    }

    let reservation: RateLimitResult;
    try {
        reservation = await reserveGeneration(request);
    } catch (error) {
        console.error('Unable to reserve generation allowance:', error);
        sendError(response, 503, 'Generation limits are temporarily unavailable.');
        return;
    }

    if (!reservation.allowed) {
        const message = reservation.reason === 'cooldown'
            ? 'Please wait a few seconds before generating another image.'
            : reservation.reason === 'global'
                ? 'The site-wide generation limit has been reached for today.'
                : 'You have reached your daily generation limit.';
        sendError(response, 429, message, reservation.remaining);
        return;
    }

    try {
        const image = await generateImage(prompt);
        response.status(200).json({ ...image, remaining: reservation.remaining });
    } catch (error) {
        console.error('Image generation failed:', error);
        sendError(response, 503, 'Image generation is temporarily unavailable. Please try again later.');
    }
}
