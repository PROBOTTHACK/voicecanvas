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
- **2026-11-23 — node-canvas install script not approved.** `canvas` is an optional Fabric dependency only used when running Fabric in Node; the browser editor does not need it.
