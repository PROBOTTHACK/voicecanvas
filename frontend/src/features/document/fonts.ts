/**
 * Font registry. The document model stores `fontFamily` as a plain string;
 * this registry decides which families/weights/styles are accepted, so new
 * fonts are added here without changing the document model.
 */

export const FONT_WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const FONT_STYLES = ["normal", "italic"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export interface FontDefinition {
  /** CSS font-family name stored in the document and used by the renderer. */
  family: string;
  /** Human-readable name for UI and messages. */
  label: string;
  weights: readonly FontWeight[];
  styles: readonly FontStyle[];
}

/**
 * Only Inter Variable is registered initially. Italic is not registered until
 * an italic face is bundled (browsers would otherwise synthesize a fake slant).
 */
export const REGISTERED_FONTS: readonly FontDefinition[] = [
  { family: "Inter Variable", label: "Inter", weights: FONT_WEIGHTS, styles: ["normal"] },
];

export const DEFAULT_FONT_FAMILY = "Inter Variable";

export function findRegisteredFont(family: string): FontDefinition | undefined {
  return REGISTERED_FONTS.find((font) => font.family === family);
}
