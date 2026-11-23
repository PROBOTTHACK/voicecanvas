# CLAUDE.md — VoiceCanvas

Read this first every session. Deeper detail lives in `docs/`.

## What this is
VoiceCanvas is a **voice-first, agentic graphic design editor** (web). Users speak commands ("Create a red rectangle 350x400", "make it blue", "center the heading") and can also edit manually. It is a real design editor with a structured document model — **not a chatbot with a canvas attached**.

## Current stage
**Sprint 1 — Frontend foundation.** Build the editor only: layout, Fabric.js canvas, rectangle/circle/text, select/move/resize/rotate, fill color, background, layers + properties panels, Zustand sync.
Do NOT build in Sprint 1 unless explicitly asked: LLM integration, speech recognition, FastAPI endpoints, database, agent workflows.
Never claim a feature is implemented/tested unless it was actually built and verified.

## Stack (do not change without explaining why)
- Frontend: React, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Fabric.js, Zustand, Lucide React
- Backend (later): Python, FastAPI, WebSockets, PostgreSQL, Cloudflare R2
- Speech (Sprint 2): Browser Web Speech API behind a swappable service interface
- AI (Sprint 2+): Cloud LLM behind a provider abstraction (no vendor lock-in)

## Non-negotiable architecture rules
1. **The normalized document model is the source of truth.** Fabric.js only renders/interacts. Never treat Fabric objects as the document.
2. Document model must not import or depend on Fabric.js.
3. A dedicated **Fabric adapter** syncs model <-> canvas. Associate via stable object IDs. Avoid update loops (guard flag / origin tagging).
4. Every object has a stable unique ID. Never identify objects by array index, layer position, name, or Fabric identity.
5. **All edits go through the command engine** (manual and voice alike). One state, no separate voice/manual paths.
6. The LLM only proposes structured operations from an **allowlisted command registry**. It never generates executable code, never touches Fabric, never bypasses validation.
7. Validate every operation (registry -> schema -> params -> target resolution) before executing.
8. Ambiguous references ("make it blue" with 3 candidates) -> ask for clarification; never guess randomly.
9. Commands must be undoable/redoable.
10. Spatial math (center, align, relative offsets) is computed **deterministically by the command engine**, not by the LLM.
11. Coordinates: pixels, origin top-left, y grows downward; store top-left x/y + width/height. Default canvas 1080x1080.

## Code conventions
- TypeScript everywhere; avoid `any`; use discriminated unions for objects, commands, voice states, results.
- Keep UI, state, business logic, and rendering separate. No big logic in `App.tsx` or React components.
- No AI logic inside the canvas component.
- Modular files; no premature abstractions or extra dependencies. Don't implement future object types early.
- User-facing errors must be understandable ("The rectangle's width must be greater than zero."), never stack traces.
- Preserve existing conventions; don't silently remove functionality; don't touch unrelated files when debugging — find the root cause.

## UI direction
Premium, minimal, dark pro-tool feel. App bg `#111111`, canvas `#FFFFFF`, accent `#6366F1`, success `#22C55E`. Four regions: top header, left sidebar, central canvas, right properties panel; voice bar floats near bottom (Sprint 2). Canvas is the visual focus. See `docs/DESIGN_SYSTEM.md`.

## Working style
- Work incrementally; don't dump the whole app in one response.
- Before a major feature: inspect existing structure, list files to change, consider model/state/Fabric-sync impact and edge cases.
- Recommend one approach and briefly state trade-offs when options exist.
- Give complete files with correct imports when asked; explain install/run/verify steps.
- Don't ask questions already answered in these docs; ask focused questions only for real ambiguity.
- Run `npm run build` / `tsc --noEmit` before calling work done; run tests when they exist.

## Commands
```bash
cd frontend
npm install
npm run dev          # Vite dev server
npm run build        # type-check + production build
npx tsc --noEmit     # type check only
```

## Docs map
- `docs/PRODUCT_SPEC.md` — vision, users, scope, UX, example voice commands
- `docs/ARCHITECTURE.md` — components, data model, sync flow, agent pipeline
- `docs/COMMAND_REGISTRY.md` — allowlisted operations + validation
- `docs/SPRINT_1.md` — tickets VC-001..005, definition of done
- `docs/ROADMAP.md` — sprints/weeks
- `docs/TESTING.md` — test strategy and edge cases
- `docs/DESIGN_SYSTEM.md` — colors, layout, interaction design
- `docs/DECISIONS.md` — engineering decisions log

## First task for a fresh session
Don't generate the app. Summarize understanding, list main components, confirm stack/constraints, explain how document model / Zustand / Fabric / command engine relate, state current stage, propose the exact first Sprint 1 milestone — then wait for the repo state or an explicit go-ahead.
