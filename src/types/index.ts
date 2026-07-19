// Shared data models — the single source of truth for the whole app.
// Dexie tables (src/lib/db.ts) and LLM prompts (src/prompts/) derive from these.
// Transcribed from PRD.md §6. Keep this file authoritative; do not redefine these
// shapes elsewhere.

/** Bump when the persisted shape changes; used for export/import migrations. */
export const SCHEMA_VERSION = 1;

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

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceEntry {
  company: string;
  title: string;
  start: string;
  end?: string;
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
  start: string;
  end?: string;
  details?: string[];
}

export interface Profile {
  /** Single local profile in v1; fixed id keeps the row addressable. */
  id: string;
  contact: Contact;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  /** Free-text samples used for cover-letter style mimicry. */
  writingSamples: string[];
}

// ---------------------------------------------------------------------------
// Job posting + analysis
// ---------------------------------------------------------------------------

export interface RequirementMatch {
  requirement: string;
  profileEvidence: string[];
}

export interface JobAnalysis {
  roleSummary: string;
  requirements: string[];
  keywords: string[];
  matches: RequirementMatch[];
  gaps: string[];
}

export interface JobPosting {
  id: string;
  createdAt: number;
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
  skills: SkillGroup[];
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
