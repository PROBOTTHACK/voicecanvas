# Engineering Decisions

1. React + TypeScript + Vite frontend
2. Fabric.js canvas engine
3. Zustand state
4. Tailwind CSS styling
5. Lucide React icons
6. Python + FastAPI backend (planned)
7. PostgreSQL (planned)
8. Cloudflare R2 assets (planned)
9. Web Speech API first for speech
10. Cloud LLM API first for inference (provider-agnostic)
11. Push-to-talk voice
12. Pixel units
13. Default canvas 1080x1080
14. Document model is source of truth
15. Fabric.js is rendering/interaction only
16. AI emits structured operations, never executable code
17. All operations pass through allowlisted command registry
18. Manual and voice edit the same document
19. Every object has a stable unique ID
20. Ambiguity -> clarification, not guessing
21. Commands support undo/redo
22. Sprint 1 is frontend-only
23. No AI/voice before the basic editor is reliable

Change any of these only with a documented reason (add a dated entry below).

## Log
- **2026-11-23 — Fabric.js v7 (not v6).** Latest stable at project start is 7.4. ESM API (`import { Canvas, Rect, ... } from "fabric"`) matches v6, but v7 defaults `originX/originY` to `"center"`; the Fabric adapter must set origins explicitly and never rely on defaults.
- **2026-11-23 — Rotation convention.** Model `x`/`y` is the top-left of the object's *unrotated* box; `rotation` (degrees, clockwise) is applied about the box center (Figma/Canva behaviour). The adapter converts top-left ↔ Fabric center origin.
- **2026-11-23 — Toolchain as scaffolded by create-vite 9.** Vite 8, @vitejs/plugin-react 6, TypeScript 7 (strict by default), oxlint for `npm run lint`. If Vite 8 causes issues, fall back to Vite 7 and log it here.
- **2026-11-23 — Public vs internal commands.** `PublicCommand` (UI/voice-requestable) and `InternalCommand` (trusted, renderer-derived, e.g. `text.sync_layout`) are separate types with separate registries. Internal ops go only through `dispatchInternal` (canvas origin) and are never in the public registry or any AI allowlist.
- **2026-11-23 — AI permissions separate from the UI registry.** `permissions.ts` maps each origin to its allowed public operations. The voice/AI allowlist (`AI_OPERATION_ALLOWLIST`) is explicit and starts empty; an operation reaches the AI only when added there.
- **2026-11-23 — Document revision for stale-result protection.** The store keeps a monotonic `documentRevision` (bumped by commands, internal sync, undo, redo). Internal results carry `basedOnRevision` + `sourceOperationId`; mismatches are skipped. Sync never adds history entries or clears redo; it amends only the entry named by `sourceOperationId`, and only if that entry's snapshot is the measured document.
- **2026-11-23 — Snapshot history.** Every successful public command records exactly one entry (immutable before/after snapshots, 100-entry cap); failed/rejected/skipped commands record none. Undo/redo exist in the dispatcher; UI buttons stay disabled until wired.
- **2026-11-23 — Font registry.** `fontFamily` stays a plain string in the model; `features/document/fonts.ts` registers accepted families with their weights/styles. Only Inter Variable (normal, 100–900) is registered; italic is added once an italic face is bundled.
- **2026-11-23 — Vitest** added as the test runner (dev dependency, Vite 8 compatible).
- **2026-11-23 — node-canvas install script not approved.** `canvas` is an optional Fabric dependency only used when running Fabric in Node; the browser editor does not need it.
