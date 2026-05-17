# CLAUDE.md

Project rules for Claude Code working on this repo.

This file is read by Claude Code at the start of every session. Keep it short.

---

## Project

Interactive 3D theodolite sandbox. Browser-only. Educational playground, not a graded course.

Full context lives in `docs/`:
- `ROADMAP.md` — phases and order
- `TASKS.md` — checklist
- `PROJECT_ARCHITECTURE.md` — layers and folders
- `DOMAIN_MODEL.md` — formal state and invariants
- `FORMULAS.md` — math (collimation, zenith, tilt)
- `GLOSSARY.md` — bilingual terms, use exact names
- `AGENTS.md` — ownership boundaries
- `CURSOR_RULES.md` — hard coding rules
- `UI_GUIDELINES.md` — style and performance budget
- `TECH_SPEC.md` — targets and lite mode rules

Read the relevant doc before writing code in that area. If a task touches multiple layers, read multiple docs — don't guess at boundaries.

---

## Model usage policy

Default: **Sonnet 4.6**. Use Opus rarely.

### Use Haiku 4.5 for
- Boilerplate components and config files
- Renames, refactors that don't change logic
- i18n key generation and translation stubs
- Simple Vitest tests by template
- Lint fixes, prettier runs, package.json edits
- Reading and summarizing files

### Use Sonnet 4.6 (default) for
- React components, R3F scene code
- Zustand stores and actions
- UI panels and controls
- GLB integration
- Most debugging
- Routine math wiring (calling `geometry/` functions from scene)

### Use Opus 4.7 only when
- Writing pure math in `geometry/` (rotation matrices, error formulas, invariants)
- Designing the pivot hierarchy for the theodolite (Phase 2)
- Implementing the zenith transition (Phase 6) — sign inversion, two-face logic
- Debugging a bug that Sonnet circled twice without progress
- Architectural decisions that span 3+ layers

**Switch back to Sonnet immediately after the Opus task is done.**
Do not stay on Opus "just in case".

If you (Claude) think Opus is needed, **say so explicitly** before switching:
> "This needs Opus because [reason]. Switch with `/model opus`, then back to Sonnet after."

If the user is on Opus and the task is routine, suggest:
> "This task is fine for Sonnet. Want to switch with `/model sonnet`?"

---

## Session hygiene

Long sessions burn the usage limit faster — every reply re-reads the whole conversation.

**Tell the user to open a new session when:**
- A logical chunk of work just finished (a task from `TASKS.md` is complete)
- The conversation has grown past ~30 back-and-forth turns
- The topic shifts significantly (e.g. from math to UI styling)
- A long file dump or research has filled context with material no longer needed
- The user is about to start a different phase from `ROADMAP.md`

Phrase it plainly:
> "This is a good point to start a fresh session. Current context is large and the next task is unrelated to what we just did. New session = lower token usage per reply."

Do not nag. One suggestion per natural breakpoint. If the user says "keep going", drop it.

---

## Token economy

Read whatever you need to write correct code. Correctness first, economy second.

Soft guidelines, not hard rules:

- Before editing a function, check where it's used. Before changing a type, check who imports it. Skipping these to save tokens causes more re-work later.
- If you only need a small section of a long file, use `view` with a line range instead of reading the whole thing.
- Prefer `str_replace` for small, localized edits. For rewrites that touch most of a file, replacing the file is cleaner — don't force `str_replace` into something it's bad at.
- For repetitive edits across files, batch them in one turn when possible.
- Disable MCP connectors and web search when clearly unrelated to the current task.
- When quoting docs in your reply, quote the relevant section, not the whole file.

If you're unsure whether to read a file, **read it**. A few extra tokens beat a broken build.

---

## Coding rules (short)

Full rules in `docs/CURSOR_RULES.md`. The non-negotiables:

- TypeScript only, no `any`
- Angles in radians internally, degrees only at UI boundary
- `geometry/` and `mechanics/` never import `three`
- No store writes inside `useFrame`
- Use terms from `docs/GLOSSARY.md`
- Math has Vitest tests before being wired into the scene

---

## Phase discipline

Work on one phase at a time, in the order in `docs/ROADMAP.md`.
Do not start Phase N+1 work while Phase N has unchecked invariants.
If the user asks for something out of order, ask whether to defer or to skip ahead deliberately.
