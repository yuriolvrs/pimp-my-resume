# CLAUDE.md — Standing rules for this codebase

## Project
Privacy-first job application assistant. See PRD.md for full spec. Work in the phases defined there; do not build ahead of the current phase.

## Architecture invariants (never violate)
- All user data lives in the browser via Dexie/IndexedDB. Never add server-side storage, logging of user content, or analytics on content.
- The frontend never contains or receives an LLM API key. All LLM calls go through the Cloudflare Worker proxy.
- The proxy is stateless: forward, return, forget.
- Documents (resume, cover letter) are rendered views over structured JSON. Never store generated documents as opaque text blobs; always structured, field-editable content.
- LaTeX filling is deterministic code. The LLM only performs the one-time template-to-placeholder conversion, never per-generation LaTeX edits.
- LLM provider is abstracted in one module (`src/lib/llm.ts`); no provider-specific code elsewhere.

## Conventions
- TypeScript strict mode everywhere, including the Worker.
- Shared types for all data models live in `src/types/` and are the single source of truth; Dexie tables and prompts derive from them.
- LLM prompts request JSON-only output; parse defensively (strip fences, validate shape, one retry). Prompt templates live in `src/prompts/`.
- Anti-fabrication: generation prompts must require sourceMap evidence; UI flags unevidenced claims.
- Unit tests (Vitest) required for: LaTeX escaping/filling, JSON export/import, schema validation. Mock all LLM calls in tests.
- Keep dependencies minimal; justify any new package.
- Before adding a new function, component, table, or UI pattern, search the codebase for an existing one that already does it (or close to it). Reuse or extend it rather than writing a duplicate. If similar UI already exists (tables, forms, buttons, cards, empty states), match its structure/styling so the app looks and behaves uniformly rather than each screen inventing its own look.

## Guardrails
- Do not invent APIs, packages, or provider endpoints. Before using any external API or npm package, verify it exists (check official docs or the package registry). If unsure, say so and ask rather than guessing.
- If information needed to proceed is missing from PRD.md or the codebase, stop and ask — never fill gaps with assumptions on architecture, data handling, or provider behavior.
- Never run destructive commands: no `rm -rf` outside the project, no `git push --force`, no deleting branches, no dropping/clearing user-facing storage logic.
- Never deploy (`wrangler deploy`, Pages settings) or change DNS/account settings without explicit confirmation in that session.
- Never commit secrets, .env files, or API keys; never print secret values.
- Do not add telemetry, analytics, error reporters, or any network calls beyond the LLM proxy without explicit approval.
- Make small, reviewable changes; commit at logical checkpoints with clear messages. Do not rewrite files wholesale when a targeted edit works.
- After completing work, update PROGRESS.md truthfully — only mark items done that are implemented AND tested. Never claim tests pass without running them.

## Commands
- Frontend dev: `npm run dev`
- Tests: `npm run test`
- Worker deploy: `npx wrangler deploy` (from `worker/`)
- Secrets: `npx wrangler secret put <NAME>` — never commit secrets or .env files.
