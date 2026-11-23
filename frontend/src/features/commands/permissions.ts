import { PUBLIC_OPERATIONS } from "./registry";
import type { CommandOrigin, PublicOperation } from "./types";

/**
 * Operations the AI agent (voice origin) may request. Deliberately separate
 * from the public UI registry: an operation is only exposed to the AI when it
 * is explicitly added here. Empty until Sprint 2.
 */
export const AI_OPERATION_ALLOWLIST: readonly PublicOperation[] = [];

/**
 * Public operations each origin may dispatch. Canvas gestures get their
 * operations (move/resize/rotate) in VC-004; renderer-internal operations go
 * through `dispatchInternal`, not this table.
 */
export const ORIGIN_PERMISSIONS: Readonly<Record<CommandOrigin, readonly PublicOperation[]>> = {
  ui: PUBLIC_OPERATIONS,
  voice: AI_OPERATION_ALLOWLIST,
  canvas: [],
};

const ORIGIN_LABELS: Record<CommandOrigin, string> = {
  ui: "the editor",
  voice: "voice commands",
  canvas: "the canvas",
};

export function isOperationPermitted(origin: CommandOrigin, operation: PublicOperation): boolean {
  return ORIGIN_PERMISSIONS[origin].includes(operation);
}

export function permissionDeniedMessage(origin: CommandOrigin): string {
  return `That action isn't available from ${ORIGIN_LABELS[origin]} yet.`;
}
