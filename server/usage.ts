import { redisCommand } from './redis.js';

const usageKey = 'zx-spectrum:usage:v1';

export interface UsageRecord {
    predictionId: string;
    completedAt: string;
    provider: 'replicate';
    model: string;
    status: string;
    predictSeconds: number | null;
    estimatedCostUsd: number | null;
}

/** Publish operational metadata when notifications are configured. */
export async function notify(title: string, message: string): Promise<boolean> {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) return false;
    const url = new URL(process.env.NTFY_SERVER_URL || 'https://ntfy.sh');
    if (url.protocol !== 'https:' || url.username || url.password) {
        throw new Error('Invalid notification server configuration.');
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(process.env.NTFY_TOKEN ? { Authorization: `Bearer ${process.env.NTFY_TOKEN}` } : {}),
        },
        body: JSON.stringify({ topic, title, message }),
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
    });
    if (!response.ok) throw new Error('Notification delivery failed.');
    return true;
}

/** Store each terminal prediction once, without prompt or image content. */
export async function trackGeneration(prediction: {
    id: string;
    status: string;
    metrics?: { predict_time?: number };
}): Promise<void> {
    try {
        if (!prediction.id) throw new Error('Missing prediction reference.');
        const configuredCost = process.env.GENERATION_ESTIMATED_COST_USD;
        const cost = configuredCost?.trim() ? Number(configuredCost) : NaN;
        const seconds = prediction.metrics?.predict_time;
        const record: UsageRecord = {
            predictionId: prediction.id,
            completedAt: new Date().toISOString(),
            provider: 'replicate',
            model: 'black-forest-labs/flux-schnell',
            status: prediction.status,
            predictSeconds: Number.isFinite(seconds) && seconds >= 0 ? seconds : null,
            estimatedCostUsd: prediction.status === 'succeeded' && Number.isFinite(cost) && cost >= 0 ? cost : null,
        };
        const inserted = await redisCommand<number>([
            'EVAL',
            `if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return 0 end
             redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
             redis.call('ZADD', KEYS[2], ARGV[3], ARGV[1])
             return 1`,
            2, usageKey, `${usageKey}:dates`, record.predictionId, JSON.stringify(record), Date.parse(record.completedAt),
        ]);
        if (inserted && record.status === 'succeeded') {
            try {
                await notify('ZX Spectrum image generated', `An image was generated at ${record.completedAt}. Estimated cost: ${record.estimatedCostUsd === null ? 'unavailable' : `$${record.estimatedCostUsd.toFixed(4)} USD`}.`);
            } catch {
                console.error('Image notification failed.');
            }
        }
    } catch {
        console.error('Generation usage tracking failed.');
    }
}

/** Query a half-open UTC date range, with a bounded response. */
export async function queryUsage(start: Date, end: Date): Promise<UsageRecord[]> {
    const ids = await redisCommand<string[]>(['ZRANGEBYSCORE', `${usageKey}:dates`, start.getTime(), `(${end.getTime()}`, 'LIMIT', 0, 10001]);
    if (ids.length > 10000) throw new Error('Usage range is too large.');
    if (!ids.length) return [];
    const records = await redisCommand<Array<string | null>>(['HMGET', usageKey, ...ids]);
    return records.filter((value): value is string => value !== null).map(value => JSON.parse(value) as UsageRecord);
}

/** Summarise known estimates separately from records without cost information. */
export function summariseUsage(records: UsageRecord[]) {
    return {
        total: records.length,
        succeeded: records.filter(record => record.status === 'succeeded').length,
        failed: records.filter(record => record.status === 'failed').length,
        canceled: records.filter(record => record.status === 'canceled').length,
        estimatedCostUsd: records.reduce((total, record) => total + (record.estimatedCostUsd ?? 0), 0),
        costUnavailable: records.filter(record => record.estimatedCostUsd === null).length,
        predictSeconds: records.reduce((total, record) => total + (record.predictSeconds ?? 0), 0),
    };
}
