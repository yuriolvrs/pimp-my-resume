# NOTES — Planning discussion summary (July 2026)

Companion to PRD.md / CLAUDE.md / PROGRESS.md. Captures reasoning and workflow advice from the planning conversation.

## Key decisions & why
- **Website over installed app:** "local" requirement is about storage only, not offline. Web = zero install friction for friends. Desktop (Tauri) only worth revisiting if local LaTeX-to-PDF compilation becomes a must-have — and it still needs the cloud proxy anyway (an API key embedded in a distributed app would leak).
- **Stack — Vite + React + TS + Dexie + Cloudflare Worker (over Next.js/Vercel):** chosen deliberately to learn something new beyond existing Next.js experience and add a different line to the resume. Next.js's SSR buys nothing here (everything is local/behind input). Extra complexity vs Next.js is only steps: worker deploy, CORS allowlist, Pages setup (~half a day incl. CORS fumbling). Frontend code is nearly identical either way; migrating to Next.js later is easy if it goes commercial.
- **Free LLM, no user keys:** user's free-tier key lives in the stateless proxy. Gemini free tier is most generous but its terms allow training on prompts → conflicts with privacy goal. Groq / OpenRouter free tiers typically don't train on data (verify current terms). Free tiers change — hence the provider-agnostic llm.ts abstraction. Ollama rejected: forces users to install.
- **Privacy claim (honest version):** "your data never touches our storage; it transits a stateless proxy to [provider] only to generate output, and the provider doesn't train on it."
- **Cover letter (not CV — same as resume in most usage).** Style mimicry = few-shot from stored writing samples; very doable.
- **LaTeX: "convert once, fill deterministically."** LLM converts a pasted Overleaf template into placeholders once; from then on filling is deterministic code. Export .tex for Overleaf compilation; default PDF path is HTML print-to-PDF.
- **Editing = structured fields, not WYSIWYG.** JSON is the single source of truth; templates are views.
- **Export/import is v1, not later** — local-only storage means a cleared browser wipes everything.
- **v2:** screenshot/PDF posting input, resume-PDF profile parsing, multiple profiles, application tracker, optional Ollama mode.

## Claude Code workflow
- Files in repo root: PRD.md, CLAUDE.md (auto-loaded), PROGRESS.md, NOTES.md, plus `.claude/settings.json` with `{ "model": "opusplan" }` — Opus plans in plan mode, Sonnet implements on exit, automatic. (Arbitrary model pairings aren't configurable; opusplan is the built-in split. Check /model for what the current subscription offers.)
- Per phase: enter plan mode (Shift+Tab) → "Read PRD.md, CLAUDE.md, PROGRESS.md, then plan Phase N" → review/edit the plan → approve → Sonnet implements with per-file diff approval in default mode.
- Use the **VS Code extension** (not desktop app) for reviewing every change: side-by-side diff per edit with accept/reject per file. Known limit: no per-hunk approval — accept the file and revert unwanted parts manually.
- Never use auto-accept mode for this project. Keep permission prompts on for git push / deploys / deletions.
- Commit per phase; run the app yourself before moving on; have Claude update PROGRESS.md truthfully at session end.
- Manual (non-Claude-Code) steps: Cloudflare account, free Groq/OpenRouter key, `wrangler login`, `wrangler secret put API_KEY`, connecting GitHub repo to Cloudflare Pages.
- QoL: `/terminal-setup` for Shift+Enter multi-line; `@filename` to reference files precisely.

## Anti-hallucination / safety setup
- Guardrails live in CLAUDE.md (no invented APIs/packages, ask instead of assume, no destructive commands, no unapproved deploys, no secrets committed, truthful PROGRESS updates).
- PROGRESS.md is the cross-session memory; DECISIONS.md optional for notable choices.
- Protection comes mostly from workflow (plan mode first, diff review, git commits) — not from adding more .md files.
