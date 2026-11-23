import type { CanvasDocument } from "../../types/document";
import { createId } from "../../utils/id";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_DOCUMENT_NAME,
} from "./constants";

/** Creates a new, empty document with default canvas settings. Pure. */
export function createEmptyDocument(): CanvasDocument {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: DEFAULT_DOCUMENT_NAME,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    background: DEFAULT_BACKGROUND,
    objects: [],
    createdAt: now,
    updatedAt: now,
  };
}
