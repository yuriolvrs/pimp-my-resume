// What this file is: the Worker's entry point -- the single POST /generate
// endpoint. Checks CORS/rate-limit/payload-size (via lib.ts), then forwards
// the request body to the configured LLM provider with the secret key
// injected server-side, and relays the provider's response back unchanged.
// Stateless: no logging or storage of request/response bodies (PRD §8).
// In plain terms: the proxy server the app talks to instead of calling the
// AI provider directly, so the app never has to hold an API key.

import { buildCorsHeaders, isOversized, RateLimiter } from './lib';

export interface Env {
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  ALLOWED_ORIGINS: string;
  LLM_API_KEY: string;
}

const MAX_BODY_BYTES = 100_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
// A single "re-run matching" pass fires one verification call per
// requirement (plus a retry on any malformed JSON reply), so a posting with
// 15+ requirements can burst past 20 requests/min on its own -- raised to
// give normal use headroom while still bounding abuse.
const RATE_LIMIT_MAX_REQUESTS = 60;

const rateLimiter = new RateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const allowlist = env.ALLOWED_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cors = buildCorsHeaders(origin, allowlist);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors.headers });
    }

    if (!cors.allowed) {
      return new Response('Forbidden origin', { status: 403, headers: cors.headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/generate' || request.method !== 'POST') {
      return new Response('Not found', { status: 404, headers: cors.headers });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!rateLimiter.check(ip)) {
      return new Response('Rate limit exceeded', { status: 429, headers: cors.headers });
    }

    const bodyText = await request.text();
    if (isOversized(bodyText, MAX_BODY_BYTES)) {
      return new Response('Payload too large', { status: 413, headers: cors.headers });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(bodyText) as Record<string, unknown>;
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: cors.headers });
    }

    const upstream = await fetch(`${env.LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      // The proxy always sets the model itself -- the client can't choose
      // or spoof a different one.
      body: JSON.stringify({ ...body, model: env.LLM_MODEL }),
    });

    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  },
};
