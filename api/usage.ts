import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAuthorised } from '../server/auth.js';
import { queryUsage, summariseUsage } from '../server/usage.js';

/** Return usage metadata for an authenticated date-range request. */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json');
    if (!isAuthorised(request)) {
        response.writeHead(401).end();
        return;
    }
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        response.writeHead(405).end();
        return;
    }
    const params = new URL(request.url || '/', 'https://localhost').searchParams;
    const start = new Date(params.get('start') || '');
    const end = new Date(params.get('end') || '');
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || end.getTime() - start.getTime() > 31 * 86400000) {
        response.writeHead(400).end(JSON.stringify({ error: 'Supply a valid start and end within 31 days.' }));
        return;
    }
    try {
        const records = await queryUsage(start, end);
        response.end(JSON.stringify({ start, end, summary: summariseUsage(records), records }));
    } catch {
        response.writeHead(503).end(JSON.stringify({ error: 'Usage is temporarily unavailable.' }));
    }
}
