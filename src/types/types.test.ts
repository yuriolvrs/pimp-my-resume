import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from './index';

// Smoke test: proves the Vitest harness runs and the shared types module loads.
// Real unit tests (LaTeX escaping/filling, export/import, schema validation)
// arrive in later phases per CLAUDE.md.
describe('shared types', () => {
  it('exposes a positive integer schema version', () => {
    expect(Number.isInteger(SCHEMA_VERSION)).toBe(true);
    expect(SCHEMA_VERSION).toBeGreaterThan(0);
  });
});
