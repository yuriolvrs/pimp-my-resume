// What this file is: candidate retrieval for job matching -- scores every
// profile atom against a requirement using synonym-aware token overlap, with
// no LLM call and no network call. Stands in for "embedding similarity" per
// the matching redesign spec, chosen over a real embeddings model/API to
// avoid a new dependency and keep matching free/offline/deterministic.
// In plain terms: cheaply and locally guesses which pieces of your profile
// might be relevant to a requirement, before asking the LLM to double-check.

import type { ProfileAtom } from '../../types';
import { canonicalOf, SYNONYM_GROUPS } from './synonyms';

const STOPWORDS = new Set([
  'and', 'or', 'with', 'the', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'is',
  'are', 'be', 'using', 'as', 'at', 'by', 'this', 'that', 'you', 'your',
]);

export const DEFAULT_TOP_K = 5;
export const DEFAULT_SCORE_FLOOR = 0.2;

export interface CandidateAtom {
  atom: ProfileAtom;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.+#\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

// Synonyms collapse to one representative token, so e.g. "java" and "jvm"
// count as the same term.
function canonicalTokenSet(text: string): Set<string> {
  return new Set(tokenize(text).map(canonicalOf));
}

/** Extra credit when a multi-word synonym phrase (e.g. "spring mvc") appears on both sides. */
function phraseMatchBonus(requirementText: string, atomText: string): number {
  const reqLower = requirementText.toLowerCase();
  const atomLower = atomText.toLowerCase();
  let bonus = 0;
  for (const group of SYNONYM_GROUPS) {
    const reqHas = group.some((term) => reqLower.includes(term));
    const atomHas = group.some((term) => atomLower.includes(term));
    if (reqHas && atomHas) bonus += 1;
  }
  return bonus;
}

/**
 * Top-k profile atoms whose text overlaps (directly or via synonym) with the
 * requirement text, above a minimum score floor. Returns [] if nothing clears
 * the floor -- callers should treat that as "no plausible candidates."
 */
export function retrieveCandidates(
  requirementText: string,
  atoms: ProfileAtom[],
  k: number = DEFAULT_TOP_K,
  floor: number = DEFAULT_SCORE_FLOOR,
): CandidateAtom[] {
  const requirementTokens = canonicalTokenSet(requirementText);
  if (requirementTokens.size === 0) return [];

  const scored = atoms.map((atom): CandidateAtom => {
    const atomTokens = canonicalTokenSet(atom.text);
    const overlap = [...requirementTokens].filter((token) => atomTokens.has(token)).length;
    const bonus = phraseMatchBonus(requirementText, atom.text);
    const score = (overlap + bonus) / requirementTokens.size;
    return { atom, score };
  });

  return scored
    .filter((candidate) => candidate.score >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
