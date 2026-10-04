import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

/** Require a server-side bearer secret for operational endpoints. */
export function isAuthorised(request: IncomingMessage): boolean {
    const secret = process.env.CRON_SECRET;
    const actual = request.headers.authorization;
    if (!secret || !actual) return false;
    const expected = Buffer.from(`Bearer ${secret}`);
    const supplied = Buffer.from(actual);
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
