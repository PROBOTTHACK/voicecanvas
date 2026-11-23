/**
 * Normalized document model — the single source of truth for a design.
 * Must never import or depend on Fabric.js.
 *
 * Coordinates: pixels, origin top-left, y grows downward.
 * `x`/`y` is the top-left of the object's UNROTATED box; `rotation`
 * (degrees, clockwise) is applied about the box center.
 * Array order of `CanvasDocument.objects` is layer order (index 0 = bottom).
 */

export interface CanvasDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  objects: CanvasObject[];
  createdAt: string;
  updatedAt: string;
}

export interface BaseCanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  parentId?: string;
}

export interface RectangleObject extends BaseCanvasObject {
  type: "rectangle";
  cornerRadius: number;
}

export interface CircleObject extends BaseCanvasObject {
  type: "circle";
}

export interface TextObject extends BaseCanvasObject {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
}

export type CanvasObject = RectangleObject | CircleObject | TextObject;

export type CanvasObjectType = "rectangle" | "circle" | "text";
