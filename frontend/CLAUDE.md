# frontend/CLAUDE.md

Scoped rules for work inside `frontend/`. Root `CLAUDE.md` still applies.

## Layout
```
src/
  app/                 app bootstrap
  components/
    canvas/            CanvasStage, CanvasToolbar
    editor/            EditorLayout, EditorHeader
    layers/            LayersPanel
    properties/        PropertiesPanel
    voice/             VoiceBar (Sprint 2)
  features/
    document/          document model helpers (Fabric-free)
    selection/         selection logic
    commands/          command engine + registry
  hooks/  services/  utils/
  store/editorStore.ts Zustand store
  types/document.ts    CanvasDocument, CanvasObject unions
```

## Rules
- `types/document.ts` and `features/document/*` must never import `fabric`.
- Only the canvas adapter (under `components/canvas` or `services`) imports `fabric`.
- Components read state via Zustand selectors and dispatch commands; they don't mutate the document directly.
- Manual Fabric events (move/scale/rotate) -> adapter -> command/store update -> UI. Use IDs, and guard against re-entrant sync loops.
- Fabric `scaleX/scaleY` must be normalized back into model `width/height` after resize.
- Tailwind v4: `@import "tailwindcss";` in `index.css`, plugin in `vite.config.ts` (no tailwind.config required).
- Icons: `lucide-react` only.
- Verify installed package versions (esp. Fabric v6+ ESM API: `import { Canvas, Rect, Circle, Textbox } from "fabric"`).
