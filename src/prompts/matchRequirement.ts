// What this file is: the prompt template and response validator for the
// per-requirement matching-verification LLM call. Unlike the old single-shot
// analysis, the model is only ever shown a short list of already-retrieved
// candidate atoms (see src/lib/matching/retrieval.ts) and may only select
// among their IDs -- it cannot free-type evidence, so there is nothing left
// to hallucinate.
// In plain terms: this is what we ask the AI to double-check one requirement
// against a short list of profile snippets we've already picked out.

export interface MatchCandidate {
  id: string;
  text: string;
  sourceLabel: string;
}

export interface MatchVerification {
  atomIds: string[];
  status: 'full' | 'partial';
  note?: string;
}

export function buildMatchRequirementPrompt(requirementText: string, candidates: MatchCandidate[]): string {
  const candidateLines = candidates
    .map((c) => `- id: ${c.id} | ${c.sourceLabel} | "${c.text}"`)
    .join('\n');

  return `You are checking whether a candidate's profile evidence satisfies one job requirement.
Reply with ONE JSON object and nothing else.

Exact shape (no extra keys, no markdown, no code fences, no commentary):
{"atomIds":["…"],"status":"full","note":"…"}

Rules:
- atomIds: ids of the candidate evidence items below that genuinely satisfy the requirement.
  You may ONLY use ids from the CANDIDATE EVIDENCE list -- never invent an id, never return
  text instead of an id. Return an empty array if none of them satisfy the requirement.
- status: "full" if the evidence fully satisfies the requirement, "partial" if it's related
  but weaker than what's asked (e.g. the requirement asks for "3+ years" and the evidence is a
  3-month internship, or the evidence only covers part of the requirement).
- note: one short sentence explaining your reasoning, especially for "partial". Omit if obvious.
- If atomIds is empty, status and note are not meaningful -- still include status as "full" and
  omit note.

=== REQUIREMENT ===
${requirementText}

=== CANDIDATE EVIDENCE ===
${candidateLines}

=== END ===

Reply with the JSON object only.`;
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((item) => typeof item === 'string');
}

export function isMatchVerification(x: unknown): x is MatchVerification {
  if (typeof x !== 'object' || x === null) return false;
  const candidate = x as Record<string, unknown>;

  return (
    isStringArray(candidate.atomIds) &&
    (candidate.status === 'full' || candidate.status === 'partial') &&
    (candidate.note === undefined || typeof candidate.note === 'string')
  );
}
