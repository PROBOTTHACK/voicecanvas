import { objectTypeLabel } from "../../features/document/objectLabel";
import { selectDocument, selectSelectedIds, useEditorStore } from "../../store/editorStore";
import type { CanvasObject } from "../../types/document";
import { PanelSection } from "../ui/PanelSection";

/**
 * Contextual properties. Read-only until the command engine lands (VC-003/004);
 * edits will dispatch commands, never mutate the store directly.
 */
export function PropertiesPanel() {
  const document = useEditorStore(selectDocument);
  const selectedIds = useEditorStore(selectSelectedIds);
  const selected = document.objects.filter((object) => selectedIds.includes(object.id));

  if (selected.length === 0) {
    return (
      <PanelSection title="Document">
        <dl className="space-y-2">
          <Field label="Name" value={document.name} />
          <Field label="Size" value={`${document.width} × ${document.height} px`} />
          <Field label="Background" value={document.background.toUpperCase()} swatch={document.background} />
        </dl>
      </PanelSection>
    );
  }

  if (selected.length > 1) {
    return (
      <PanelSection title="Selection">
        <p className="text-sm text-muted">{selected.length} objects selected</p>
      </PanelSection>
    );
  }

  return <ObjectProperties object={selected[0]} />;
}

function ObjectProperties({ object }: { object: CanvasObject }) {
  return (
    <>
      <PanelSection title={objectTypeLabel(object.type)}>
        <dl className="grid grid-cols-2 gap-2">
          <Field label="X" value={round(object.x)} />
          <Field label="Y" value={round(object.y)} />
          <Field label="W" value={round(object.width)} />
          <Field label="H" value={round(object.height)} />
          <Field label="Rotation" value={`${round(object.rotation)}°`} />
          <Field label="Opacity" value={`${Math.round(object.opacity * 100)}%`} />
        </dl>
      </PanelSection>
      <PanelSection title="Fill">
        <dl>
          <Field label="Color" value={object.fill.toUpperCase()} swatch={object.fill} />
        </dl>
      </PanelSection>
    </>
  );
}

function Field({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-panel-raised px-2.5 py-1.5 text-xs">
      <dt className="text-subtle">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-fg">
        {swatch && <span className="h-3.5 w-3.5 shrink-0 rounded-sm border border-line" style={{ background: swatch }} />}
        <span className="truncate tabular-nums">{value}</span>
      </dd>
    </div>
  );
}

function round(value: number): string {
  return String(Math.round(value * 100) / 100);
}
