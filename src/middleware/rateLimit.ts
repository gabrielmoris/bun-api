import type { BunRequest } from 'bun';
import { runRateLimitHits } from '../repositories/rateLimitRepository';
import { withCors } from './cors';
import { ApiErrorCode } from '../types/errorType';

export const LIMIT = 100; // max requests
export const WINDOW_MS = 60_000; // per 60 seconds

function getClientId(req: BunRequest): string {
  return (
    req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}

function getScope(req: BunRequest): string {
  return `${req.method}:${new URL(req.url).pathname}`;
}

export function withRateLimit(handler: (req: BunRequest) => Response | Promise<Response>) {
  return async (req: BunRequest): Promise<Response> => {
    const clientId = getClientId(req);
    const scope = getScope(req);
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const rateLimitHits = runRateLimitHits(scope, clientId, windowStart, LIMIT, WINDOW_MS, now);

    const { allowed, retryAfter, currentCount } = rateLimitHits();

    if (!allowed) {
      const baseResponse = Response.json(
        {
          error: {
            code: ApiErrorCode.RATE_LIMITED,
            message: 'Too many requests',
            details: [],
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(LIMIT),
            'X-RateLimit-Remaining': '0',
          },
        }
      );

      return withCors(req, baseResponse);
    }

    const res = await handler(req);
    const headers = new Headers(res.headers);
    headers.set('X-RateLimit-Limit', String(LIMIT));
    headers.set('X-RateLimit-Remaining', String(Math.max(0, LIMIT - (currentCount || 0))));

    return withCors(
      req,
      new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      })
    );
  };
}
