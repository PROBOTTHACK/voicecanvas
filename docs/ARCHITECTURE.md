# Architecture

## Components
1. **React Editor Interface** — header, toolbar, canvas, panels, voice bar, history. No AI logic.
2. **Document Model** — source of truth; Fabric-independent.
3. **Rendering Engine** — Fabric.js + adapter.
4. **Command Engine** — validates/executes deterministic operations, history.
5. **AI Agent Layer** — NL -> structured ops or clarification.
6. **Voice Processing Layer** — mic capture, speech-to-text, states (swappable provider).
7. **Backend/Persistence** — FastAPI, PostgreSQL, R2 (later).

## Golden rule
**Document model = truth. Fabric.js = renderer/interaction layer.**
Reasons: stable IDs, groups/relationships, command history, AI context, persistence, undo/redo, export config.

## Sync flows
**Command -> canvas:** command engine updates model -> Zustand -> adapter creates/updates/removes Fabric objects -> render.
**Manual -> model:** Fabric event (move/scale/rotate) -> adapter reads new geometry (normalize scale into width/height) -> model updated via store/command -> UI updates.
Use stable IDs, ignore adapter-originated events to prevent loops.

## Data model
```ts
interface CanvasDocument {
  id: string; name: string; width: number; height: number; background: string;
  objects: CanvasObject[]; createdAt: string; updatedAt: string;
}
interface BaseCanvasObject {
  id: string; type: CanvasObjectType;
  x: number; y: number; width: number; height: number;
  rotation: number; opacity: number; visible: boolean; locked: boolean;
  fill: string; stroke?: string; strokeWidth?: number; parentId?: string;
}
interface RectangleObject extends BaseCanvasObject { type: "rectangle"; cornerRadius: number; }
interface CircleObject extends BaseCanvasObject { type: "circle"; }
interface TextObject extends BaseCanvasObject {
  type: "text"; text: string; fontFamily: string; fontSize: number; fontWeight: string;
  fontStyle?: "normal" | "italic"; textAlign?: "left" | "center" | "right";
  lineHeight?: number; letterSpacing?: number;
}
type CanvasObject = RectangleObject | CircleObject | TextObject;
```
Array order = layer order. Future: images, SVG, groups, lines, paths — don't pre-build.

## State (Zustand)
```ts
interface EditorState {
  document: CanvasDocument;
  selectedObjectIds: string[];
  activeGroupId: string | null;
  lastCreatedObjectId: string | null;
}
```
Later split into: document, selection, canvas, voice, command execution, history, UI. No redundant copies. Fabric instances are never stored as state.

## Agent pipeline
Speech -> text -> intent interpretation -> context retrieval -> structured command -> schema validation -> target resolution -> execution -> model update -> Fabric sync -> render -> feedback.

```ts
interface AgentResponse {
  status: "ready" | "clarification_required" | "unsupported";
  message?: string; operations?: DesignOperation[]; clarificationQuestion?: string;
}
interface EditorContext {
  documentId: string; selectedObjectIds: string[]; activeGroupId: string | null;
  lastCreatedObjectId: string | null; objects: CanvasObject[];
  canvas: { width: number; height: number; background: string };
  recentOperations: DesignOperation[];
}
```
Keep context compact.

## LLM safety
LLM must never: emit executable JS/Python, touch Fabric/browser, modify state unvalidated, bypass registry. It only returns allowlisted structured operations.

## Spatial intelligence
LLM interprets intent; engine computes geometry.
- Center X: `(canvasW - objW) / 2` (1080, 350 -> 365)
- Center Y: `(canvasH - objH) / 2`
- Top-right: `x = canvasW - objW; y = 0`
- Relative: `newX = x + 50`; below heading: `headingY + headingH + 30`
- Rotated objects use effective bounding boxes; honor requested padding/margins.

## Execution pipeline
Receive op -> registry check -> schema -> params -> resolve target -> permission check -> capture previous state -> execute -> update model -> record history -> sync renderer -> return result.

## History
Every edit reversible. Snapshot history OK for small docs; move toward patches/transactions as it grows. Store operation descriptions ("Moved rectangle to the left") and status.

## Services
Speech provider and LLM provider are interfaces so implementations are swappable.
