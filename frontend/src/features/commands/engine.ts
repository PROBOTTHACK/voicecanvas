import type { CanvasDocument } from "../../types/document";
import { UNSUPPORTED_OPERATION_MESSAGE } from "./parseCommand";
import type { CommandHandler, CommandOrigin, CommandResult, EngineContext } from "./types";
import { isPlainObject } from "./validation";

export const FAILED_MESSAGE = "Something went wrong while applying that change. Nothing was changed.";

export interface ExecutionMeta {
  operationId: string;
  origin: CommandOrigin;
}

export interface ExecutionOutcome {
  /** The new document on success; the exact input document otherwise. */
  document: CanvasDocument;
  result: CommandResult;
  createdObjectId: string | null;
}

/**
 * Pure command execution: registry lookup -> parameter key check ->
 * handler validation/apply -> stamp `updatedAt`. Never mutates the input
 * document; on rejection, skip or error the input document is returned as-is.
 */
export function executeCommand(
  document: CanvasDocument,
  operation: string,
  parameters: unknown,
  registry: Readonly<Record<string, CommandHandler>>,
  meta: ExecutionMeta,
  ctx: EngineContext,
): ExecutionOutcome {
  const base = { operationId: meta.operationId, operation, origin: meta.origin };
  const reject = (message: string): ExecutionOutcome => ({
    document,
    createdObjectId: null,
    result: { ...base, status: "rejected", targetIds: [], message },
  });

  const handler = Object.hasOwn(registry, operation) ? registry[operation] : undefined;
  if (!handler) return reject(UNSUPPORTED_OPERATION_MESSAGE);

  if (!isPlainObject(parameters)) return reject("The command's parameters are malformed.");
  const unknownKey = Object.keys(parameters).find((key) => !handler.parameterKeys.includes(key));
  if (unknownKey !== undefined) return reject(`"${unknownKey}" isn't a supported setting for this action.`);

  try {
    const outcome = handler.execute(document, parameters, ctx);
    switch (outcome.kind) {
      case "rejected":
        return reject(outcome.message);
      case "skipped":
        return {
          document,
          createdObjectId: null,
          result: { ...base, status: "skipped", targetIds: outcome.targetIds, message: outcome.message },
        };
      case "applied":
        return {
          document: { ...outcome.document, updatedAt: ctx.now() },
          createdObjectId: outcome.createdObjectId ?? null,
          result: { ...base, status: "success", targetIds: outcome.targetIds, message: outcome.message },
        };
    }
  } catch {
    return {
      document,
      createdObjectId: null,
      result: { ...base, status: "failed", targetIds: [], message: FAILED_MESSAGE },
    };
  }
}
