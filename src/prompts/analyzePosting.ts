// What this file is: the prompt template and response validator for Phase
// 3's posting-analysis LLM call. Builds a single prompt from a raw job
// posting plus the user's profile (serialized as compact plain text so the
// model can quote it verbatim as evidence), and validates that the model's
// JSON reply matches the JobAnalysis shape before it's trusted. Anti-
// fabrication is enforced in the prompt wording (profileEvidence must be
// copied word-for-word); the guard here only checks structural shape.
// In plain terms: this is what we ask the AI when analyzing a job posting,
// and the code that checks its answer actually looks like a real analysis
// before we use it.

import type { JobAnalysis, Profile } from '../types';

/** Job posting text beyond this length is truncated before it's sent. */
export const MAX_POSTING_CHARS = 12_000;

/** Serialized profile text beyond this length is truncated before it's sent. */
export const MAX_PROFILE_CHARS = 8_000;

const TRUNCATION_MARKER = '\n…[truncated]';

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(0, maxChars) + TRUNCATION_MARKER : text;
}

// Shared by experience/education entries, which both moved from a single
// free-text start/end string to separate month+year fields plus a
// `current` flag.
function formatDateRange(
  startMonth: string | undefined,
  startYear: string | undefined,
  current: boolean,
  endMonth: string | undefined,
  endYear: string | undefined,
): string {
  const start = [startMonth, startYear].filter(Boolean).join(' ') || 'unknown';
  const end = current ? 'present' : [endMonth, endYear].filter(Boolean).join(' ') || 'present';
  return `${start} – ${end}`;
}

// Renders the profile as compact, quotable plain text rather than JSON: it
// costs fewer tokens for a small model, and every line becomes something the
// model can copy verbatim into profileEvidence. Empty sections are omitted.
// writingSamples and contact details are left out entirely -- they aren't
// evidence of skills/experience, and writingSamples can be the largest field
// in the profile.
export function serializeProfileForPrompt(profile: Profile): string {
  const sections: string[] = [];

  if (profile.summary.trim() !== '') {
    sections.push(`SUMMARY: ${profile.summary.trim()}`);
  }

  if (profile.skills.length > 0) {
    sections.push(`SKILLS: ${profile.skills.join(', ')}`);
  }

  if (profile.experience.length > 0) {
    const lines = profile.experience.map((entry) => {
      const range = formatDateRange(entry.startMonth, entry.startYear, entry.current, entry.endMonth, entry.endYear);
      const bullets = entry.bullets.map((b) => `  * ${b}`).join('\n');
      return `- ${entry.title}, ${entry.company} (${range})${bullets ? `\n${bullets}` : ''}`;
    });
    sections.push(`EXPERIENCE:\n${lines.join('\n')}`);
  }

  if (profile.projects.length > 0) {
    const lines = profile.projects.map((entry) => {
      const bullets = entry.bullets.map((b) => `  * ${b}`).join('\n');
      return `- ${entry.name} — ${entry.description}${bullets ? `\n${bullets}` : ''}`;
    });
    sections.push(`PROJECTS:\n${lines.join('\n')}`);
  }

  if (profile.education.length > 0) {
    const lines = profile.education.map((entry) => {
      const range = formatDateRange(entry.startMonth, entry.startYear, entry.current, entry.endMonth, entry.endYear);
      const field = entry.field ? ` in ${entry.field}` : '';
      return `- ${entry.degree}${field}, ${entry.school} (${range})`;
    });
    sections.push(`EDUCATION:\n${lines.join('\n')}`);
  }

  return sections.join('\n');
}

