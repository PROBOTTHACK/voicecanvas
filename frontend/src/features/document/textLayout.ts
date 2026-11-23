import type { TextObject } from "../../types/document";
import { DEFAULT_TEXT } from "./defaults";

type LayoutFields = Pick<
  TextObject,
  "text" | "width" | "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing"
>;

/**
 * Stable key of every property that affects a text object's measured height.
 * A renderer measurement is only valid for the key it was taken against.
 */
export function textLayoutKey(text: LayoutFields): string {
  return JSON.stringify([
    text.text,
    text.width,
    text.fontFamily,
    text.fontSize,
    text.fontWeight,
    text.fontStyle ?? "normal",
    text.lineHeight ?? DEFAULT_TEXT.lineHeight,
    text.letterSpacing ?? 0,
  ]);
}

/**
 * Initial height estimate (explicit line breaks only, no wrapping). The
 * renderer replaces it with the measured height via `text.sync_layout`.
 */
export function estimateTextHeight(text: string, fontSize: number, lineHeight: number): number {
  const lines = text.split("\n").length;
  return Math.max(1, lines * fontSize * lineHeight);
}
