import { selectDocument, useEditorStore } from "../store/editorStore";

export default function App() {
  const document = useEditorStore(selectDocument);
  return (
    <main className="flex h-full items-center justify-center text-muted">
      VoiceCanvas — {document.name} ({document.width}×{document.height})
    </main>
  );
}
