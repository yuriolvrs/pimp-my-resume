# PROGRESS

> Claude Code: read this at the start of every session; update it truthfully at the end. Only mark items done that are implemented AND tested.

## Current phase
Phase 1 — Foundation (done)

## Phase checklist
- [x] Phase 1 — Foundation: scaffold, types, Dexie, routing, profile screens, export/import/delete-all
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
- Phase 1 Pass B — Profile screens + export/import/delete-all (verified: `npm run build`, `npm run test` (18 tests) green, plus a Playwright-driven manual pass through the running app — fill profile → reload → confirm persisted → export → delete-all → import → reload → confirm restored):
  - Reusable list-editing primitives `src/components/EditableList.tsx` (generic add/remove) and `src/components/StringList.tsx` (string-item specialization), used by every repeating section so they behave uniformly.
  - Profile section forms in `src/components/profile/`: `ContactForm`, `SkillsForm`, `ExperienceForm`, `ProjectsForm`, `EducationForm`, `WritingSamplesForm`.
  - `src/lib/profileStore.ts` (load/save the single local profile) and `src/lib/backup.ts` (export/import/delete-all; pure functions `buildBackup`/`validateBackup`/`parseBackup` unit-tested, Dexie-touching wrappers verified manually).
  - `src/components/profile/BackupControls.tsx` — export JSON, import JSON, delete-all with two-step confirmation.
  - `src/pages/ProfilePage.tsx` composes all of the above; autosaves on change (blur-commit for the two large free-text fields to avoid a write per keystroke).
  - Manual verification caught and fixed a real bug: a stale error message could hide a subsequent success message in `BackupControls` (delete-all appeared to silently do nothing if a prior import error was still showing).
  - Added `.claude/skills/verify/SKILL.md` documenting the build/launch/drive recipe for this app.

## Known issues / open questions
(none yet)

## Session log
(append one line per session: date — what was done)
- 2026-07-19 — Phase 1 Pass A: scaffolded Vite+React+TS+Tailwind+Router, shared types, Dexie skeleton, routing shell; build/test/dev verified.
- 2026-07-19 — Phase 1 Pass B: profile input screens (contact/summary/skills/experience/projects/education/writing samples) with Dexie autosave, JSON export/import, delete-all; unit tests + Playwright manual verification, fixed a message-hiding bug found during verification. Phase 1 complete.
