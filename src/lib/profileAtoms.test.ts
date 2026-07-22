// What this file is: unit tests for buildProfileAtoms -- confirms each
// profile section is indexed into atoms with the right source/label, blank
// entries are skipped, and ids are stable across re-derivation.
// In plain terms: tests proving the profile gets broken down into evidence
// pieces correctly.

import { describe, expect, it } from 'vitest';
import { buildProfileAtoms } from './profileAtoms';
import { emptyProfile } from './profileStore';
import type { Profile } from '../types';

function profile(overrides: Partial<Profile>): Profile {
  return { ...emptyProfile(), ...overrides };
}

describe('buildProfileAtoms', () => {
  it('indexes one atom per skill', () => {
    const atoms = buildProfileAtoms(profile({ skills: ['Java', 'TypeScript'] }));
    expect(atoms).toEqual([
      expect.objectContaining({ source: 'skills', sourceLabel: 'Skills', text: 'Java' }),
      expect.objectContaining({ source: 'skills', sourceLabel: 'Skills', text: 'TypeScript' }),
    ]);
  });

  it('labels experience bullets with role and company', () => {
    const atoms = buildProfileAtoms(
      profile({
        experience: [
          {
            company: 'Acme Co',
            title: 'Software Engineering Intern',
            current: false,
            bullets: ['Built a thing', 'Shipped another thing'],
          },
        ],
      }),
    );
    expect(atoms).toEqual([
      expect.objectContaining({
        source: 'experience',
        sourceLabel: 'Experience: Software Engineering Intern, Acme Co',
        text: 'Built a thing',
      }),
      expect.objectContaining({
        source: 'experience',
        sourceLabel: 'Experience: Software Engineering Intern, Acme Co',
        text: 'Shipped another thing',
      }),
    ]);
  });

  it('indexes project bullets, education details, and additionalInfo', () => {
    const atoms = buildProfileAtoms(
      profile({
        projects: [{ name: 'Widget', description: '', bullets: ['Used React'], links: [] }],
        education: [
          {
            school: 'State U',
            degree: 'BS Computer Science',
            current: false,
            details: ['Dean\'s list'],
          },
        ],
        additionalInfo: ['Won a hackathon'],
      }),
    );
    expect(atoms.map((a) => a.source)).toEqual(['projects', 'education', 'additional']);
    expect(atoms[0]).toMatchObject({ sourceLabel: 'Project: Widget', text: 'Used React' });
    expect(atoms[1]).toMatchObject({ sourceLabel: 'Education: BS Computer Science, State U', text: "Dean's list" });
    expect(atoms[2]).toMatchObject({ sourceLabel: 'Additional information', text: 'Won a hackathon' });
  });

  it('skips blank entries', () => {
    const atoms = buildProfileAtoms(profile({ skills: ['Java', '   ', ''] }));
    expect(atoms).toHaveLength(1);
  });

  it('produces stable ids across re-derivation of unchanged content', () => {
    const p = profile({ skills: ['Java'] });
    const first = buildProfileAtoms(p);
    const second = buildProfileAtoms(p);
    expect(first[0].id).toBe(second[0].id);
  });

  it('gives distinct ids to duplicate text within the same source', () => {
    const atoms = buildProfileAtoms(profile({ skills: ['Java', 'Java'] }));
    expect(atoms[0].id).not.toBe(atoms[1].id);
  });
});
