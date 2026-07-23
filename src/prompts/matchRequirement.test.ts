// What this file is: unit tests for the matching-verification prompt and its
// response guard -- confirms candidate ids/text are embedded in the prompt
// and the guard accepts/rejects the expected shapes.
// In plain terms: tests proving we ask the AI correctly and only trust
// well-shaped answers.

import { describe, expect, it } from 'vitest';
import { buildMatchRequirementPrompt, isMatchVerification } from './matchRequirement';

describe('buildMatchRequirementPrompt', () => {
  it('embeds the requirement and each candidate id/label/text', () => {
    const prompt = buildMatchRequirementPrompt('3+ years with Java', [
      { id: 'skills-abc', text: 'Java', sourceLabel: 'Skills' },
    ]);
    expect(prompt).toContain('3+ years with Java');
    expect(prompt).toContain('skills-abc');
    expect(prompt).toContain('Skills');
    expect(prompt).toContain('"Java"');
  });
});

describe('isMatchVerification', () => {
  it('accepts a full match', () => {
    expect(isMatchVerification({ atomIds: ['a'], status: 'full' })).toBe(true);
  });

  it('accepts a partial match', () => {
    expect(isMatchVerification({ atomIds: ['a'], status: 'partial' })).toBe(true);
  });

  it('accepts an empty atomIds array', () => {
    expect(isMatchVerification({ atomIds: [], status: 'full' })).toBe(true);
  });

  it('rejects a missing status', () => {
    expect(isMatchVerification({ atomIds: [] })).toBe(false);
  });

  it('rejects an invalid status value', () => {
    expect(isMatchVerification({ atomIds: [], status: 'yes' })).toBe(false);
  });

  it('rejects atomIds that is a bare string instead of an array', () => {
    expect(isMatchVerification({ atomIds: 'a', status: 'full' })).toBe(false);
  });
});
