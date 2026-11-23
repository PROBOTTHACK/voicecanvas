# Sprint 1 — Frontend Foundation (~7 days)

Frontend only. **No AI, speech, backend, or DB.** Don't add AI just to look complete.

## VC-001 Project Initialization (P0)
- `git init`; create Vite React-TS app; install deps; configure Tailwind v4; create folder structure; initial document types; Zustand setup; confirm dev server.

## VC-002 Editor Interface (P0)
- Header, left toolbar, central canvas workspace, right properties panel, layers panel, responsive layout, dark design system.

## VC-003 Canvas Integration (P0)
- Init Fabric.js; 1080x1080 canvas; background; rectangle/circle/text creation; render objects from document state.

## VC-004 Object Manipulation (P0)
- Select, move, resize, rotate, fill color; sync selected IDs with Zustand; sync Fabric transforms to document.

## VC-005 Testing & Cleanup (P1)
- Test shape/text creation, selection changes, move, resize, rotate, color, canvas resize; TypeScript checks; fix warnings; document setup.

## Definition of Done
- App starts without errors; workspace renders; 1080x1080 canvas
- Create rectangles, circles, text
- Select, move, resize, rotate, recolor objects
- Canvas background changeable
- Layers and selection synchronized
- Document state consistent with Fabric
- TypeScript checks pass

## Recommended order
1. Vite React-TS 2. Tailwind 3. Document types 4. Zustand 5. EditorLayout 6. EditorHeader 7. Left toolbar 8. CanvasStage 9. Fabric 10. Shape creation 11. Text creation 12. Selection/transforms 13. PropertiesPanel 14. LayersPanel 15. Tests + cleanup

## Setup
```bash
mkdir voicecanvas && cd voicecanvas && git init
npm create vite@latest frontend -- --template react-ts
mkdir backend docs
cd frontend && npm install
npm install fabric zustand lucide-react
npm install -D tailwindcss @tailwindcss/vite
```
`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [react(), tailwindcss()] });
```
`src/index.css`:
```css
@import "tailwindcss";
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, sans-serif; background: #111111; }
```
Verify package versions/compatibility on install.

## Commit sequence
`chore: initialize VoiceCanvas frontend` -> `feat: build editor workspace` -> `feat: integrate Fabric.js canvas` -> `feat: implement shape creation` -> `feat: implement text objects` -> `feat: add object selection and manipulation` -> `feat: synchronize editor state` -> `test: add canvas interaction tests`
