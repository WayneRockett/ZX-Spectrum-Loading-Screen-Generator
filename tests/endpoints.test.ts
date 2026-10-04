import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import weeklyHandler from '../api/weekly-summary.js';
import usageHandler from '../api/usage.js';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
});

function responseMock() {
    const state = { status: 200, body: '' };
    const response = {
        setHeader() {},
        writeHead(status: number) { state.status = status; return response; },
        end(body = '') { state.body = body; },
    };
    return { state, response: response as unknown as ServerResponse };
}

function request(url = '/api/weekly-summary') {
    process.env.CRON_SECRET = 'test-secret';
    return { method: 'GET', url, headers: { authorization: 'Bearer test-secret' } } as IncomingMessage;
}

function configureNotifications() {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.NTFY_TOPIC = 'test-topic';
}

test('weekly summary skips duplicate invocations without publishing', async () => {
    configureNotifications();
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ result: null }); };
    const { response, state } = responseMock();
    await weeklyHandler(request(), response);
    assert.equal(calls, 1);
    assert.match(state.body, /already sent/);
});

test('weekly summary publishes an empty week and marks it sent', async () => {
    configureNotifications();
    const commands: unknown[][] = [];
    let message = '';
    globalThis.fetch = async (url, options) => {
        if (String(url).includes('redis.example')) {
            const command = JSON.parse(String(options?.body));
            commands.push(command);
            return Response.json({ result: command[0] === 'ZRANGEBYSCORE' ? [] : 'OK' });
        }
        message = JSON.parse(String(options?.body)).message;
        return Response.json({ id: 'notification' });
    };
    const { response, state } = responseMock();
    await weeklyHandler(request(), response);
    assert.equal(state.status, 200);
    assert.match(message, /0 successful/);
    assert.equal(commands.at(-1)?.[2], 'sent');
});

test('failed summary releases the lock to allow a retry', async () => {
    configureNotifications();
    const commands: unknown[][] = [];
    globalThis.fetch = async (url, options) => {
        if (!String(url).includes('redis.example')) return new Response('', { status: 500 });
        const command = JSON.parse(String(options?.body));
        commands.push(command);
        return Response.json({ result: command[0] === 'ZRANGEBYSCORE' ? [] : 'OK' });
    };
    const { response, state } = responseMock();
    await weeklyHandler(request(), response);
    assert.equal(state.status, 503);
    assert.equal(commands.at(-1)?.[0], 'DEL');
});

test('usage endpoint rejects unauthorised and invalid ranges without querying Redis', async () => {
    globalThis.fetch = async () => { throw new Error('Unexpected store access'); };
    const unauthorised = responseMock();
    const req = request('/api/usage');
    req.headers.authorization = 'Bearer wrong';
    await usageHandler(req, unauthorised.response);
    assert.equal(unauthorised.state.status, 401);
    const invalid = responseMock();
    await usageHandler(request('/api/usage?start=2026-10-02&end=2026-10-01'), invalid.response);
    assert.equal(invalid.state.status, 400);
});
