import { describe, expect, it } from "vitest";
import { createEmptyDocument } from "../document/createDocument";
import { textLayoutKey } from "../document/textLayout";
import type { CanvasDocument, TextObject } from "../../types/document";
import { executeCommand, FAILED_MESSAGE } from "./engine";
import { internalRegistry } from "./internalRegistry";
import { publicRegistry } from "./registry";
import type { CommandHandler, EngineContext } from "./types";

function makeCtx(): EngineContext {
  let next = 0;
  return { createId: () => `obj-${++next}`, now: () => "2026-01-01T00:00:00.000Z" };
}

const meta = { operationId: "op-1", origin: "ui" as const };

function run(document: CanvasDocument, operation: string, parameters: unknown, ctx = makeCtx()) {
  return executeCommand(document, operation, parameters, publicRegistry, meta, ctx);
}

function expectRejected(document: CanvasDocument, operation: string, parameters: unknown, message: string | RegExp) {
  const outcome = run(document, operation, parameters);
  expect(outcome.result.status).toBe("rejected");
  expect(outcome.result.message).toMatch(message);
  expect(outcome.document).toBe(document); // unchanged reference
  expect(outcome.result.targetIds).toEqual([]);
}

describe("shape.create", () => {
  it("creates a centered rectangle with defaults", () => {
    const doc = createEmptyDocument();
    const outcome = run(doc, "shape.create", { shape: "rectangle", width: 300, height: 400, fill: "#f00" });

    expect(outcome.result).toMatchObject({
      status: "success",
      operationId: "op-1",
      operation: "shape.create",
      origin: "ui",
      targetIds: ["obj-1"],
      message: "Created a rectangle.",
    });
    expect(outcome.createdObjectId).toBe("obj-1");
    expect(outcome.document.objects).toHaveLength(1);
    expect(outcome.document.objects[0]).toMatchObject({
      id: "obj-1",
      type: "rectangle",
      x: 390, // (1080 - 300) / 2
      y: 340, // (1080 - 400) / 2
      width: 300,
      height: 400,
      fill: "#FF0000",
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
    });
    expect(outcome.document.updatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(doc.objects).toHaveLength(0); // input not mutated
  });

  it("creates a circle and appends it as the top layer", () => {
    const first = run(createEmptyDocument(), "shape.create", { shape: "rectangle" }).document;
    const outcome = run(first, "shape.create", { shape: "circle", x: 10, y: 20 }, { ...makeCtx(), createId: () => "c" });
    expect(outcome.document.objects.map((o) => o.type)).toEqual(["rectangle", "circle"]);
    expect(outcome.document.objects[1]).toMatchObject({ x: 10, y: 20, width: 200, height: 200 });
  });

  it("normalizes rotation and clamps corner radius", () => {
    const outcome = run(createEmptyDocument(), "shape.create", {
      shape: "rectangle",
      width: 100,
      height: 40,
      rotation: -90,
      cornerRadius: 500,
    });
    expect(outcome.document.objects[0]).toMatchObject({ rotation: 270, cornerRadius: 20 });
  });

  it.each([
    [{ shape: "rectangle", width: 0 }, "The rectangle's width must be greater than zero."],
    [{ shape: "rectangle", height: -5 }, "The rectangle's height must be greater than zero."],
    [{ shape: "rectangle", width: 20000 }, "The rectangle's width can't be more than 10000 px."],
    [{ shape: "rectangle", width: Number.NaN }, "The rectangle's width must be a number."],
    [{ shape: "rectangle", width: "300" }, "The rectangle's width must be a number."],
    [{ shape: "circle", x: 20000 }, "The circle's x position can't be more than 10000 px."],
    [{ shape: "circle", y: -20000 }, "The circle's y position must be at least -10000 px."],
    [{ shape: "rectangle", fill: "red" }, "The rectangle's fill color must be a hex color like #FF0000."],
    [{ shape: "rectangle", fill: "#12345" }, /hex color/],
    [{ shape: "rectangle", stroke: "blue" }, /stroke color must be a hex color/],
    [{ shape: "rectangle", opacity: 2 }, "The rectangle's opacity can't be more than 1."],
    [{ shape: "rectangle", rotation: Infinity }, "The rectangle's rotation must be a number."],
    [{ shape: "rectangle", cornerRadius: -1 }, "The rectangle's corner radius must be at least 0 px."],
    [{ shape: "circle", cornerRadius: 4 }, "Circles don't have a corner radius."],
    [{ shape: "triangle" }, "The shape must be one of: rectangle, circle."],
    [{}, "Tell me which shape to create: rectangle or circle."],
    [{ shape: "rectangle", color: "#fff" }, `"color" isn't a supported setting for this action.`],
  ])("rejects invalid parameters %j", (parameters, message) => {
    expectRejected(createEmptyDocument(), "shape.create", parameters, message);
  });
});

describe("text.create", () => {
  it("creates text with registered font defaults and an estimated height", () => {
    const outcome = run(createEmptyDocument(), "text.create", { text: "Hello" });
    const text = outcome.document.objects[0] as TextObject;
    expect(outcome.result.status).toBe("success");
    expect(text).toMatchObject({
      type: "text",
      text: "Hello",
      fontFamily: "Inter Variable",
      fontSize: 64,
      fontWeight: "700",
      fontStyle: "normal",
      width: 600,
      x: 240, // (1080 - 600) / 2
    });
    expect(text.height).toBeCloseTo(64 * 1.16);
  });

  it("accepts numeric font weights", () => {
    const outcome = run(createEmptyDocument(), "text.create", { fontWeight: 400 });
    expect((outcome.document.objects[0] as TextObject).fontWeight).toBe("400");
  });

  it.each([
    [{ text: "   " }, "The text can't be empty."],
    [{ text: 42 }, "The text must be a string."],
    [{ text: "x".repeat(5001) }, "The text can't be longer than 5000 characters."],
    [{ fontSize: 0 }, "The font size must be at least 1 px."],
    [{ fontSize: 1001 }, "The font size can't be more than 1000 px."],
    [{ fontFamily: "Comic Sans MS" }, `The font "Comic Sans MS" isn't available yet.`],
    [{ fontFamily: 12 }, "The font must be a font name."],
    [{ fontWeight: "bold" }, "The font weight must be one of 100, 200, … 900."],
    [{ fontWeight: 450 }, "The font weight must be one of 100, 200, … 900."],
    [{ fontStyle: "italic" }, "Inter isn't available in italic style yet."],
    [{ fontStyle: "oblique" }, "The font style must be one of: normal, italic."],
    [{ textAlign: "justify" }, "The text alignment must be one of: left, center, right."],
    [{ lineHeight: 0.1 }, "The line height must be at least 0.5."],
    [{ letterSpacing: 5000 }, "The letter spacing can't be more than 1000 px."],
    [{ width: 0 }, "The text box's width must be greater than zero."],
    [{ x: "10" }, "The text's x position must be a number."],
    [{ fill: "white" }, "The text color must be a hex color like #FF0000."],
    [{ height: 100 }, `"height" isn't a supported setting for this action.`],
  ])("rejects invalid parameters %j", (parameters, message) => {
    expectRejected(createEmptyDocument(), "text.create", parameters, message);
  });
});

describe("document.set_background", () => {
  it("changes and normalizes the background color", () => {
    const doc = createEmptyDocument();
    const outcome = run(doc, "document.set_background", { color: "#0af" });
    expect(outcome.result).toMatchObject({ status: "success", targetIds: [doc.id] });
    expect(outcome.document.background).toBe("#00AAFF");
  });

  it("skips when the color is unchanged", () => {
    const doc = createEmptyDocument();
    const outcome = run(doc, "document.set_background", { color: "#ffffff" });
    expect(outcome.result.status).toBe("skipped");
    expect(outcome.document).toBe(doc);
  });

  it.each([
    [{}, "Tell me which background color to use."],
    [{ color: "blue" }, "The background color must be a hex color like #FF0000."],
  ])("rejects %j", (parameters, message) => {
    expectRejected(createEmptyDocument(), "document.set_background", parameters, message);
  });
});

describe("engine safety", () => {
  it("rejects unknown operations", () => {
    expectRejected(createEmptyDocument(), "shape.explode", {}, "That action isn't supported.");
  });

  it("does not resolve internal operations from the public registry", () => {
    expectRejected(createEmptyDocument(), "text.sync_layout", {}, "That action isn't supported.");
  });

  it("does not resolve prototype keys as operations", () => {
    expectRejected(createEmptyDocument(), "toString", {}, "That action isn't supported.");
  });

  it("rejects non-object parameters", () => {
    expectRejected(createEmptyDocument(), "shape.create", ["rectangle"], "The command's parameters are malformed.");
  });

  it("returns failed and leaves the document untouched when a handler throws", () => {
    const doc = createEmptyDocument();
    const exploding: CommandHandler = {
      parameterKeys: [],
      execute: () => {
        throw new Error("boom");
      },
    };
    const outcome = executeCommand(doc, "boom", {}, { boom: exploding }, meta, makeCtx());
    expect(outcome.result).toMatchObject({ status: "failed", message: FAILED_MESSAGE, targetIds: [] });
    expect(outcome.document).toBe(doc);
  });
});

describe("text.sync_layout (internal handler)", () => {
  function docWithText() {
    return run(createEmptyDocument(), "text.create", { text: "Hi" }).document;
  }
  const sync = (doc: CanvasDocument, parameters: unknown) =>
    executeCommand(doc, "text.sync_layout", parameters, internalRegistry, { operationId: "s", origin: "canvas" }, makeCtx());

  it("updates only the height of text whose layout key still matches", () => {
    const doc = docWithText();
    const text = doc.objects[0] as TextObject;
    const outcome = sync(doc, {
      basedOnRevision: 1,
      sourceOperationId: "op-1",
      measurements: [{ objectId: text.id, height: 90.5, layoutKey: textLayoutKey(text) }],
    });
    expect(outcome.result).toMatchObject({ status: "success", targetIds: [text.id] });
    expect(outcome.document.objects[0]).toEqual({ ...text, height: 90.5 });
  });

  it("skips stale layout keys, missing objects and sub-tolerance differences", () => {
    const doc = docWithText();
    const text = doc.objects[0] as TextObject;
    const outcome = sync(doc, {
      basedOnRevision: 1,
      sourceOperationId: null,
      measurements: [
        { objectId: text.id, height: 200, layoutKey: textLayoutKey({ ...text, text: "older" }) },
        { objectId: "missing", height: 200, layoutKey: "x" },
        { objectId: text.id, height: text.height + 0.4, layoutKey: textLayoutKey(text) },
      ],
    });
    expect(outcome.result.status).toBe("skipped");
    expect(outcome.document).toBe(doc);
  });

  it.each([
    [{ sourceOperationId: null, measurements: [] }, /revision/],
    [{ basedOnRevision: 1, sourceOperationId: null, measurements: [] }, /at least one measurement/],
    [{ basedOnRevision: 1, sourceOperationId: 5, measurements: [{}] }, /invalid source operation/],
    [{ basedOnRevision: 1, sourceOperationId: null, measurements: [{ objectId: "a", height: 0, layoutKey: "k" }] }, /greater than zero/],
    [{ basedOnRevision: 1, sourceOperationId: null, measurements: [{ objectId: "a", height: 5, layoutKey: "k", text: "x" }] }, /malformed/],
  ])("rejects malformed sync %j", (parameters, message) => {
    const doc = docWithText();
    const outcome = sync(doc, parameters);
    expect(outcome.result.status).toBe("rejected");
    expect(outcome.result.message).toMatch(message);
    expect(outcome.document).toBe(doc);
  });
});
