// What this file is: a minimal Vitest smoke test that checks SCHEMA_VERSION
// is a valid number, proving the test runner and the shared types module
// both load correctly. Real coverage (LaTeX escaping, export/import, schema
// validation) arrives in later phases per CLAUDE.md.
// In plain terms: a tiny test just to prove the testing tool itself works.

import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from './index';

describe('shared types', () => {
  it('exposes a positive integer schema version', () => {
    expect(Number.isInteger(SCHEMA_VERSION)).toBe(true);
    expect(SCHEMA_VERSION).toBeGreaterThan(0);
  });
});
