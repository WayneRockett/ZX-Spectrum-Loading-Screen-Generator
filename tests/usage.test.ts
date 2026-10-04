import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { trackGeneration, queryUsage, summariseUsage } from '../server/usage.js';
import { isAuthorised } from '../server/auth.js';
import type { IncomingMessage } from 'node:http';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
});

function configureStore() {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    delete process.env.NTFY_TOPIC;
}

test('stores operational metadata only and tolerates missing notifications', async () => {
    configureStore();
    process.env.GENERATION_ESTIMATED_COST_USD = '0.003';
    const commands: unknown[][] = [];
    globalThis.fetch = async (_url, options) => {
        commands.push(JSON.parse(String(options?.body)));
        return Response.json({ result: 1 });
    };
    await trackGeneration({ id: 'prediction-1', status: 'succeeded', metrics: { predict_time: 0.8 }, prompt: 'private prompt' } as Parameters<typeof trackGeneration>[0]);
    assert.equal(commands.length, 1);
    const record = JSON.parse(String(commands[0][6]));
    assert.deepEqual(Object.keys(record).sort(), ['completedAt', 'estimatedCostUsd', 'model', 'predictSeconds', 'predictionId', 'provider', 'status']);
    assert.equal(record.estimatedCostUsd, 0.003);
    assert.equal(JSON.stringify(commands).includes('private prompt'), false);
});

test('notification failure does not reject tracking and duplicate predictions do not notify', async () => {
    configureStore();
    process.env.NTFY_TOPIC = 'test-topic';
    let inserted = 1;
    let notifications = 0;
    globalThis.fetch = async (url) => {
        if (String(url).includes('redis.example')) return Response.json({ result: inserted });
        notifications++;
        return new Response('', { status: 500 });
    };
    await assert.doesNotReject(trackGeneration({ id: 'prediction-1', status: 'succeeded' }));
    inserted = 0;
    await trackGeneration({ id: 'prediction-1', status: 'succeeded' });
    assert.equal(notifications, 1);
});

test('queries an inclusive start and exclusive end and totals unknown cost separately', async () => {
    configureStore();
    const commands: unknown[][] = [];
    const record = { predictionId: 'p1', completedAt: '2026-10-01T00:00:00Z', provider: 'replicate', model: 'flux', status: 'succeeded', predictSeconds: 2, estimatedCostUsd: null };
    globalThis.fetch = async (_url, options) => {
        commands.push(JSON.parse(String(options?.body)));
        return Response.json({ result: commands.length === 1 ? ['p1'] : [JSON.stringify(record)] });
    };
    const start = new Date('2026-10-01');
    const end = new Date('2026-10-02');
    const records = await queryUsage(start, end);
    assert.equal(commands[0][2], start.getTime());
    assert.equal(commands[0][3], `(${end.getTime()}`);
    assert.deepEqual(summariseUsage(records), { total: 1, succeeded: 1, failed: 0, canceled: 0, estimatedCostUsd: 0, costUnavailable: 1, predictSeconds: 2 });
});

test('operational endpoints fail closed without a valid secret', () => {
    const request = { headers: { authorization: 'Bearer test-secret' } } as IncomingMessage;
    delete process.env.CRON_SECRET;
    assert.equal(isAuthorised(request), false);
    process.env.CRON_SECRET = 'test-secret';
    assert.equal(isAuthorised(request), true);
    request.headers.authorization = 'Bearer incorrect';
    assert.equal(isAuthorised(request), false);
});
