import Dexie, { type EntityTable } from 'dexie';
import type {
  Profile,
  JobPosting,
  Generation,
  LatexTemplate,
} from '../types';
import { SCHEMA_VERSION } from '../types';

// IndexedDB-backed local store. All user data lives here in the browser —
// there is no server-side storage (CLAUDE.md architecture invariant).
// Row shapes are the shared types; this module only declares indexes.

export class AppDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  jobPostings!: EntityTable<JobPosting, 'id'>;
  generations!: EntityTable<Generation, 'id'>;
  latexTemplates!: EntityTable<LatexTemplate, 'id'>;

  constructor() {
    super('anti-funemployment');
    // The Dexie version number tracks the IndexedDB schema (indexes). It is
    // intentionally kept in step with the app-level SCHEMA_VERSION used for
    // export/import migrations.
    this.version(SCHEMA_VERSION).stores({
      // Only indexed fields are listed; full objects are stored regardless.
      profiles: 'id',
      jobPostings: 'id, createdAt',
      generations: 'id, jobPostingId, createdAt, type',
      latexTemplates: 'id, name',
    });
  }
}

export const db = new AppDatabase();