// Builds the single user-message prompt sent to the LLM proxy. Both variable
// inputs are truncated independently before assembly (never the assembled
// prompt -- that would risk chopping off the instructions), which keeps the
// whole request comfortably under the Worker's 100KB body limit.
export function buildAnalyzePostingPrompt(rawText: string, profile: Profile): string {
  const posting = truncate(rawText.trim(), MAX_POSTING_CHARS);
  const profileText = truncate(serializeProfileForPrompt(profile), MAX_PROFILE_CHARS);

  return `You are a job-application analyst. Compare the JOB POSTING to the CANDIDATE PROFILE
and reply with ONE JSON object and nothing else.

Exact shape (no extra keys, no markdown, no code fences, no commentary):
{"roleSummary":"…","requirements":["…"],"keywords":["…"],"matches":[{"requirement":"…","profileEvidence":["…"]}],"gaps":["…"]}

Rules:
- roleSummary: one or two sentences describing the role and what it does.
- requirements: at most 8 concrete requirements, taken from the posting.
- keywords: at most 12 skills/tools/terms, spelled as the posting spells them.
- matches: ONLY requirements the profile genuinely supports. profileEvidence is ALWAYS
  a JSON array of strings, even if there is only one piece of evidence (e.g.
  ["evidence text"], never a bare string). Every profileEvidence string MUST be copied
  word-for-word from the CANDIDATE PROFILE below. Never invent, infer, generalise, or
  paraphrase evidence. If the profile does not literally say it, it is not evidence.
- gaps: requirements with no supporting evidence in the profile.
- Every requirement appears in exactly one of matches or gaps.
- Plain text only inside the strings; no markdown.

=== JOB POSTING ===
${posting}

=== CANDIDATE PROFILE ===
${profileText || '(empty)'}

=== END ===

Reply with the JSON object only.`;
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((item) => typeof item === 'string');
}

function isRequirementMatch(x: unknown): boolean {
  if (typeof x !== 'object' || x === null) return false;
  const candidate = x as Record<string, unknown>;
  return typeof candidate.requirement === 'string' && isStringArray(candidate.profileEvidence);
}

// Structural, shallow validation -- in the style of validateBackup in
// lib/backup.ts -- but element types are checked too (not just "array of
// objects"): this data flows straight into StringList/EditableList as
// controlled values, so a stray number or null would render as broken UI
// rather than being caught here and retried by generateStructured.
export function isJobAnalysis(x: unknown): x is JobAnalysis {
  if (typeof x !== 'object' || x === null) return false;
  const candidate = x as Record<string, unknown>;

  return (
    typeof candidate.roleSummary === 'string' &&
    isStringArray(candidate.requirements) &&
    isStringArray(candidate.keywords) &&
    isStringArray(candidate.gaps) &&
    Array.isArray(candidate.matches) &&
    candidate.matches.every(isRequirementMatch)
  );
}

function normalizeForComparison(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// isJobAnalysis only checks shape (arrays of strings); this checks substance
// and repairs what it can, rather than trusting a small model's self-report.
// Enforced here, against real, observed model behavior:
// - profileEvidence is only trusted if it's an actual (normalized) substring
//   of the profile text sent to the model -- llama-3.1-8b-instant has been
//   observed simply echoing the requirement back as its own "evidence".
// - a match whose evidence doesn't survive that check is dropped, and its
//   requirement is treated as a gap instead of a fabricated match.
// - gaps is rebuilt from requirements minus whatever ended up genuinely
//   matched, rather than trusting the model's own gaps list -- observed to
//   sometimes include requirements it never listed in `requirements` at all.
// - blank requirements/keywords/matches are dropped.
export function sanitizeJobAnalysis(analysis: JobAnalysis, profile: Profile): JobAnalysis {
  const profileText = normalizeForComparison(serializeProfileForPrompt(profile));

  const requirements = analysis.requirements.map((r) => r.trim()).filter((r) => r !== '');
  const requirementSet = new Set(requirements);

  const matches = analysis.matches
    .map((m) => ({
      requirement: m.requirement.trim(),
      profileEvidence: m.profileEvidence
        .map((e) => e.trim())
        .filter((e) => e !== '' && profileText.includes(normalizeForComparison(e))),
    }))
    .filter((m) => requirementSet.has(m.requirement) && m.profileEvidence.length > 0);

  const matchedRequirements = new Set(matches.map((m) => m.requirement));
  const gaps = requirements.filter((r) => !matchedRequirements.has(r));

  return {
    roleSummary: analysis.roleSummary,
    requirements,
    keywords: analysis.keywords.map((k) => k.trim()).filter((k) => k !== ''),
    matches,
    gaps,
  };
}
