import type { CanvasDocument } from "../../types/document";
import type { CommandOrigin, PublicOperation } from "./types";

export const HISTORY_LIMIT = 100;

/** One undoable public command. Snapshots are immutable document references. */
export interface HistoryEntry {
  operationId: string;
  operation: PublicOperation;
  origin: CommandOrigin;
  description: string;
  before: CanvasDocument;
  after: CanvasDocument;
}

export interface HistoryState {
  past: readonly HistoryEntry[];
  future: readonly HistoryEntry[];
}

export function createHistory(): HistoryState {
  return { past: [], future: [] };
}

/** Records a successful public command. Clears the redo stack (branching). */
export function recordEntry(history: HistoryState, entry: HistoryEntry): HistoryState {
  return { past: [...history.past, entry].slice(-HISTORY_LIMIT), future: [] };
}

/** Operation that produced the current document state, or null at the start. */
export function headOperationId(history: HistoryState): string | null {
  return history.past.at(-1)?.operationId ?? null;
}

export function undoHistory(history: HistoryState): { history: HistoryState; document: CanvasDocument; entry: HistoryEntry } | null {
  const entry = history.past.at(-1);
  if (!entry) return null;
  return {
    entry,
    document: entry.before,
    history: { past: history.past.slice(0, -1), future: [entry, ...history.future] },
  };
}

export function redoHistory(history: HistoryState): { history: HistoryState; document: CanvasDocument; entry: HistoryEntry } | null {
  const [entry, ...rest] = history.future;
  if (!entry) return null;
  return {
    entry,
    document: entry.after,
    history: { past: [...history.past, entry], future: rest },
  };
}

/**
 * Amends the `after` snapshot of the entry identified by `operationId`, but only
 * when that snapshot is exactly `expectedAfter` (the document the derived change
 * was computed from). Used for internal layout sync: never adds entries and
 * never touches the redo stack. Returns the same history object when nothing matches.
 */
export function amendEntryAfter(
  history: HistoryState,
  operationId: string,
  expectedAfter: CanvasDocument,
  nextAfter: CanvasDocument,
): HistoryState {
  const index = history.past.findIndex((entry) => entry.operationId === operationId);
  if (index === -1 || history.past[index].after !== expectedAfter) return history;
  const past = history.past.slice();
  past[index] = { ...past[index], after: nextAfter };
  return { past, future: history.future };
}
