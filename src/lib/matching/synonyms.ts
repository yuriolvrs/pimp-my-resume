// What this file is: a small static table of interchangeable tech terms
// (e.g. "Java" / "JVM"), used by candidate retrieval to catch requirement
// wording that doesn't literally appear in the profile text.
// In plain terms: a list of "these mean basically the same thing" word
// groups, so matching a requirement to a skill doesn't require exact wording.

/**
 * Each inner array is a group of interchangeable lowercase terms/phrases.
 * In plain terms: groups of words that count as the same thing, like "js"
 * and "javascript".
 */
export const SYNONYM_GROUPS: string[][] = [
  ['java', 'jvm'],
  ['spring', 'spring mvc', 'spring boot'],
  ['k8s', 'kubernetes'],
  ['js', 'javascript'],
  ['ts', 'typescript'],
  ['node', 'nodejs', 'node.js'],
  ['postgres', 'postgresql'],
  ['ci', 'ci/cd', 'continuous integration'],
  ['cd', 'ci/cd', 'continuous deployment'],
  ['aws', 'amazon web services'],
  ['gcp', 'google cloud', 'google cloud platform'],
  ['ml', 'machine learning'],
  ['ai', 'artificial intelligence'],
  ['rest', 'restful', 'rest api'],
  ['ui', 'user interface'],
  ['ux', 'user experience'],
];

let canonicalIndex: Map<string, string> | null = null;

function buildIndex(): Map<string, string> {
  const index = new Map<string, string>();
  for (const group of SYNONYM_GROUPS) {
    // Alphabetically first term stands in for the whole group, so any two
    // interchangeable terms canonicalize to the same string.
    const canonical = [...group].sort()[0];
    for (const term of group) {
      index.set(term, canonical);
    }
  }
  return index;
}

/**
 * The one term standing in for the given (already-lowercased) term's synonym
 * group, or the term itself if it isn't in any group.
 *
 * In plain terms: converts a word to its "standard" spelling so equivalent
 * terms compare equal, e.g. "jvm" becomes "java".
 */
export function canonicalOf(term: string): string {
  if (!canonicalIndex) canonicalIndex = buildIndex();
  return canonicalIndex.get(term) ?? term;
}
