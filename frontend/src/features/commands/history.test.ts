import { describe, expect, it } from "vitest";
import { createEmptyDocument } from "../document/createDocument";
import type { CanvasDocument } from "../../types/document";
import {
  amendEntryAfter,
  createHistory,
  headOperationId,
  HISTORY_LIMIT,
  recordEntry,
  redoHistory,
  undoHistory,
  type HistoryEntry,
  type HistoryState,
} from "./history";

function doc(name: string): CanvasDocument {
  return { ...createEmptyDocument(), name };
}

function entry(operationId: string, before: CanvasDocument, after: CanvasDocument): HistoryEntry {
  return { operationId, operation: "shape.create", origin: "ui", description: operationId, before, after };
}

describe("history", () => {
  const d0 = doc("d0");
  const d1 = doc("d1");
  const d2 = doc("d2");
  const d3 = doc("d3");

  function twoSteps(): HistoryState {
    return recordEntry(recordEntry(createHistory(), entry("a", d0, d1)), entry("b", d1, d2));
  }

  it("records sequential commands, one entry each", () => {
    const history = twoSteps();
    expect(history.past.map((e) => e.operationId)).toEqual(["a", "b"]);
    expect(headOperationId(history)).toBe("b");
  });

  it("undo and redo restore exact snapshot references", () => {
    const undone = undoHistory(twoSteps())!;
    expect(undone.document).toBe(d1);
    expect(headOperationId(undone.history)).toBe("a");
    expect(undone.history.future.map((e) => e.operationId)).toEqual(["b"]);

    const undoneTwice = undoHistory(undone.history)!;
    expect(undoneTwice.document).toBe(d0);
    expect(headOperationId(undoneTwice.history)).toBeNull();
    expect(undoHistory(undoneTwice.history)).toBeNull();

    const redone = redoHistory(undoneTwice.history)!;
    expect(redone.document).toBe(d1);
    const redoneTwice = redoHistory(redone.history)!;
    expect(redoneTwice.document).toBe(d2);
    expect(redoHistory(redoneTwice.history)).toBeNull();
  });

  it("a new command after undo clears the redo stack (branching)", () => {
    const undone = undoHistory(twoSteps())!;
    const branched = recordEntry(undone.history, entry("c", d1, d3));
    expect(branched.past.map((e) => e.operationId)).toEqual(["a", "c"]);
    expect(branched.future).toEqual([]);
    expect(redoHistory(branched)).toBeNull();
  });

  it("caps history at the limit, dropping the oldest entries", () => {
    let history = createHistory();
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) history = recordEntry(history, entry(`op-${i}`, d0, d1));
    expect(history.past).toHaveLength(HISTORY_LIMIT);
    expect(history.past[0].operationId).toBe("op-5");
  });

  it("does not mutate previous history states", () => {
    const first = recordEntry(createHistory(), entry("a", d0, d1));
    const second = recordEntry(first, entry("b", d1, d2));
    expect(first.past).toHaveLength(1);
    undoHistory(second);
    expect(second.past).toHaveLength(2);
  });

  describe("amendEntryAfter", () => {
    it("replaces the after snapshot of the matching entry only", () => {
      const history = twoSteps();
      const amended = amendEntryAfter(history, "b", d2, d3);
      expect(amended.past[1].after).toBe(d3);
      expect(amended.past[0]).toBe(history.past[0]);
      expect(history.past[1].after).toBe(d2); // original untouched
    });

    it("is a no-op when the id is unknown or the snapshot does not match", () => {
      const history = twoSteps();
      expect(amendEntryAfter(history, "zzz", d2, d3)).toBe(history);
      expect(amendEntryAfter(history, "b", d1, d3)).toBe(history);
    });

    it("never touches the redo stack", () => {
      const undone = undoHistory(twoSteps())!;
      const amended = amendEntryAfter(undone.history, "a", d1, d3);
      expect(amended.future).toBe(undone.history.future);
      expect(amended.past[0].after).toBe(d3);
    });
  });
});
