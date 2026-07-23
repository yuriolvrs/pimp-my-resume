// What this file is: the TypeScript types for every piece of data the app
// works with (profile, job postings, generated documents, LaTeX templates).
// This is the single source of truth — Dexie tables (src/lib/db.ts) and
// future LLM prompts (src/prompts/) derive from these shapes. Transcribed
// from PRD.md §6; keep this file authoritative, don't redefine these shapes
// elsewhere.
// In plain terms: this is the blueprint describing what a "profile," a
// "job posting," and a "generated resume" look like as data.

/** Bump when the persisted shape changes; used for export/import migrations. */
export const SCHEMA_VERSION = 2;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ContactLink {
  label: string;
  url: string;
}

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  links: ContactLink[];
}

export interface ExperienceEntry {
  company: string;
  title: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  /** When true, this is the current position; end date is ignored/cleared. */
  current: boolean;
  location?: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  bullets: string[];
  links: ContactLink[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  field?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  /** When true, still studying here; end date is ignored/cleared. */
  current: boolean;
  details?: string[];
}

export interface Profile {
  /** Single local profile in v1; fixed id keeps the row addressable. */
  id: string;
  contact: Contact;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  /** Free-text samples used for cover-letter style mimicry. */
  writingSamples: string[];
  /**
   * Resume-worthy accomplishments not tied to any specific experience/project
   * entry -- entered from the job-matching screen, but stored on the profile
   * so they're available as evidence in every future matching pass.
   */
  additionalInfo: string[];
}

// ---------------------------------------------------------------------------
// Profile atoms (indexed profile content for matching)
// ---------------------------------------------------------------------------

/** One discrete, quotable unit of profile content -- a skill, a bullet, etc. */
export interface ProfileAtom {
  /** Content-derived; stable across re-derivation as long as the text is unchanged. */
  id: string;
  source: 'skills' | 'experience' | 'projects' | 'education' | 'additional';
  /** e.g. "Experience: Software Engineering Intern, Acme Co" */
  sourceLabel: string;
  /** Verbatim text from the profile. */
  text: string;
}

// ---------------------------------------------------------------------------
// Job posting + analysis
// ---------------------------------------------------------------------------

export type RequirementSeverity = 'required' | 'preferred';

export interface Requirement {
  id: string;
  text: string;
  severity: RequirementSeverity;
  /** Position as it appeared in the posting text; used for display sort. */
  order: number;
}

export type MatchStatus = 'full' | 'partial' | 'gap_no_candidates' | 'gap_unverified';

export interface RequirementMatch {
  requirementId: string;
  status: MatchStatus;
  /** References into ProfileAtom -- never free text. */
  atomIds: string[];
}

export interface JobAnalysis {
  roleSummary: string;
  requirements: Requirement[];
  keywords: string[];
  /** One entry per requirement, always present. */
  matches: RequirementMatch[];
}

export interface JobPosting {
  id: string;
  createdAt: number;
  title?: string;
  company?: string;
  location?: string;
  /** Work arrangement, e.g. "Onsite" | "Hybrid" | "Remote" -- see ARRANGEMENTS in jobStore.ts. */
  arrangement?: string;
  rawText: string;
  analysis?: JobAnalysis;
}

// ---------------------------------------------------------------------------
// Generations (resume / cover letter)
// ---------------------------------------------------------------------------

export type GenerationType = 'resume' | 'coverLetter';

/**
 * Structured, field-editable resume content. Shape is deliberately minimal for
 * Phase 1; fleshed out in Phase 4 (resume generation).
 */
export interface ResumeContent {
  contact: Contact;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
}

/**
 * Structured, field-editable cover-letter content. Minimal for Phase 1;
 * fleshed out in Phase 5 (cover letter).
 */
export interface CoverLetterContent {
  greeting: string;
  paragraphs: string[];
  closing: string;
}

/** Links a generated fragment back to the profile evidence that grounds it. */
export interface SourceMapEntry {
  generatedText: string;
  profileEvidence: string[];
}

export interface Generation {
  id: string;
  jobPostingId: string;
  createdAt: number;
  type: GenerationType;
  content: ResumeContent | CoverLetterContent;
  sourceMap: SourceMapEntry[];
}

// ---------------------------------------------------------------------------
// LaTeX templates
// ---------------------------------------------------------------------------

export interface LatexTemplate {
  id: string;
  name: string;
  /** As pasted by the user. */
  rawTex: string;
  /** Placeholder version, produced once by the LLM. */
  compiledTemplate: string;
  placeholders: string[];
}
