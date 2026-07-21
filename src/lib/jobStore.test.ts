// What this file is: unit tests for jobStore.ts's pure postingLabel helper
// (the only part of this module that doesn't touch Dexie, so it's the only
// part covered by a fast unit test; the Dexie-touching functions are thin
// wrappers verified manually, same convention as profileStore.ts).
// In plain terms: tests proving the "what do we call this saved posting"
// logic picks a sensible label.

import { describe, expect, it } from 'vitest';
import { postingLabel } from './jobStore';
import type { JobPosting } from '../types';

function posting(overrides: Partial<JobPosting>): JobPosting {
  return { id: 'x', createdAt: 0, rawText: '', ...overrides };
}

describe('postingLabel', () => {
  it('prefers the analysis role summary', () => {
    const p = posting({
      rawText: 'Some raw text',
      analysis: {
        roleSummary: 'Senior Frontend Engineer',
        requirements: [],
        keywords: [],
        matches: [],
        gaps: [],
      },
    });
    expect(postingLabel(p)).toBe('Senior Frontend Engineer');
  });

  it('falls back to the first non-empty line of rawText', () => {
    const p = posting({ rawText: '\n  \nApply now: Backend Engineer\nMore details below.' });
    expect(postingLabel(p)).toBe('Apply now: Backend Engineer');
  });

  it('falls back to "Untitled posting" for blank text and no analysis', () => {
    expect(postingLabel(posting({ rawText: '   \n  ' }))).toBe('Untitled posting');
  });

  it('truncates a long label to 80 chars ending in an ellipsis', () => {
    const longLine = 'A'.repeat(200);
    const label = postingLabel(posting({ rawText: longLine }));
    expect(label.length).toBe(81);
    expect(label.endsWith('…')).toBe(true);
  });
});
