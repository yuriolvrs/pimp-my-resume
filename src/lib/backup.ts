// What this file is: the logic behind exporting all local data to a JSON
// file, importing it back, and deleting everything. Split into pure
// functions (buildBackup/validateBackup/parseBackup — unit-tested in
// backup.test.ts) and thin Dexie-touching wrappers (exportAllData/
// importAllData/deleteAllData).
// In plain terms: the code behind the "Export," "Import," and "Delete All
// Data" buttons on the Profile page.

import { db } from './db';
import { SCHEMA_VERSION } from '../types';
import type { Generation, JobPosting, LatexTemplate, Profile } from '../types';

export interface BackupData {
  profiles: Profile[];
  jobPostings: JobPosting[];
  generations: Generation[];
  latexTemplates: LatexTemplate[];
}

export interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
}

export class BackupValidationError extends Error {}

/** Pure — shapes table contents into the exportable backup file. */
export function buildBackup(data: BackupData): BackupFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

function isStringArrayOfObjects(x: unknown): x is object[] {
  return Array.isArray(x) && x.every((item) => typeof item === 'object' && item !== null);
}

/** Pure — structural validation only; does not deep-check every field. */
export function validateBackup(x: unknown): x is BackupFile {
  if (typeof x !== 'object' || x === null) return false;
  const candidate = x as Record<string, unknown>;

  if (typeof candidate.schemaVersion !== 'number') return false;
  if (candidate.schemaVersion !== SCHEMA_VERSION) return false;

  if (typeof candidate.exportedAt !== 'string') return false;

  if (typeof candidate.data !== 'object' || candidate.data === null) return false;
  const data = candidate.data as Record<string, unknown>;

  return (
    isStringArrayOfObjects(data.profiles) &&
    isStringArrayOfObjects(data.jobPostings) &&
    isStringArrayOfObjects(data.generations) &&
    isStringArrayOfObjects(data.latexTemplates)
  );
}

/** Pure — parses and validates a backup JSON string, throwing on any problem. */
export function parseBackup(json: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BackupValidationError('Malformed backup file: not valid JSON.');
  }

  if (!validateBackup(parsed)) {
    const version = (parsed as { schemaVersion?: unknown } | null)?.schemaVersion;
    if (typeof version === 'number' && version !== SCHEMA_VERSION) {
      throw new BackupValidationError(
        `Unsupported schema version ${version} (expected ${SCHEMA_VERSION}).`,
      );
    }
    throw new BackupValidationError('Malformed backup file: unexpected shape.');
  }

  return parsed;
}

/** Reads all tables and produces a backup file. */
export async function exportAllData(): Promise<BackupFile> {
  const data = await db.transaction(
    'r',
    db.profiles,
    db.jobPostings,
    db.generations,
    db.latexTemplates,
    async () => ({
      profiles: await db.profiles.toArray(),
      jobPostings: await db.jobPostings.toArray(),
      generations: await db.generations.toArray(),
      latexTemplates: await db.latexTemplates.toArray(),
    }),
  );
  return buildBackup(data);
}

/** Clears all tables, then restores them from the given backup. */
export async function importAllData(backup: BackupFile): Promise<void> {
  await db.transaction(
    'rw',
    db.profiles,
    db.jobPostings,
    db.generations,
    db.latexTemplates,
    async () => {
      await Promise.all([
        db.profiles.clear(),
        db.jobPostings.clear(),
        db.generations.clear(),
        db.latexTemplates.clear(),
      ]);
      await Promise.all([
        db.profiles.bulkPut(backup.data.profiles),
        db.jobPostings.bulkPut(backup.data.jobPostings),
        db.generations.bulkPut(backup.data.generations),
        db.latexTemplates.bulkPut(backup.data.latexTemplates),
      ]);
    },
  );
}

/** Wipes all local data. */
export async function deleteAllData(): Promise<void> {
  await db.transaction(
    'rw',
    db.profiles,
    db.jobPostings,
    db.generations,
    db.latexTemplates,
    async () => {
      await Promise.all([
        db.profiles.clear(),
        db.jobPostings.clear(),
        db.generations.clear(),
        db.latexTemplates.clear(),
      ]);
    },
  );
}
