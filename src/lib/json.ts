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

function extractJsonSubstring(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const starts = [firstBrace, firstBracket].filter((i) => i !== -1);
  if (starts.length === 0) return null;

  const start = Math.min(...starts);
  const closeChar = text[start] === '{' ? '}' : ']';
  const end = text.lastIndexOf(closeChar);
  if (end === -1 || end < start) return null;

  return text.slice(start, end + 1);
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
