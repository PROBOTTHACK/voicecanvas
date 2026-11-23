import { isPublicOperation } from "./registry";
import type { PublicOperation } from "./types";
import { isPlainObject, type Params } from "./validation";

export const UNSUPPORTED_OPERATION_MESSAGE = "That action isn't supported.";

export type ParsedPublicCommand =
  | { ok: true; operation: PublicOperation; parameters: Params }
  | { ok: false; operation: string; message: string };

const COMMAND_KEYS = ["operation", "parameters"];

/**
 * Runtime boundary for public commands. Treats input as untrusted (it will
 * later come from voice/AI): rejects non-objects, unknown or internal
 * operations, extra top-level keys and malformed parameters. Parameter-level
 * validation (including unknown parameter keys) happens in the engine.
 */
export function parsePublicCommand(input: unknown): ParsedPublicCommand {
  if (!isPlainObject(input)) {
    return { ok: false, operation: "unknown", message: "The command is malformed." };
  }
  const operation = typeof input.operation === "string" ? input.operation : "unknown";
  if (typeof input.operation !== "string" || !isPublicOperation(input.operation)) {
    return { ok: false, operation, message: UNSUPPORTED_OPERATION_MESSAGE };
  }
  if (Object.keys(input).some((key) => !COMMAND_KEYS.includes(key))) {
    return { ok: false, operation, message: "The command has unexpected fields." };
  }
  const parameters = input.parameters ?? {};
  if (!isPlainObject(parameters)) {
    return { ok: false, operation, message: "The command's parameters are malformed." };
  }
  return { ok: true, operation: input.operation, parameters };
}
