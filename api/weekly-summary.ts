import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAuthorised } from '../server/auth.js';
import { redisCommand } from '../server/redis.js';
import { notify, queryUsage, summariseUsage } from '../server/usage.js';

export const config = { maxDuration: 60 };

/** Send one summary for the previous complete Monday-to-Monday UTC week. */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store');
    if (!isAuthorised(request)) {
        response.writeHead(401).end();
        return;
    }
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        response.writeHead(405).end();
        return;
    }
    if (!process.env.NTFY_TOPIC) {
        response.end('Notifications disabled');
        return;
    }
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() - (end.getUTCDay() + 6) % 7);
    const start = new Date(end.getTime() - 7 * 86400000);
    const key = `zx-spectrum:weekly-summary:${end.toISOString().slice(0, 10)}`;
    let locked = false;
    try {
        locked = await redisCommand<string | null>(['SET', key, 'sending', 'NX', 'EX', 120]) === 'OK';
        if (!locked) {
            response.end('Summary already sent or in progress');
            return;
        }
        const summary = summariseUsage(await queryUsage(start, end));
        await notify('ZX Spectrum weekly usage', `${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)} (UTC, end exclusive): ${summary.succeeded} successful, ${summary.failed} failed, ${summary.canceled} cancelled. Known estimated cost: $${summary.estimatedCostUsd.toFixed(4)} USD; ${summary.costUnavailable} records without cost information. Provider prediction time: ${summary.predictSeconds.toFixed(2)} seconds.`);
        await redisCommand(['SET', key, 'sent', 'EX', 90 * 86400]);
        response.end('Summary sent');
    } catch {
        if (locked) await redisCommand(['DEL', key]).catch(() => undefined);
        console.error('Weekly usage summary failed.');
        response.writeHead(503).end('Summary temporarily unavailable');
    }
}
