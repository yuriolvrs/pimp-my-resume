// What this file is: unit tests for normalizeSkills -- the migration logic
// that coerces whatever shape skills were saved in (an old flat string list,
// or today's category-grouped shape) into today's SkillGroup[] shape on
// load. Real data-safety stakes here: existing users already have flat
// skills lists saved from before categories were reintroduced.
// In plain terms: tests proving old saved skill lists load correctly under
// the new category-grouped shape.

import { describe, expect, it } from 'vitest';
import { normalizeSkills } from './profileStore';

describe('normalizeSkills', () => {
  it('wraps an old flat string list into one "Skills" category', () => {
    expect(normalizeSkills(['Java', 'TypeScript'])).toEqual([{ category: 'Skills', items: ['Java', 'TypeScript'] }]);
  });

  it('drops blank entries from an old flat string list', () => {
    expect(normalizeSkills(['Java', '  ', ''])).toEqual([{ category: 'Skills', items: ['Java'] }]);
  });

  it('returns an empty array for an empty or all-blank flat list', () => {
    expect(normalizeSkills([])).toEqual([]);
    expect(normalizeSkills(['', '  '])).toEqual([]);
  });

  it('passes through an already-grouped shape unchanged', () => {
    const grouped = [{ category: 'Languages', items: ['Java', 'Python'] }];
    expect(normalizeSkills(grouped)).toEqual(grouped);
  });

  it('filters non-string items out of a group and defaults a missing category', () => {
    const malformed = [{ category: 42, items: ['Java', 7, null] }];
    expect(normalizeSkills(malformed)).toEqual([{ category: '', items: ['Java'] }]);
  });

  it('returns an empty array for non-array input', () => {
    expect(normalizeSkills(null)).toEqual([]);
    expect(normalizeSkills(undefined)).toEqual([]);
    expect(normalizeSkills('nope')).toEqual([]);
  });
});
