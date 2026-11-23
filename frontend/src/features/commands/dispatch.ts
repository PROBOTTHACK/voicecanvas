import { useEditorStore, type EditorState } from "../../store/editorStore";
import type { CanvasDocument } from "../../types/document";
import { createId } from "../../utils/id";
import { executeCommand } from "./engine";
import { amendEntryAfter, headOperationId, recordEntry, redoHistory, undoHistory } from "./history";
import { internalRegistry } from "./internalRegistry";
import { parsePublicCommand, UNSUPPORTED_OPERATION_MESSAGE } from "./parseCommand";
import { isOperationPermitted, permissionDeniedMessage } from "./permissions";
import { publicRegistry } from "./registry";
import type {
  CommandOrigin,
  CommandRequest,
  CommandResult,
  EngineContext,
  InternalCommand,
  PublicCommand,
} from "./types";
import { isPlainObject } from "./validation";

export const RECENT_OPERATION_LIMIT = 200;

const engineContext: EngineContext = {
  createId,
  now: () => new Date().toISOString(),
};

type Resolved = { ok: true; operationId: string } | { ok: false; result: CommandResult };

/** Generates an operationId when absent; rejects invalid or already-applied IDs. */
function resolveOperationId(state: EditorState, requested: unknown, operation: string, origin: CommandOrigin): Resolved {
  const rejected = (operationId: string, message: string): Resolved => ({
    ok: false,
    result: { operationId, operation, origin, status: "rejected", targetIds: [], message },
  });
  if (requested === undefined) return { ok: true, operationId: createId() };
  if (typeof requested !== "string" || requested.trim().length === 0) {
    return rejected("invalid", "The operation ID is invalid.");
  }
  if (state.recentOperationIds.includes(requested)) {
    return rejected(requested, "This action was already applied.");
  }
  return { ok: true, operationId: requested };
}

function rememberOperation(state: EditorState, operationId: string): readonly string[] {
  return [...state.recentOperationIds, operationId].slice(-RECENT_OPERATION_LIMIT);
}

/** Drops selection / last-created references to objects missing from `document`. */
function pruneReferences(state: EditorState, document: CanvasDocument) {
  const ids = new Set(document.objects.map((object) => object.id));
  return {
    selectedObjectIds: state.selectedObjectIds.filter((id) => ids.has(id)),
    lastCreatedObjectId:
      state.lastCreatedObjectId !== null && ids.has(state.lastCreatedObjectId) ? state.lastCreatedObjectId : null,
  };
}

/**
 * Public entry point for every document edit (UI now, voice later).
 * Pipeline: operationId -> parse (runtime allowlist) -> origin permission ->
 * engine (validate + apply) -> atomic store update + exactly one history entry.
 */
export function dispatchCommand(request: CommandRequest<PublicCommand>): CommandResult {
  const { origin } = request;
  const state = useEditorStore.getState();
  const rawOperation = isPlainObject(request.command) && typeof request.command.operation === "string"
    ? request.command.operation
    : "unknown";

  const id = resolveOperationId(state, request.operationId, rawOperation, origin);
  if (!id.ok) return id.result;
  const { operationId } = id;

  const parsed = parsePublicCommand(request.command);
  if (!parsed.ok) {
    return { operationId, operation: parsed.operation, origin, status: "rejected", targetIds: [], message: parsed.message };
  }
  if (!isOperationPermitted(origin, parsed.operation)) {
    return {
      operationId,
      operation: parsed.operation,
      origin,
      status: "rejected",
      targetIds: [],
      message: permissionDeniedMessage(origin),
    };
  }

  const outcome = executeCommand(
    state.document,
    parsed.operation,
    parsed.parameters,
    publicRegistry,
    { operationId, origin },
    engineContext,
  );
  const { result } = outcome;
  if (result.status !== "success") return result;

  useEditorStore.setState({
    document: outcome.document,
    documentRevision: state.documentRevision + 1,
    history: recordEntry(state.history, {
      operationId,
      operation: parsed.operation,
      origin,
      description: result.message,
      before: state.document,
      after: outcome.document,
    }),
    recentOperationIds: rememberOperation(state, operationId),
    lastCreatedObjectId: outcome.createdObjectId ?? state.lastCreatedObjectId,
  });
  return result;
}

/**
 * Trusted entry point for renderer-derived changes (Fabric adapter only).
 * Never records history and never clears the redo stack. Rejects anything not
 * from the canvas origin; skips results computed against a stale document
 * (different revision or history head) so delayed measurements cannot modify
 * the document after undo, redo or newer edits.
 */
export function dispatchInternal(request: CommandRequest<InternalCommand>): CommandResult {
  const { origin, command } = request;
  const state = useEditorStore.getState();
  const operation = isPlainObject(command) && typeof command.operation === "string" ? command.operation : "unknown";

  const id = resolveOperationId(state, request.operationId, operation, origin);
  if (!id.ok) return id.result;
  const { operationId } = id;
  const base = { operationId, operation, origin };

  if (origin !== "canvas") {
    return { ...base, status: "rejected", targetIds: [], message: "That action can only come from the canvas renderer." };
  }
  if (!Object.hasOwn(internalRegistry, operation)) {
    return { ...base, status: "rejected", targetIds: [], message: UNSUPPORTED_OPERATION_MESSAGE };
  }

  const parameters: unknown = command.parameters;
  if (isPlainObject(parameters)) {
    const staleRevision =
      typeof parameters.basedOnRevision === "number" && parameters.basedOnRevision !== state.documentRevision;
    const sourceKnown = parameters.sourceOperationId === null || typeof parameters.sourceOperationId === "string";
    const staleHead = sourceKnown && parameters.sourceOperationId !== headOperationId(state.history);
    if (staleRevision || staleHead) {
      return { ...base, status: "skipped", targetIds: [], message: "This update was based on an outdated version of the design." };
    }
  }

  const outcome = executeCommand(state.document, operation, parameters, internalRegistry, { operationId, origin }, engineContext);
  if (outcome.result.status !== "success") return outcome.result;

  // Amend the history entry that produced the measured document (identified by
  // the command's sourceOperationId, already verified to be the history head),
  // and only if its snapshot is exactly the document that was measured.
  const sourceOperationId = command.parameters.sourceOperationId;
  useEditorStore.setState({
    document: outcome.document,
    documentRevision: state.documentRevision + 1,
    history:
      sourceOperationId === null
        ? state.history
        : amendEntryAfter(state.history, sourceOperationId, state.document, outcome.document),
    recentOperationIds: rememberOperation(state, operationId),
  });
  return outcome.result;
}

export type HistoryActionResult =
  | { status: "success"; operationId: string; message: string }
  | { status: "skipped"; message: string };

function applyHistoryStep(kind: "undo" | "redo"): HistoryActionResult {
  const state = useEditorStore.getState();
  const step = kind === "undo" ? undoHistory(state.history) : redoHistory(state.history);
  if (!step) return { status: "skipped", message: kind === "undo" ? "Nothing to undo." : "Nothing to redo." };

  useEditorStore.setState({
    document: step.document,
    documentRevision: state.documentRevision + 1,
    history: step.history,
    ...pruneReferences(state, step.document),
  });
  const verb = kind === "undo" ? "Undid" : "Redid";
  return { status: "success", operationId: step.entry.operationId, message: `${verb}: ${step.entry.description}` };
}

/** Not wired to the UI yet (Undo/Redo buttons stay disabled until a later ticket). */
export function undo(): HistoryActionResult {
  return applyHistoryStep("undo");
}

export function redo(): HistoryActionResult {
  return applyHistoryStep("redo");
}
