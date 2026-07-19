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

export async function loadProfile(): Promise<Profile> {
  const existing = await db.profiles.get(DEFAULT_PROFILE_ID);
  return existing ?? emptyProfile();
}

export async function saveProfile(profile: Profile): Promise<void> {
  await db.profiles.put(profile);
}
