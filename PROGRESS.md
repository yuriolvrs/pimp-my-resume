# PROGRESS

> Claude Code: read this at the start of every session; update it truthfully at the end. Only mark items done that are implemented AND tested.

## Current phase
Phase 4 — Resume generation (not yet started)

## Phase checklist
- [x] Phase 1 — Foundation: scaffold, types, Dexie, routing, profile screens, export/import/delete-all
- [x] Phase 2 — Proxy & LLM layer (real end-to-end hello call confirmed against Groq via `/dev/llm`)
- [x] Phase 3 — Posting analysis (paste posting → LLM analysis, editable, stored per posting; verified live against Groq)
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
- Phase 3 — Posting analysis (verified: `npm run test` — 49 tests, 18 new — and `npm run build` both green; a Playwright pass through the real running app, against the real Groq API via the local Worker, drove the full flow: paste posting → save → Analyze → edit a keyword → reload → confirm persisted → posting list shows "Analyzed" → visited an unknown `/jobs/:id` and confirmed the not-found state):
  - `src/prompts/analyzePosting.ts` (first file in `src/prompts/`) — `buildAnalyzePostingPrompt`, `serializeProfileForPrompt` (profile rendered as compact plain text so the model can quote it verbatim as evidence; `writingSamples` and contact details omitted), `isJobAnalysis` type guard (structural, element-type-checked so malformed shapes are caught and retried by `generateStructured` rather than reaching the UI). Both variable inputs are length-capped and truncated independently before assembly, keeping requests comfortably under the Worker's 100KB body limit. Unit-tested in `analyzePosting.test.ts`.
  - `src/lib/jobStore.ts` — mirrors `profileStore.ts`'s pattern for the multi-record `jobPostings` table: `newJobPosting`, `listJobPostings`, `loadJobPosting`, `saveJobPosting`, `deleteJobPosting`, and pure `postingLabel` (unit-tested in `jobStore.test.ts`).
  - `src/lib/profileStore.ts` — added `hasProfileContent`, gates the Analyze button so a blank profile can't be sent to the LLM.
  - `src/components/jobs/AnalysisEditor.tsx` — the analysis is fully editable (a deliberate choice, not just PRD-minimum "rendered"), built entirely from the existing `StringList`/`EditableList` primitives so a bad or incomplete LLM extraction can be corrected by hand before later phases consume it.
  - `src/pages/JobsPage.tsx` (rewritten) — paste + save a new posting, list saved postings newest-first. `src/pages/JobDetailPage.tsx` (new, route `/jobs/:id`, the app's first route param) — edit posting text, run/re-run analysis, edit the result, delete the posting (two-step confirm, matching `BackupControls`).
  - No changes needed to `src/types/index.ts`, `src/lib/db.ts`, or `src/lib/backup.ts` — the Phase 3 shapes, Dexie table/index, and backup export/import already existed from Phase 1.
  - **Real-model finding, addressed:** live testing against `llama-3.1-8b-instant` showed it would sometimes return `profileEvidence` as a bare string instead of an array — correctly rejected by `isJobAnalysis` and retried by `generateStructured`, but a real failure mode. Strengthened the prompt with an explicit array-shape reminder and example; confirmed reliable (multiple live runs) afterward. Residual, expected model-quality noise (e.g. occasionally mis-classifying a requirement, or leaving `profileEvidence` empty) is exactly why the analysis is editable rather than read-only — not a code bug, and not something a stricter guard should paper over. Programmatic verbatim-evidence checking is intentionally deferred to Phase 4's `sourceMap` work, per the PRD.

- Visual redesign (verified: `npm run build` and `npm run test` — 49 tests — both green; Playwright screenshots of Profile, Jobs, and Job Detail compared against the source design):
  - Ported a Figma Make mockup (`Job Application Assistant/`, Figma project "Job Application Assistant") into the existing pages — same Dexie-backed logic and routing, restyled markup only. The mockup's own code (unused shadcn/Radix/MUI boilerplate) was not adopted; only its Tailwind utility styling and `lucide-react` icons were.
  - New `src/components/ui/primitives.tsx` (`Card`, `Btn`, `Badge`, `SectionTitle`, `FieldInput`, `FieldTextarea`) — the one shared look-and-feel module every page and form now builds on.
  - `EditableList`/`StringList` restyled to the new card/chip idiom, which cascaded the new look through every profile section form and `AnalysisEditor` without touching their logic.
  - Self-hosted the Outfit font (`src/assets/fonts/`) instead of loading it from `fonts.googleapis.com`, to avoid a non-LLM network call from the privacy-first app.
  - Caught and fixed before commit: the mockup export's `worker/.dev.vars.example` diff (from unrelated in-progress work) contained a live Groq key pasted in place of the placeholder; reverted to the placeholder and the user revoked the key.

## Known issues / open questions
- Not yet deployed. When ready: `wrangler login`, `wrangler secret put LLM_API_KEY` (from `worker/`), `npx wrangler deploy`, then add the deployed Cloudflare Pages origin to `ALLOWED_ORIGINS` in `worker/wrangler.toml`.
- The worker's in-memory rate limiter is per-isolate and resets on cold start/redeploy — basic abuse dampening, not a hard global guarantee. Fine for a personal-use proxy; documented in `worker/src/lib.ts` if it ever needs upgrading to KV/Durable Objects.

## Session log
(append one line per session: date — what was done)
- 2026-07-19 — Phase 1 Pass A: scaffolded Vite+React+TS+Tailwind+Router, shared types, Dexie skeleton, routing shell; build/test/dev verified.
- 2026-07-19 — Phase 1 Pass B: profile input screens (contact/summary/skills/experience/projects/education/writing samples) with Dexie autosave, JSON export/import, delete-all; unit tests + Playwright manual verification, fixed a message-hiding bug found during verification. Phase 1 complete.
- 2026-07-19 — Phase 2: built Cloudflare Worker proxy (worker/), provider-agnostic src/lib/llm.ts + src/lib/json.ts, /dev/llm test harness. Verified locally end-to-end against the real Groq API (401 with no key, proving the path works); real hello call is a documented manual follow-up once the user adds a key. Also codified the file-header-comment convention into CLAUDE.md and applied it to every new file.
- 2026-07-21 — Phase 2 closed out: user added a real Groq key to worker/.dev.vars, started `wrangler dev` alongside the frontend, and confirmed a genuine `{"hello": "world"}` response via /dev/llm (200 OK in worker logs). Phase 2 complete; Phase 3 (posting analysis) is next per PRD.md.
- 2026-07-21 — Phase 3: posting analysis. New src/prompts/ (analyzePosting.ts), src/lib/jobStore.ts, /jobs list + /jobs/:id detail routes, AnalysisEditor (fully editable, per user's explicit choice). Unit tests (49 total, 18 new) and build both green. Live Playwright run against the real Groq API caught a real model failure mode (profileEvidence returned as a string, not array) which the guard correctly rejected and retried; fixed by strengthening the prompt, then reconfirmed working. Phase 3 complete; Phase 4 (resume generation) is next per PRD.md.
- 2026-07-21 — Visual redesign: ported a user-provided Figma Make mockup's styling (not its code) onto the existing Profile/Jobs/Job Detail pages. Added shared `src/components/ui/primitives.tsx`, restyled `EditableList`/`StringList` (cascading to every form), self-hosted the Outfit font, added `lucide-react`. Build + all 49 tests green; verified visually via Playwright screenshots against the source design. Found and fixed a live secret (Groq key) that had been pasted into `worker/.dev.vars.example` by unrelated in-progress work; user revoked it.
