import { Circle, Square, Type, type LucideIcon } from "lucide-react";
import { objectLabel } from "../../features/document/objectLabel";
import { selectObjects, selectSelectedIds, useEditorStore } from "../../store/editorStore";
import type { CanvasObjectType } from "../../types/document";

const TYPE_ICONS: Record<CanvasObjectType, LucideIcon> = {
  rectangle: Square,
  circle: Circle,
  text: Type,
};

/** Layer list, topmost layer first. Read-only until selection sync lands (VC-004). */
export function LayersPanel() {
  const objects = useEditorStore(selectObjects);
  const selectedIds = useEditorStore(selectSelectedIds);
  const layers = [...objects].reverse();

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Layers">
      <h2 className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">Layers</h2>

      {layers.length === 0 ? (
        <p className="px-4 text-xs leading-relaxed text-subtle">No layers yet — add a shape or text.</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {layers.map((object) => {
            const Icon = TYPE_ICONS[object.type];
            const selected = selectedIds.includes(object.id);
            return (
              <li
                key={object.id}
                aria-selected={selected}
                className={`flex h-8 items-center gap-2 rounded-md px-2 text-sm ${
                  selected ? "bg-accent-soft text-fg" : "text-muted"
                } ${object.visible ? "" : "opacity-50"}`}
              >
                <Icon size={14} strokeWidth={1.75} className={selected ? "text-accent" : "text-subtle"} />
                <span className="truncate">{objectLabel(object)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
