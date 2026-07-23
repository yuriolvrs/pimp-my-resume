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
  // Generic qualifier/filler words that pad job-posting requirement phrasing
  // ("proficient in", "solid experience with", "provide concrete examples
  // of") without identifying any actual skill -- left in, they dilute the
  // overlap ratio against the real content words.
  'experience', 'proficient', 'knowledge', 'strong', 'solid', 'working',
  'provide', 'concrete', 'examples', 'successful', 'prior', 'exposure',
  'fluency', 'mix', 'develop',
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
    // Strip leading/trailing periods (e.g. the "." a token inherits from
    // ending a sentence) while keeping periods inside a word like "node.js".
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

// Synonyms collapse to one representative token, so e.g. "java" and "jvm"
// count as the same term. Plurals also get their singular form added as an
// alias (short/acronym-length tokens are left alone) so "projects" lines up
// with a profile atom that says "project".
function canonicalTokenSet(text: string): Set<string> {
  const set = new Set<string>();
  for (const token of tokenize(text)) {
    set.add(canonicalOf(token));
    if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) {
      set.add(canonicalOf(token.slice(0, -1)));
    }
  }
  return set;
}

function containsTerm(text: string, term: string): boolean {
  // Word-boundary match -- plain .includes() would let "java" match inside
  // "javascript".
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);
}

/** Extra credit when a multi-word synonym phrase (e.g. "spring mvc") appears on both sides. */
function phraseMatchBonus(requirementText: string, atomText: string): number {
  const reqLower = requirementText.toLowerCase();
  const atomLower = atomText.toLowerCase();
  let bonus = 0;
  for (const group of SYNONYM_GROUPS) {
    const reqHas = group.some((term) => containsTerm(reqLower, term));
    const atomHas = group.some((term) => containsTerm(atomLower, term));
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
    // Score against the atom's source label too (e.g. "Project: Billing-
    // Payroll System"), not just its bullet/skill text -- some requirements
    // ("provide examples of prior projects") only line up with the label.
    const atomText = `${atom.sourceLabel} ${atom.text}`;
    const atomTokens = canonicalTokenSet(atomText);
    const overlap = [...requirementTokens].filter((token) => atomTokens.has(token)).length;
    const bonus = phraseMatchBonus(requirementText, atomText);
    // Normalized against whichever side is shorter: a short atom (a single
    // skill word) shouldn't be penalized for not covering every word of a
    // long, multi-clause requirement sentence, and vice versa.
    const denominator = Math.min(requirementTokens.size, atomTokens.size) || requirementTokens.size;
    const score = (overlap + bonus) / denominator;
    return { atom, score };
  });

  return scored
    .filter((candidate) => candidate.score >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
