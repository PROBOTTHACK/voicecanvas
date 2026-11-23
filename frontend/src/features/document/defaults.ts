import { DEFAULT_FONT_FAMILY, type FontStyle, type FontWeight } from "./fonts";

export const DEFAULT_RECTANGLE = {
  width: 300,
  height: 200,
  fill: "#6366F1",
  cornerRadius: 0,
} as const;

export const DEFAULT_CIRCLE = {
  width: 200,
  height: 200,
  fill: "#22C55E",
} as const;

export const DEFAULT_TEXT: {
  text: string;
  width: number;
  fill: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
} = {
  text: "Add a heading",
  width: 600,
  fill: "#111111",
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: 64,
  fontWeight: "700",
  fontStyle: "normal",
  textAlign: "left",
  lineHeight: 1.16,
  letterSpacing: 0,
};

export const DEFAULT_OBJECT_STATE = {
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
} as const;
