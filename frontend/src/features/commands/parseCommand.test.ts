import { describe, expect, it } from "vitest";
import { parsePublicCommand } from "./parseCommand";
import { AI_OPERATION_ALLOWLIST, ORIGIN_PERMISSIONS } from "./permissions";
import { PUBLIC_OPERATIONS } from "./registry";

describe("parsePublicCommand", () => {
  it("accepts a well-formed public command", () => {
    expect(parsePublicCommand({ operation: "shape.create", parameters: { shape: "circle" } })).toEqual({
      ok: true,
      operation: "shape.create",
      parameters: { shape: "circle" },
    });
  });

  it("defaults missing parameters to an empty object", () => {
    expect(parsePublicCommand({ operation: "text.create" })).toMatchObject({ ok: true, parameters: {} });
  });

  it.each([
    [null, "The command is malformed."],
    ["shape.create", "The command is malformed."],
    [[], "The command is malformed."],
    [{}, "That action isn't supported."],
    [{ operation: 7 }, "That action isn't supported."],
    [{ operation: "shape.explode" }, "That action isn't supported."],
    [{ operation: "text.sync_layout", parameters: {} }, "That action isn't supported."],
    [{ operation: "__proto__" }, "That action isn't supported."],
    [{ operation: "shape.create", parameters: {}, run: "alert(1)" }, "The command has unexpected fields."],
    [{ operation: "shape.create", parameters: "rectangle" }, "The command's parameters are malformed."],
  ])("rejects %j", (input, message) => {
    expect(parsePublicCommand(input)).toMatchObject({ ok: false, message });
  });
});

describe("registries and permissions", () => {
  it("public registry contains exactly the public operations", () => {
    expect([...PUBLIC_OPERATIONS].sort()).toEqual(["document.set_background", "shape.create", "text.create"]);
  });

  it("keeps the AI allowlist separate from the UI registry and empty until granted", () => {
    expect(AI_OPERATION_ALLOWLIST).toEqual([]);
    expect(ORIGIN_PERMISSIONS.voice).toBe(AI_OPERATION_ALLOWLIST);
    expect(ORIGIN_PERMISSIONS.ui).toEqual(PUBLIC_OPERATIONS);
  });
});
