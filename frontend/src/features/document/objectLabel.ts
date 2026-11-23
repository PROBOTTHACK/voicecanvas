import type { CanvasObject, CanvasObjectType } from "../../types/document";

const TYPE_LABELS: Record<CanvasObjectType, string> = {
  rectangle: "Rectangle",
  circle: "Circle",
  text: "Text",
};

export function objectTypeLabel(type: CanvasObjectType): string {
  return TYPE_LABELS[type];
}

/** Human-readable label for an object (text objects use their content). */
export function objectLabel(object: CanvasObject): string {
  if (object.type === "text") {
    const content = object.text.trim();
    return content.length > 0 ? content : TYPE_LABELS.text;
  }
  return TYPE_LABELS[object.type];
}
