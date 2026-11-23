import { CanvasStage } from "../canvas/CanvasStage";
import { PropertiesPanel } from "../properties/PropertiesPanel";
import { EditorHeader } from "./EditorHeader";
import { LeftSidebar } from "./LeftSidebar";

/**
 * Four-region editor shell: header, left sidebar, canvas, properties panel.
 * Desktop-first; below the `lg` breakpoint the properties panel hides and the
 * canvas takes the remaining space.
 */
export function EditorLayout() {
  return (
    <div className="grid h-full grid-cols-[240px_minmax(0,1fr)] grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-app text-fg lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      <div className="col-span-full">
        <EditorHeader />
      </div>
      <LeftSidebar />
      <CanvasStage />
      <aside className="hidden min-h-0 border-l border-line bg-panel lg:block" aria-label="Properties">
        <PropertiesPanel />
      </aside>
    </div>
  );
}
