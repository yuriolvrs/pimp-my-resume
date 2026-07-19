# PROGRESS

> Claude Code: read this at the start of every session; update it truthfully at the end. Only mark items done that are implemented AND tested.

## Current phase
Phase 1 — Foundation (in progress: scaffold done; profile screens + export/import pending)

## Phase checklist
- [ ] Phase 1 — Foundation: scaffold, types, Dexie, routing, profile screens, export/import/delete-all
- [ ] Phase 2 — Proxy & LLM layer
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

## Known issues / open questions
(none yet)

## Session log
(append one line per session: date — what was done)
- 2026-07-19 — Phase 1 Pass A: scaffolded Vite+React+TS+Tailwind+Router, shared types, Dexie skeleton, routing shell; build/test/dev verified.
