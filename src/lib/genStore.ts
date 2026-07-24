// What this file is: small helper functions for creating, loading, and
// saving generations (resume/cover letter) in Dexie's `generations` table.
// Mirrors jobStore.ts's pattern. One generation per (posting, type) --
// regenerating overwrites it, matching the matching screen's "Re-run"
// pattern -- so the id is deterministic instead of a fresh uuid each time.
// In plain terms: the code that reads and saves your generated resume (and
// later, cover letter) to your browser's storage.

import { db } from './db';
import type { CoverLetterContent, Generation, GenerationType, ResumeContent, SourceMapEntry } from '../types';
import { normalizeSkills } from './profileStore';

function generationId(jobPostingId: string, type: GenerationType): string {
  return `${jobPostingId}:${type}`;
}

// A resume generation saved before skills were reintroduced as category
// groups has content.skills as an old flat string[]; rendering that shape
// today crashes (SkillsForm/ResumePrintView expect SkillGroup[]). Reuses
// profileStore's normalizeSkills, which already handles both shapes, so a
// generation made under the old schema still loads and displays correctly
// instead of blank-screening.
// In plain terms: fixes up an old saved resume's skills so it still opens
// correctly under today's category-grouped shape.
export function migrateGeneration(generation: Generation): Generation {
  if (generation.type !== 'resume') return generation;
  const content = generation.content as ResumeContent;
  return { ...generation, content: { ...content, skills: normalizeSkills(content.skills) } };
}

/**
 * Builds a new (or overwriting) generation for a posting. Caller must saveGeneration it.
 * In plain terms: packages up a freshly generated resume, ready to save.
 */
export function newGeneration(
  jobPostingId: string,
  type: GenerationType,
  content: ResumeContent | CoverLetterContent,
  sourceMap: SourceMapEntry[],
): Generation {
  return {
    id: generationId(jobPostingId, type),
    jobPostingId,
    createdAt: Date.now(),
    type,
    content,
    sourceMap,
  };
}

export async function saveGeneration(generation: Generation): Promise<void> {
  await db.generations.put(generation);
}

export async function loadGeneration(
  jobPostingId: string,
  type: GenerationType,
): Promise<Generation | undefined> {
  const generation = await db.generations.get(generationId(jobPostingId, type));
  return generation && migrateGeneration(generation);
}

/**
 * All generations for a posting, regardless of type.
 * In plain terms: every resume/cover letter generated for one job.
 */
export async function listGenerationsForPosting(jobPostingId: string): Promise<Generation[]> {
  const generations = await db.generations.where('jobPostingId').equals(jobPostingId).toArray();
  return generations.map(migrateGeneration);
}
