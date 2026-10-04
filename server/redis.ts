export async function redisCommand<T>(command: Array<string | number>): Promise<T> {
    const redisUrl = (
        process.env.UPSTASH_REDIS_REST_URL
        || process.env.KV_REST_API_URL
    )?.replace(/\/$/, '');
    const redisToken = (
        process.env.UPSTASH_REDIS_REST_TOKEN
        || process.env.KV_REST_API_TOKEN
    );

    if (!redisUrl || !redisToken) {
        const availableNames = [
            'UPSTASH_REDIS_REST_URL',
            'UPSTASH_REDIS_REST_TOKEN',
            'KV_REST_API_URL',
            'KV_REST_API_TOKEN',
        ].filter((name) => Boolean(process.env[name]));
        throw new Error(
            `Rate limiting is not configured. Available credential variables: ${
                availableNames.length > 0 ? availableNames.join(', ') : 'none'
            }.`,
        );
    }

    const response = await fetch(redisUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(5000),
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

