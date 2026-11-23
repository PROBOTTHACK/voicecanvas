import { create } from "zustand";
import { createEmptyDocument } from "../features/document/createDocument";
import type { CanvasDocument } from "../types/document";

/**
 * Editor state. Holds plain data only — never Fabric instances.
 * The document is written exclusively by the command engine (VC-003+);
 * components read via the selectors below.
 */
export interface EditorState {
  document: CanvasDocument;
  selectedObjectIds: string[];
  activeGroupId: string | null;
  lastCreatedObjectId: string | null;
}

export const useEditorStore = create<EditorState>()(() => ({
  document: createEmptyDocument(),
  selectedObjectIds: [],
  activeGroupId: null,
  lastCreatedObjectId: null,
}));

export const selectDocument = (state: EditorState) => state.document;
export const selectObjects = (state: EditorState) => state.document.objects;
export const selectSelectedIds = (state: EditorState) => state.selectedObjectIds;
