import { Download, Redo2, Undo2 } from "lucide-react";
import { selectDocument, useEditorStore } from "../../store/editorStore";
import { IconButton } from "../ui/IconButton";

export function EditorHeader() {
  const document = useEditorStore(selectDocument);

  return (
    <header className="flex h-14 items-center justify-between border-b border-line bg-panel px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold">
          V
        </div>
        <span className="text-sm font-semibold tracking-tight">VoiceCanvas</span>
        <span className="h-4 w-px bg-line" aria-hidden />
        <span className="truncate text-sm text-fg">{document.name}</span>
        <span className="text-xs text-subtle">Not saved</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Wired to the command history in a later ticket. */}
        <IconButton icon={Undo2} label="Undo" disabled />
        <IconButton icon={Redo2} label="Redo" disabled />
        <span className="mx-2 h-5 w-px bg-line" aria-hidden />
        {/* Export ships in the persistence/export milestone. */}
        <button
          type="button"
          disabled
          title="Export"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent"
        >
          <Download size={16} strokeWidth={1.75} />
          Export
        </button>
      </div>
    </header>
  );
}
