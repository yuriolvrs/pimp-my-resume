// What this file is: small helper functions for loading and saving the
// single user profile to Dexie's `profiles` table.
// In plain terms: the code that reads and saves your profile info to your
// browser's storage.

import { db } from './db';
import type { Profile } from '../types';

/** v1 supports a single local profile, addressed by a fixed id. */
export const DEFAULT_PROFILE_ID = 'default';

export function emptyProfile(): Profile {
  return {
    id: DEFAULT_PROFILE_ID,
    contact: { name: '', email: '', links: [] },
    summary: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    writingSamples: [],
  };
}

// Skills used to be grouped ({ category, items }); flattens any
// still-stored profile from before that shape changed to a plain string list.
function normalizeSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return skills.flatMap((skill) => {
    if (typeof skill === 'string') return [skill];
    const items = (skill as { items?: unknown } | null)?.items;
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : [];
  });
}

export async function loadProfile(): Promise<Profile> {
  const existing = await db.profiles.get(DEFAULT_PROFILE_ID);
  if (!existing) return emptyProfile();
  return { ...existing, skills: normalizeSkills(existing.skills) };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await db.profiles.put(profile);
}

// Whether the profile has enough content to be worth comparing against a job
// posting. Used to gate the "Analyze" action so a blank profile can't be sent
// to the LLM (it would only ever produce gaps, never matches).
export function hasProfileContent(profile: Profile): boolean {
  return (
    profile.summary.trim() !== '' ||
    profile.skills.length > 0 ||
    profile.experience.length > 0 ||
    profile.projects.length > 0 ||
    profile.education.length > 0
  );
}
