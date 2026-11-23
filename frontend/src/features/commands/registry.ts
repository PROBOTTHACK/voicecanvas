import { documentSetBackgroundHandler } from "./handlers/documentSetBackground";
import { shapeCreateHandler } from "./handlers/shapeCreate";
import { textCreateHandler } from "./handlers/textCreate";
import type { CommandHandler, PublicOperation } from "./types";

/**
 * Public command registry: every operation the editor UI may dispatch.
 * Internal operations live in `internalRegistry.ts` and are never listed here.
 * Which public operations a given origin (e.g. voice/AI) may use is decided
 * separately in `permissions.ts`.
 */
export const publicRegistry = {
  "shape.create": shapeCreateHandler,
  "text.create": textCreateHandler,
  "document.set_background": documentSetBackgroundHandler,
} as const satisfies Record<PublicOperation, CommandHandler>;

export const PUBLIC_OPERATIONS = Object.keys(publicRegistry) as PublicOperation[];

export function isPublicOperation(operation: string): operation is PublicOperation {
  return Object.hasOwn(publicRegistry, operation);
}
