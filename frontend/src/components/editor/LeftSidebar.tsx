import { CanvasToolbar } from "../canvas/CanvasToolbar";
import { LayersPanel } from "../layers/LayersPanel";
import { PanelSection } from "../ui/PanelSection";

export function LeftSidebar() {
  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-panel" aria-label="Tools and layers">
      <PanelSection title="Tools">
        <CanvasToolbar />
      </PanelSection>
      <LayersPanel />
    </aside>
  );
}
