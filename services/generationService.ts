
export class QuotaExceededError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QuotaExceededError';
    }
}

export class GenerationLimitError extends Error {
    constructor(message: string, public readonly remaining: number) {
        super(message);
        this.name = 'GenerationLimitError';
    }
}

export interface GenerationResponse {
    base64: string;
    mimeType: string;
    remaining: number;
}

interface ApiPayload {
    base64?: unknown;
    mimeType?: unknown;
    remaining?: unknown;
    error?: string;
}

async function parseResponse(response: Response): Promise<ApiPayload> {
    const payload = await response.json() as ApiPayload;

    if (response.status === 429) {
        const remaining = typeof payload.remaining === 'number' ? payload.remaining : 0;
        throw new GenerationLimitError(payload.error || 'Generation limit reached.', remaining);
    }
    if (!response.ok) {
        throw new QuotaExceededError(payload.error || 'Image generation is temporarily unavailable.');
    }

    return payload;
}

export async function getGenerationStatus(): Promise<number> {
    const response = await fetch('/api/generate', {
        headers: { Accept: 'application/json' },
    });
    const payload = await parseResponse(response);
    if (typeof payload.remaining !== 'number') {
        throw new Error('Generation status returned an invalid response.');
    }
    return payload.remaining;
}

export async function generateImage(prompt: string): Promise<GenerationResponse> {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    const payload = await parseResponse(response);
    if (
        typeof payload.base64 !== 'string'
        || typeof payload.mimeType !== 'string'
        || typeof payload.remaining !== 'number'
    ) {
        throw new Error('Image generation returned an invalid response.');
    }

    return {
        base64: payload.base64,
        mimeType: payload.mimeType,
        remaining: payload.remaining,
    };
}
