// What this file is: unit tests for retrieveCandidates -- confirms
// synonym-aware overlap scoring surfaces plausible atoms (including the
// motivating "Java" skill / "JVM ecosystem" requirement case) and returns
// nothing when there's no plausible overlap.
// In plain terms: tests proving the cheap local matching step finds the
// right profile evidence to hand to the LLM for verification.

import { describe, expect, it } from 'vitest';
import { retrieveCandidates } from './retrieval';
import type { ProfileAtom } from '../../types';

function atom(overrides: Partial<ProfileAtom>): ProfileAtom {
  return { id: 'a', source: 'skills', sourceLabel: 'Skills', text: '', ...overrides };
}

describe('retrieveCandidates', () => {
  it('matches a requirement phrased with a synonym not literally in the profile', () => {
    const atoms = [atom({ id: 'java', text: 'Java' }), atom({ id: 'python', text: 'Python' })];
    const candidates = retrieveCandidates('Solid experience with Java and the JVM ecosystem', atoms);
    expect(candidates.map((c) => c.atom.id)).toContain('java');
    expect(candidates.map((c) => c.atom.id)).not.toContain('python');
  });

  it('matches a multi-word synonym phrase (Spring MVC vs Spring)', () => {
    const atoms = [atom({ id: 'spring', text: 'Spring' })];
    const candidates = retrieveCandidates('3+ years with Spring MVC', atoms);
    expect(candidates.map((c) => c.atom.id)).toContain('spring');
  });

  it('returns nothing when no atom clears the score floor', () => {
    const atoms = [atom({ text: 'Photoshop' }), atom({ text: 'Illustrator' })];
    const candidates = retrieveCandidates('Experience with Kubernetes and Docker', atoms);
    expect(candidates).toEqual([]);
  });

  it('caps results at k and sorts by descending score', () => {
    const atoms = Array.from({ length: 10 }, (_, i) => atom({ id: `js-${i}`, text: 'JavaScript' }));
    const candidates = retrieveCandidates('JavaScript required', atoms, 3);
    expect(candidates).toHaveLength(3);
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i - 1].score).toBeGreaterThanOrEqual(candidates[i].score);
    }
  });
});
