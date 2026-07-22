// What this file is: the one module that knows how to talk to the LLM
// proxy (CLAUDE.md: no provider-specific code elsewhere). generate() sends
// a prompt to the Worker and returns the raw text; generateStructured()
// adds JSON parsing with one retry on failure (PRD §7). Never holds an API
// key -- that lives only in the Worker.
// In plain terms: the app's one doorway to asking the AI something.

import { JsonParseError, parseJson } from './json';

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_PROXY_URL = 'http://localhost:8787';

function proxyUrl(): string {
  return (import.meta.env.VITE_PROXY_URL as string | undefined) ?? DEFAULT_PROXY_URL;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

export async function generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
  const response = await fetch(`${proxyUrl()}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM proxy request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LLM proxy response had no content.');
  }
  return content;
}

// Every screen that runs an LLM call needs the same three-way message
// (malformed JSON / failed request / something else); `label` names the
// action, e.g. "Analysis" or "Matching".
export function llmErrorMessage(err: unknown, label: string): string {
  if (err instanceof JsonParseError) {
    return `${label} failed: the model returned an unusable response. Try again — the model this app uses is small and occasionally produces malformed output.`;
  }
  if (err instanceof Error) return `${label} failed: ${err.message}`;
  return `${label} failed: unknown error.`;
}

export async function generateStructured<T>(
  prompt: string,
  validate: (x: unknown) => x is T,
  options: GenerateOptions = {},
): Promise<T> {
  const first = await generate(prompt, options);
  try {
    return parseJson(first, validate);
  } catch {
    const retry = await generate(prompt, options);
    return parseJson(retry, validate);
  }
}
