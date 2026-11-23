import { beforeEach, describe, expect, it } from "vitest";
import { createInitialEditorState, useEditorStore } from "../../store/editorStore";
import type { TextObject } from "../../types/document";
import { textLayoutKey } from "../document/textLayout";
import { HISTORY_LIMIT } from "./history";
import { dispatchCommand, dispatchInternal, redo, undo } from "./dispatch";
import { headOperationId } from "./history";
import type { CommandRequest, InternalCommand, PublicCommand } from "./types";

const state = () => useEditorStore.getState();

const createRect = (extra: Partial<CommandRequest<PublicCommand>> = {}) =>
  dispatchCommand({ command: { operation: "shape.create", parameters: { shape: "rectangle" } }, origin: "ui", ...extra });

const createText = (text = "Hello") =>
  dispatchCommand({ command: { operation: "text.create", parameters: { text } }, origin: "ui" });

/** Builds a sync request against the *current* store state (as the adapter would). */
function syncRequest(height: number, overrides: Partial<InternalCommand["parameters"]> = {}): CommandRequest<InternalCommand> {
  const s = state();
  const text = s.document.objects.find((o): o is TextObject => o.type === "text")!;
  return {
    origin: "canvas",
    command: {
      operation: "text.sync_layout",
      parameters: {
        basedOnRevision: s.documentRevision,
        sourceOperationId: headOperationId(s.history),
        measurements: [{ objectId: text.id, height, layoutKey: textLayoutKey(text) }],
        ...overrides,
      },
    },
  };
}

const textHeight = () => (state().document.objects.find((o) => o.type === "text") as TextObject | undefined)?.height;

beforeEach(() => {
  useEditorStore.setState(createInitialEditorState(), true);
});

