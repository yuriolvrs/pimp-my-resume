// What this file is: unit tests for lib.ts's pure functions -- CORS
// allow/deny decisions, oversized-payload detection, and the rate
// limiter's allow/block/reset behavior over time.
// In plain terms: tests proving the proxy's basic protections actually
// work as intended.

import { describe, expect, it } from 'vitest';
import { buildCorsHeaders, isAllowedOrigin, isOversized, RateLimiter } from './lib';

describe('isAllowedOrigin', () => {
  it('allows an origin in the allowlist', () => {
    expect(isAllowedOrigin('http://localhost:5173', ['http://localhost:5173'])).toBe(true);
  });

  it('rejects an origin not in the allowlist', () => {
    expect(isAllowedOrigin('http://evil.example', ['http://localhost:5173'])).toBe(false);
  });

  it('rejects a null origin', () => {
    expect(isAllowedOrigin(null, ['http://localhost:5173'])).toBe(false);
  });
});

describe('buildCorsHeaders', () => {
  it('includes Access-Control-Allow-Origin for an allowed origin', () => {
    const result = buildCorsHeaders('http://localhost:5173', ['http://localhost:5173']);
    expect(result.allowed).toBe(true);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
  });

  it('omits Access-Control-Allow-Origin for a disallowed origin', () => {
    const result = buildCorsHeaders('http://evil.example', ['http://localhost:5173']);
    expect(result.allowed).toBe(false);
    expect(result.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('isOversized', () => {
  it('accepts a body under the limit', () => {
    expect(isOversized('a'.repeat(100), 1000)).toBe(false);
  });

  it('rejects a body over the limit', () => {
    expect(isOversized('a'.repeat(1001), 1000)).toBe(true);
  });
});

describe('RateLimiter', () => {
  it('allows requests up to the limit within the window', () => {
    const limiter = new RateLimiter(60_000, 3);
    expect(limiter.check('ip1', 0)).toBe(true);
    expect(limiter.check('ip1', 1)).toBe(true);
    expect(limiter.check('ip1', 2)).toBe(true);
  });

  it('blocks requests once the limit is exceeded within the window', () => {
    const limiter = new RateLimiter(60_000, 3);
    limiter.check('ip1', 0);
    limiter.check('ip1', 1);
    limiter.check('ip1', 2);
    expect(limiter.check('ip1', 3)).toBe(false);
  });

  it('resets the count once the window has elapsed', () => {
    const limiter = new RateLimiter(60_000, 1);
    expect(limiter.check('ip1', 0)).toBe(true);
    expect(limiter.check('ip1', 30_000)).toBe(false);
    expect(limiter.check('ip1', 60_001)).toBe(true);
  });

  it('tracks separate keys independently', () => {
    const limiter = new RateLimiter(60_000, 1);
    expect(limiter.check('ip1', 0)).toBe(true);
    expect(limiter.check('ip2', 0)).toBe(true);
  });
});
