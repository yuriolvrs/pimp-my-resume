# PROGRESS

> Claude Code: read this at the start of every session; update it truthfully at the end. Only mark items done that are implemented AND tested.

## Current phase
Phase 2 — Proxy & LLM layer (built + verified up to the provider boundary; real hello call pending the user's Groq key — see Known issues)

## Phase checklist
- [x] Phase 1 — Foundation: scaffold, types, Dexie, routing, profile screens, export/import/delete-all
- [~] Phase 2 — Proxy & LLM layer (code complete and locally verified; needs a real Groq key for the final end-to-end proof — not yet checked off)
- [ ] Phase 3 — Posting analysis
- [ ] Phase 4 — Resume generation
- [ ] Phase 5 — Cover letter
- [ ] Phase 6 — LaTeX pipeline
- [ ] Phase 7 — Polish

## Done
- Phase 1 Pass A — Foundation scaffold (verified: `npm run build`, `npm run test`, `npm run dev` all green):
  - Vite + React + TypeScript (strict mode) + React Router.
  - Tailwind CSS configured.
  - Shared types in `src/types/index.ts` transcribed from PRD §6 (single source of truth), with `SCHEMA_VERSION`.
  - Dexie DB skeleton in `src/lib/db.ts`, tables derived from the shared types.
  - Routing shell + nav with placeholder pages (Profile, Jobs, About/Privacy); About page carries the PRD §10 privacy contract.
  - `.gitignore` (excludes secrets/.env/.dev.vars); Vitest wired with one smoke test.
- Phase 1 Pass B — Profile screens + export/import/delete-all (verified: `npm run build`, `npm run test` (18 tests) green, plus a Playwright-driven manual pass through the running app — fill profile → reload → confirm persisted → export → delete-all → import → reload → confirm restored):
  - Reusable list-editing primitives `src/components/EditableList.tsx` (generic add/remove) and `src/components/StringList.tsx` (string-item specialization), used by every repeating section so they behave uniformly.
  - Profile section forms in `src/components/profile/`: `ContactForm`, `SkillsForm`, `ExperienceForm`, `ProjectsForm`, `EducationForm`, `WritingSamplesForm`.
  - `src/lib/profileStore.ts` (load/save the single local profile) and `src/lib/backup.ts` (export/import/delete-all; pure functions `buildBackup`/`validateBackup`/`parseBackup` unit-tested, Dexie-touching wrappers verified manually).
  - `src/components/profile/BackupControls.tsx` — export JSON, import JSON, delete-all with two-step confirmation.
  - `src/pages/ProfilePage.tsx` composes all of the above; autosaves on change (blur-commit for the two large free-text fields to avoid a write per keystroke).
  - Manual verification caught and fixed a real bug: a stale error message could hide a subsequent success message in `BackupControls` (delete-all appeared to silently do nothing if a prior import error was still showing).
  - Added `.claude/skills/verify/SKILL.md` documenting the build/launch/drive recipe for this app.
- Phase 2 — Proxy & LLM layer (verified: `npm run test` — 31 frontend tests incl. 13 new — and `worker`'s own `npm run test` — 11 tests — both green; `npm run build` and `worker`'s `tsc --noEmit` both typecheck clean; `wrangler dev` + curl + a Playwright pass through the real `/dev/llm` page confirmed the whole chain reaches the real Groq API):
  - New `worker/` package (self-contained, zero runtime deps): `src/index.ts` (single stateless `POST /generate`, forwards to Groq with the key injected server-side, never logs bodies) and `src/lib.ts` (pure CORS/oversize/rate-limit helpers, unit-tested in `src/lib.test.ts`). Config in `wrangler.toml` (Groq base URL/model confirmed against official docs, allowed origins); secret `LLM_API_KEY` is *not* set yet (see below).
  - `src/lib/llm.ts` — the one provider-agnostic module (CLAUDE.md invariant); `generate()`/`generateStructured()`, never holds a key, talks only to the proxy.
  - `src/lib/json.ts` — defensive JSON parsing for structured LLM output (strip fences → parse → fall back to substring extraction → validate shape).
  - `src/pages/DevLlmPage.tsx` at unlinked route `/dev/llm` — manual "hello" test harness, not linked in nav, not part of the product.
  - `.env.example` (`VITE_PROXY_URL`) and `worker/.dev.vars.example` (`LLM_API_KEY`) document the env vars needed; `.gitignore` updated to keep the `.example` files trackable while still ignoring the real secret files.
  - **Verified without a real key:** with no `LLM_API_KEY` set, the worker still correctly forwarded a request to the real `https://api.groq.com/openai/v1/chat/completions` and Groq replied with a genuine `401 invalid_api_key` — proving the full request path (app → worker → provider) is wired correctly. CORS allow/deny and oversized-payload rejection (413) also confirmed live via curl.

## Known issues / open questions
- **Phase 2 needs a real end-to-end "hello" proof.** Manual steps for the user (not done by Claude Code — CLAUDE.md guardrail: no deploy/secrets handling):
  1. Get a free Groq API key at console.groq.com.
  2. `cd worker`, copy `.dev.vars.example` to `.dev.vars`, fill in the real key.
  3. `cd worker && npm run dev` (starts the worker on :8787), and in another terminal `npm run dev` (frontend) — then visit `/dev/llm` and click "Test connection"; should now return real JSON instead of the 401 seen during this session's verification.
  4. Later, when ready to deploy: `wrangler login`, `wrangler secret put LLM_API_KEY` (from `worker/`), `npx wrangler deploy`, then add the deployed Cloudflare Pages origin to `ALLOWED_ORIGINS` in `worker/wrangler.toml`.
- The worker's in-memory rate limiter is per-isolate and resets on cold start/redeploy — basic abuse dampening, not a hard global guarantee. Fine for a personal-use proxy; documented in `worker/src/lib.ts` if it ever needs upgrading to KV/Durable Objects.

## Session log
(append one line per session: date — what was done)
- 2026-07-19 — Phase 1 Pass A: scaffolded Vite+React+TS+Tailwind+Router, shared types, Dexie skeleton, routing shell; build/test/dev verified.
- 2026-07-19 — Phase 1 Pass B: profile input screens (contact/summary/skills/experience/projects/education/writing samples) with Dexie autosave, JSON export/import, delete-all; unit tests + Playwright manual verification, fixed a message-hiding bug found during verification. Phase 1 complete.
- 2026-07-19 — Phase 2: built Cloudflare Worker proxy (worker/), provider-agnostic src/lib/llm.ts + src/lib/json.ts, /dev/llm test harness. Verified locally end-to-end against the real Groq API (401 with no key, proving the path works); real hello call is a documented manual follow-up once the user adds a key. Also codified the file-header-comment convention into CLAUDE.md and applied it to every new file.
