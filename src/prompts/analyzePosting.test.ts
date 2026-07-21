// What this file is: unit tests for the posting-analysis prompt builder and
// response validator -- checks that isJobAnalysis accepts valid shapes and
// rejects malformed ones, that profile serialization includes the right
// content and omits writing samples, and that long inputs get truncated
// before being sent.
// In plain terms: tests proving the "analyze this job posting" prompt is
// built correctly and that we correctly recognize a good vs. bad AI reply.

import { describe, expect, it } from 'vitest';
import {
  MAX_POSTING_CHARS,
  buildAnalyzePostingPrompt,
  isJobAnalysis,
  serializeProfileForPrompt,
} from './analyzePosting';
import type { JobAnalysis, Profile } from '../types';

function emptyProfile(): Profile {
  return {
    id: 'default',
    contact: { name: '', email: '', links: [] },
    summary: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    writingSamples: [],
  };
}

const validAnalysis: JobAnalysis = {
  roleSummary: 'A frontend role.',
  requirements: ['5+ years React'],
  keywords: ['React', 'TypeScript'],
  matches: [{ requirement: '5+ years React', profileEvidence: ['Led React rewrite'] }],
  gaps: ['Kubernetes'],
};

describe('isJobAnalysis', () => {
  it('accepts a fully-populated valid analysis', () => {
    expect(isJobAnalysis(validAnalysis)).toBe(true);
  });

  it('accepts an analysis with all-empty list fields', () => {
    expect(
      isJobAnalysis({ roleSummary: '', requirements: [], keywords: [], matches: [], gaps: [] }),
    ).toBe(true);
  });

  it('rejects null, a string, and an array', () => {
    expect(isJobAnalysis(null)).toBe(false);
    expect(isJobAnalysis('nope')).toBe(false);
    expect(isJobAnalysis([])).toBe(false);
  });

  it('rejects a missing or non-string roleSummary', () => {
    const { roleSummary: _omit, ...rest } = validAnalysis;
    expect(isJobAnalysis(rest)).toBe(false);
    expect(isJobAnalysis({ ...validAnalysis, roleSummary: 42 })).toBe(false);
  });

  it('rejects non-array list fields', () => {
    expect(isJobAnalysis({ ...validAnalysis, requirements: 'not an array' })).toBe(false);
  });

  it('rejects a list field with a non-string element', () => {
    expect(isJobAnalysis({ ...validAnalysis, requirements: ['a', 3] })).toBe(false);
  });

  it('rejects a match missing profileEvidence', () => {
    expect(isJobAnalysis({ ...validAnalysis, matches: [{ requirement: 'x' }] })).toBe(false);
  });

  it('rejects a match whose profileEvidence is a string, not an array', () => {
    expect(
      isJobAnalysis({
        ...validAnalysis,
        matches: [{ requirement: 'x', profileEvidence: 'not an array' }],
      }),
    ).toBe(false);
  });
});

describe('serializeProfileForPrompt', () => {
  it('includes experience company/title/bullets and skills', () => {
    const profile: Profile = {
      ...emptyProfile(),
      skills: ['TypeScript', 'Go'],
      experience: [
        {
          company: 'Acme',
          title: 'Senior Engineer',
          startMonth: 'March',
          startYear: '2021',
          current: false,
          bullets: ['Led the React rewrite'],
        },
      ],
    };
    const text = serializeProfileForPrompt(profile);
    expect(text).toContain('Acme');
    expect(text).toContain('Senior Engineer');
    expect(text).toContain('Led the React rewrite');
    expect(text).toContain('TypeScript');
  });

  it('omits writing samples', () => {
    const profile: Profile = { ...emptyProfile(), writingSamples: ['A very unique sentence.'] };
    expect(serializeProfileForPrompt(profile)).not.toContain('A very unique sentence.');
  });

  it('omits empty sections entirely', () => {
    const text = serializeProfileForPrompt(emptyProfile());
    expect(text).not.toContain('EXPERIENCE:');
    expect(text).not.toContain('SKILLS:');
    expect(text).toBe('');
  });
});

describe('buildAnalyzePostingPrompt', () => {
  it('includes the posting text, profile evidence, and instructions', () => {
    const profile: Profile = {
      ...emptyProfile(),
      experience: [{ company: 'Acme', title: 'Engineer', startYear: '2020', current: false, bullets: [] }],
    };
    const prompt = buildAnalyzePostingPrompt('We need a React developer.', profile);
    expect(prompt).toContain('We need a React developer.');
    expect(prompt).toContain('Acme');
    expect(prompt).toContain('roleSummary');
    expect(prompt).toContain('requirements');
    expect(prompt).toContain('keywords');
    expect(prompt).toContain('matches');
    expect(prompt).toContain('gaps');
    expect(prompt).toMatch(/copied\s+word-for-word/);
  });

  it('truncates a very long posting and drops its tail', () => {
    const longPosting = 'A'.repeat(MAX_POSTING_CHARS) + 'TAIL_MARKER';
    const prompt = buildAnalyzePostingPrompt(longPosting, emptyProfile());
    expect(prompt).toContain('[truncated]');
    expect(prompt).not.toContain('TAIL_MARKER');
  });

  it('keeps the prompt well under the proxy body limit for pathological input', () => {
    const hugePosting = 'x'.repeat(1_000_000);
    const hugeProfile: Profile = {
      ...emptyProfile(),
      experience: Array.from({ length: 200 }, (_, i) => ({
        company: `Company ${i}`,
        title: `Title ${i}`,
        startYear: '2020',
        current: false,
        bullets: [`Bullet ${i}`],
      })),
    };
    const prompt = buildAnalyzePostingPrompt(hugePosting, hugeProfile);
    expect(new TextEncoder().encode(prompt).length).toBeLessThan(60_000);
  });
});
