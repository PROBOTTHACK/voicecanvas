import { create } from "zustand";
import { createHistory, type HistoryState } from "../features/commands/history";
import { createEmptyDocument } from "../features/document/createDocument";
import type { CanvasDocument } from "../types/document";

/**
 * Editor state. Holds plain data only — never Fabric instances.
 * `document`, `documentRevision`, `history` and `recentOperationIds` are written
 * exclusively by the command dispatcher (`features/commands/dispatch.ts`);
 * components read via the selectors below.
 */
export interface EditorState {
  document: CanvasDocument;
  /**
   * Monotonic counter bumped on every document change (commands, internal
   * sync, undo, redo). Lets delayed/derived results detect they are stale.
   */
  documentRevision: number;
  selectedObjectIds: string[];
  activeGroupId: string | null;
  lastCreatedObjectId: string | null;
  history: HistoryState;
  /** Recently applied operation IDs (duplicate-execution guard). */
  recentOperationIds: readonly string[];
}

export function createInitialEditorState(): EditorState {
  return {
    document: createEmptyDocument(),
    documentRevision: 0,
    selectedObjectIds: [],
    activeGroupId: null,
    lastCreatedObjectId: null,
    history: createHistory(),
    recentOperationIds: [],
  };
}

export const useEditorStore = create<EditorState>()(() => createInitialEditorState());

export const selectDocument = (state: EditorState) => state.document;
export const selectObjects = (state: EditorState) => state.document.objects;
export const selectSelectedIds = (state: EditorState) => state.selectedObjectIds;
