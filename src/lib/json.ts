// What this file is: defensive JSON parsing for LLM structured output
// (PRD §7). Strips markdown code fences the model might wrap its answer
// in, falls back to extracting a JSON substring if there's stray prose
// around it, then parses and validates the shape against a caller-supplied
// type guard.
// In plain terms: cleans up and double-checks whatever JSON-ish text the
// AI sends back, since models don't always format their output perfectly.

export class JsonParseError extends Error {}

export function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

// Scans from the first { or [ and returns only that one balanced structure,
// stopping the instant its matching closing brace/bracket is found --
// correctly skipping braces/brackets inside string values. This matters
// because a small model asked for "one JSON object" sometimes answers with
// several alternative attempts concatenated (e.g. separated by "or" or blank
// lines, occasionally with no separator at all): grabbing everything between
// the very first opening and very last closing character would swallow all
// of them as one invalid blob, where taking just the first complete
// structure recovers the model's first (usually fine) answer instead.
// In plain terms: pulls out just the first complete JSON object/array the AI
// wrote, ignoring any extra alternates or junk that came after it.
function extractJsonSubstring(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const starts = [firstBrace, firstBracket].filter((i) => i !== -1);
  if (starts.length === 0) return null;

  const start = Math.min(...starts);
  const openChar = text[start];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

export function parseJson<T>(raw: string, validate: (x: unknown) => x is T): T {
  const stripped = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    const extracted = extractJsonSubstring(stripped);
    if (extracted === null) {
      throw new JsonParseError('Response was not valid JSON.');
    }
    try {
      parsed = JSON.parse(extracted);
    } catch {
      throw new JsonParseError('Response was not valid JSON.');
    }
  }

  if (!validate(parsed)) {
    throw new JsonParseError('Response JSON did not match the expected shape.');
  }
  return parsed;
}
