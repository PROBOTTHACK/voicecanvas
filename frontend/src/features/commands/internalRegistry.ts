import { textSyncLayoutHandler } from "./handlers/textSyncLayout";
import type { CommandHandler, InternalOperation } from "./types";

/**
 * INTERNAL registry: trusted, renderer-originated operations. Only
 * `dispatchInternal` (used by the Fabric adapter) reads this. It must never be
 * merged into the public registry or exposed to any AI allowlist.
 */
export const internalRegistry = {
  "text.sync_layout": textSyncLayoutHandler,
} as const satisfies Record<InternalOperation, CommandHandler>;

export function isInternalOperation(operation: string): operation is InternalOperation {
  return Object.hasOwn(internalRegistry, operation);
}
