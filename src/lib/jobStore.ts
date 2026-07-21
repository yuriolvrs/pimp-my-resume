// What this file is: small helper functions for creating, loading, saving,
// listing, and deleting job postings in Dexie's `jobPostings` table. Mirrors
// the shape of profileStore.ts, but for a multi-record table instead of a
// single fixed-id row.
// In plain terms: the code that reads and saves your saved job postings (and
// their analyses) to your browser's storage.

import { db } from './db';
import type { JobPosting } from '../types';

const LABEL_MAX_CHARS = 80;

/** Work arrangement options offered in the Jobs page's Arrangement dropdown. */
export const ARRANGEMENTS = ['Onsite', 'Hybrid', 'Remote'] as const;

/** Builds a new, unsaved posting from pasted text. Caller must saveJobPosting it. */
export function newJobPosting(
  rawText: string,
  details?: { title?: string; company?: string; location?: string; arrangement?: string },
): JobPosting {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    title: details?.title,
    company: details?.company,
    location: details?.location,
    arrangement: details?.arrangement,
    rawText,
  };
}

/** All saved postings, newest first. */
export async function listJobPostings(): Promise<JobPosting[]> {
  return db.jobPostings.orderBy('createdAt').reverse().toArray();
}

export async function loadJobPosting(id: string): Promise<JobPosting | undefined> {
  return db.jobPostings.get(id);
}

export async function saveJobPosting(posting: JobPosting): Promise<void> {
  await db.jobPostings.put(posting);
}

export async function deleteJobPosting(id: string): Promise<void> {
  await db.jobPostings.delete(id);
}

// A short display label for a posting: prefers the analysis's role summary,
// falls back to the first non-empty line of the pasted text, then to a
// generic placeholder for a blank posting. Truncated so it fits on one line
// in the postings list.
export function postingLabel(posting: JobPosting): string {
  const source =
    posting.title?.trim() ||
    posting.analysis?.roleSummary.trim() ||
    posting.rawText
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line !== '') ||
    'Untitled posting';

  return source.length > LABEL_MAX_CHARS
    ? `${source.slice(0, LABEL_MAX_CHARS)}…`
    : source;
}