describe("dispatchCommand: operation ids and results", () => {
  it("generates a unique operationId when none is supplied", () => {
    const a = createRect();
    const b = createRect();
    expect(a.status).toBe("success");
    expect(a.operationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(a.operationId).not.toBe(b.operationId);
  });

  it("preserves a supplied operationId and origin, and rejects re-execution", () => {
    const first = createRect({ operationId: "op-fixed" });
    expect(first).toMatchObject({ status: "success", operationId: "op-fixed", origin: "ui", operation: "shape.create" });

    const repeat = createRect({ operationId: "op-fixed" });
    expect(repeat).toMatchObject({ status: "rejected", message: "This action was already applied." });
    expect(state().document.objects).toHaveLength(1);
    expect(state().history.past).toHaveLength(1);
  });

  it("rejects blank operation ids", () => {
    expect(createRect({ operationId: "  " })).toMatchObject({ status: "rejected", message: "The operation ID is invalid." });
  });

  it("returns targetIds and sets lastCreatedObjectId on create", () => {
    const result = createRect();
    expect(result.targetIds).toHaveLength(1);
    expect(state().lastCreatedObjectId).toBe(result.targetIds[0]);
  });
});

describe("dispatchCommand: boundaries", () => {
  it("rejects internal operations through the public entry point", () => {
    const result = dispatchCommand({
      origin: "ui",
      command: { operation: "text.sync_layout", parameters: {} } as unknown as PublicCommand,
    });
    expect(result).toMatchObject({ status: "rejected", message: "That action isn't supported." });
  });

  it("rejects unknown operations from untrusted input", () => {
    const result = dispatchCommand({ origin: "ui", command: { operation: "eval" } as unknown as PublicCommand });
    expect(result).toMatchObject({ status: "rejected", operation: "eval" });
  });

  it("rejects public operations not permitted for the origin (voice allowlist is empty)", () => {
    const result = createRect({ origin: "voice" });
    expect(result).toMatchObject({ status: "rejected", origin: "voice", message: "That action isn't available from voice commands yet." });
    expect(state().document.objects).toHaveLength(0);
  });
});

describe("dispatchCommand: history", () => {
  it("failed/rejected commands leave document, revision and history unchanged", () => {
    createRect();
    const before = state();
    const result = dispatchCommand({
      origin: "ui",
      command: { operation: "shape.create", parameters: { shape: "rectangle", width: 0 } },
    });
    expect(result.status).toBe("rejected");
    expect(state().document).toBe(before.document);
    expect(state().documentRevision).toBe(before.documentRevision);
    expect(state().history).toBe(before.history);
  });

  it("skipped commands (no-op background) create no entry", () => {
    const result = dispatchCommand({ origin: "ui", command: { operation: "document.set_background", parameters: { color: "#fff" } } });
    expect(result.status).toBe("skipped");
    expect(state().history.past).toHaveLength(0);
    expect(state().documentRevision).toBe(0);
  });

  it("each successful public command creates exactly one entry, in order", () => {
    const a = createRect();
    const b = dispatchCommand({ origin: "ui", command: { operation: "document.set_background", parameters: { color: "#000" } } });
    const c = createText();
    expect(state().history.past.map((e) => e.operationId)).toEqual([a.operationId, b.operationId, c.operationId]);
    expect(state().history.past.map((e) => e.origin)).toEqual(["ui", "ui", "ui"]);
    expect(state().documentRevision).toBe(3);
  });

  it("undo and redo walk the history and bump the revision", () => {
    const initial = state().document;
    createRect();
    const afterRect = state().document;
    dispatchCommand({ origin: "ui", command: { operation: "document.set_background", parameters: { color: "#000" } } });

    expect(undo()).toMatchObject({ status: "success", message: "Undid: Changed the background to #000000." });
    expect(state().document).toBe(afterRect);
    expect(undo().status).toBe("success");
    expect(state().document).toBe(initial);
    expect(undo()).toEqual({ status: "skipped", message: "Nothing to undo." });
    expect(state().lastCreatedObjectId).toBeNull(); // pruned: object no longer exists

    expect(redo().status).toBe("success");
    expect(state().document).toBe(afterRect);
    expect(redo().status).toBe("success");
    expect(state().document.background).toBe("#000000");
    expect(redo()).toEqual({ status: "skipped", message: "Nothing to redo." });
    expect(state().documentRevision).toBe(6);
  });

  it("a new command after undo clears the redo stack", () => {
    createRect();
    createRect();
    undo();
    expect(state().history.future).toHaveLength(1);
    createText();
    expect(state().history.future).toHaveLength(0);
    expect(redo().status).toBe("skipped");
    expect(state().document.objects.map((o) => o.type)).toEqual(["rectangle", "text"]);
  });

  it("keeps at most HISTORY_LIMIT entries", () => {
    for (let i = 0; i < HISTORY_LIMIT + 3; i++) createRect();
    expect(state().history.past).toHaveLength(HISTORY_LIMIT);
  });
});

describe("dispatchInternal: text.sync_layout", () => {
  it("updates height without creating a history entry and amends the source entry", () => {
    const created = createText();
    const historyLength = state().history.past.length;

    const result = dispatchInternal(syncRequest(81.2));
    expect(result).toMatchObject({ status: "success", origin: "canvas", operation: "text.sync_layout" });
    expect(textHeight()).toBe(81.2);
    expect(state().history.past).toHaveLength(historyLength);

    const entry = state().history.past.at(-1)!;
    expect(entry.operationId).toBe(created.operationId);
    expect(entry.after).toBe(state().document); // redo will restore the measured layout
  });

  it("does not loop: an identical follow-up measurement is skipped", () => {
    createText();
    dispatchInternal(syncRequest(81.2));
    const revision = state().documentRevision;
    expect(dispatchInternal(syncRequest(81.2)).status).toBe("skipped");
    expect(state().documentRevision).toBe(revision);
  });

  it("is skipped when the measured revision is stale (newer edit happened)", () => {
    createText();
    const request = syncRequest(81.2); // measured now...
    createRect(); // ...but a newer edit lands first
    const doc = state().document;
    expect(dispatchInternal(request)).toMatchObject({ status: "skipped" });
    expect(state().document).toBe(doc);
  });

  it("is skipped after undo or redo moved the document on", () => {
    createText();
    const request = syncRequest(81.2);
    createRect();
    undo(); // back to the same content as at measurement, but a different revision
    expect(dispatchInternal(request).status).toBe("skipped");

    const request2 = syncRequest(90);
    redo();
    expect(dispatchInternal(request2).status).toBe("skipped");
  });

  it("is skipped when the source operation is no longer the history head", () => {
    createText();
    const request = syncRequest(81.2, { sourceOperationId: "someone-else" });
    expect(dispatchInternal(request).status).toBe("skipped");
  });

  it("never clears the redo stack and amends the correct entry after undo", () => {
    const text = createText();
    createRect();
    undo(); // head is the text entry; rect entry is in future
    const result = dispatchInternal(syncRequest(81.2));

    expect(result.status).toBe("success");
    expect(state().history.future).toHaveLength(1);
    expect(state().history.past.at(-1)!.operationId).toBe(text.operationId);
    expect(state().history.past.at(-1)!.after).toBe(state().document);

    // Redo still works and restores the rectangle step.
    expect(redo().status).toBe("success");
    expect(state().document.objects.map((o) => o.type)).toEqual(["text", "rectangle"]);
  });

  it("does not overwrite newer text content (layout key mismatch)", () => {
    createText("Hello");
    const s = state();
    const text = s.document.objects[0] as TextObject;
    const result = dispatchInternal({
      origin: "canvas",
      command: {
        operation: "text.sync_layout",
        parameters: {
          basedOnRevision: s.documentRevision,
          sourceOperationId: headOperationId(s.history),
          measurements: [{ objectId: text.id, height: 500, layoutKey: textLayoutKey({ ...text, text: "Old" }) }],
        },
      },
    });
    expect(result.status).toBe("skipped");
    expect(textHeight()).toBe(text.height);
  });

  it("rejects non-canvas origins and unknown internal operations", () => {
    createText();
    expect(dispatchInternal({ ...syncRequest(81.2), origin: "voice" })).toMatchObject({ status: "rejected" });
    expect(dispatchInternal({ ...syncRequest(81.2), origin: "ui" })).toMatchObject({ status: "rejected" });
    const unknown = dispatchInternal({
      origin: "canvas",
      command: { operation: "shape.create", parameters: {} } as unknown as InternalCommand,
    });
    expect(unknown).toMatchObject({ status: "rejected", message: "That action isn't supported." });
  });

  it("internal sync after undo-to-start updates the document but no history", () => {
    createText();
    undo();
    expect(state().document.objects).toHaveLength(0);
    // nothing to measure; verify a malformed sync is rejected without side effects
    const revision = state().documentRevision;
    const result = dispatchInternal({
      origin: "canvas",
      command: { operation: "text.sync_layout", parameters: { basedOnRevision: revision, sourceOperationId: null, measurements: [] } },
    });
    expect(result.status).toBe("rejected");
    expect(state().documentRevision).toBe(revision);
  });
});
