import { useElementSize } from "../../hooks/useElementSize";
import { selectDocument, useEditorStore } from "../../store/editorStore";
import { fitScale } from "../../utils/fitScale";

const STAGE_PADDING = 48;

/**
 * Central workspace. Renders the document surface scaled to fit.
 * VC-003 mounts the Fabric canvas here; the same `scale` will drive Fabric's
 * zoom (a Fabric canvas must never be CSS-transformed — it breaks pointer math).
 */
export function CanvasStage() {
  const document = useEditorStore(selectDocument);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const scale = fitScale(size, document, STAGE_PADDING);

  return (
    <main
      ref={ref}
      className="relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-app bg-[radial-gradient(circle,#262626_1px,transparent_1px)] bg-size-[24px_24px]"
      aria-label="Canvas workspace"
    >
      {scale > 0 && (
        <div
          className="shadow-[0_8px_40px_rgb(0_0_0/0.5)]"
          style={{
            width: document.width * scale,
            height: document.height * scale,
            background: document.background,
          }}
        />
      )}

      <div className="absolute right-4 bottom-4 rounded-md border border-line bg-panel px-2 py-1 text-xs tabular-nums text-muted">
        {Math.round(scale * 100)}%
      </div>
    </main>
  );
}
