import { DEFAULT_OBJECT_STATE, DEFAULT_TEXT } from "../../document/defaults";
import { findRegisteredFont, FONT_STYLES, FONT_WEIGHTS, type FontWeight } from "../../document/fonts";
import { centeredPosition, normalizeRotation } from "../../document/geometry";
import { estimateTextHeight } from "../../document/textLayout";
import type { TextObject } from "../../../types/document";
import type { CommandHandler, HandlerOutcome } from "../types";
import {
  checkEnum,
  DIMENSION_RULE,
  fail,
  LIMITS,
  ok,
  OPACITY_RULE,
  optionalColor,
  optionalEnum,
  optionalNumber,
  POSITION_RULE,
  type Check,
  type Params,
} from "../validation";

const TEXT_ALIGNS = ["left", "center", "right"] as const;

function checkText(params: Params): Check<string> {
  const value = params.text;
  if (value === undefined) return ok(DEFAULT_TEXT.text);
  if (typeof value !== "string") return fail("The text must be a string.");
  if (value.trim().length === 0) return fail("The text can't be empty.");
  if (value.length > LIMITS.maxTextLength) {
    return fail(`The text can't be longer than ${LIMITS.maxTextLength} characters.`);
  }
  return ok(value);
}

/** Accepts "100"…"900" or the numbers 100…900; must be supported by the font. */
function checkFontWeight(value: unknown, allowed: readonly FontWeight[], fontLabel: string): Check<FontWeight> {
  const normalized = typeof value === "number" ? String(value) : value;
  if (typeof normalized !== "string" || !(FONT_WEIGHTS as readonly string[]).includes(normalized)) {
    return fail("The font weight must be one of 100, 200, … 900.");
  }
  const weight = normalized as FontWeight;
  if (!allowed.includes(weight)) {
    return fail(`${fontLabel} isn't available in weight ${weight}.`);
  }
  return ok(weight);
}

export const textCreateHandler: CommandHandler = {
  parameterKeys: [
    "text",
    "x",
    "y",
    "width",
    "rotation",
    "opacity",
    "fill",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "textAlign",
    "lineHeight",
    "letterSpacing",
  ],

  execute(document, params, ctx): HandlerOutcome {
    const reject = (message: string): HandlerOutcome => ({ kind: "rejected", message });

    const text = checkText(params);
    if (!text.ok) return reject(text.message);

    // Font family first: weight/style support depends on the registered font.
    const familyInput = params.fontFamily ?? DEFAULT_TEXT.fontFamily;
    if (typeof familyInput !== "string") return reject("The font must be a font name.");
    const font = findRegisteredFont(familyInput);
    if (!font) return reject(`The font "${familyInput}" isn't available yet.`);

    const weight =
      params.fontWeight === undefined
        ? ok(DEFAULT_TEXT.fontWeight)
        : checkFontWeight(params.fontWeight, font.weights, font.label);
    if (!weight.ok) return reject(weight.message);

    const style = optionalEnum(params, "fontStyle", FONT_STYLES, "The font style", DEFAULT_TEXT.fontStyle);
    if (!style.ok) return reject(style.message);
    if (!font.styles.includes(style.value)) {
      return reject(`${font.label} isn't available in ${style.value} style yet.`);
    }

    const fontSize = optionalNumber(
      params,
      "fontSize",
      "The font size",
      { min: LIMITS.minFontSize, max: LIMITS.maxFontSize, unit: "px" },
      DEFAULT_TEXT.fontSize,
    );
    if (!fontSize.ok) return reject(fontSize.message);

    const lineHeight = optionalNumber(
      params,
      "lineHeight",
      "The line height",
      { min: LIMITS.minLineHeight, max: LIMITS.maxLineHeight },
      DEFAULT_TEXT.lineHeight,
    );
    if (!lineHeight.ok) return reject(lineHeight.message);

    const letterSpacing = optionalNumber(
      params,
      "letterSpacing",
      "The letter spacing",
      { min: LIMITS.minLetterSpacing, max: LIMITS.maxLetterSpacing, unit: "px" },
      DEFAULT_TEXT.letterSpacing,
    );
    if (!letterSpacing.ok) return reject(letterSpacing.message);

    const textAlign =
      params.textAlign === undefined ? ok(DEFAULT_TEXT.textAlign) : checkEnum(params.textAlign, TEXT_ALIGNS, "The text alignment");
    if (!textAlign.ok) return reject(textAlign.message);

    const width = optionalNumber(params, "width", "The text box's width", DIMENSION_RULE, DEFAULT_TEXT.width);
    if (!width.ok) return reject(width.message);
    const height = estimateTextHeight(text.value, fontSize.value, lineHeight.value);

    const center = centeredPosition(document, { width: width.value, height });
    const x = optionalNumber(params, "x", "The text's x position", POSITION_RULE, center.x);
    if (!x.ok) return reject(x.message);
    const y = optionalNumber(params, "y", "The text's y position", POSITION_RULE, center.y);
    if (!y.ok) return reject(y.message);

    const rotation = optionalNumber(params, "rotation", "The text's rotation", {}, DEFAULT_OBJECT_STATE.rotation);
    if (!rotation.ok) return reject(rotation.message);
    const opacity = optionalNumber(params, "opacity", "The text's opacity", OPACITY_RULE, DEFAULT_OBJECT_STATE.opacity);
    if (!opacity.ok) return reject(opacity.message);
    const fill = optionalColor(params, "fill", "The text color", DEFAULT_TEXT.fill);
    if (!fill.ok) return reject(fill.message);

    const object: TextObject = {
      id: ctx.createId(),
      type: "text",
      x: x.value,
      y: y.value,
      width: width.value,
      height,
      rotation: normalizeRotation(rotation.value),
      opacity: opacity.value,
      visible: DEFAULT_OBJECT_STATE.visible,
      locked: DEFAULT_OBJECT_STATE.locked,
      fill: fill.value,
      text: text.value,
      fontFamily: font.family,
      fontSize: fontSize.value,
      fontWeight: weight.value,
      fontStyle: style.value,
      textAlign: textAlign.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
    };

    return {
      kind: "applied",
      document: { ...document, objects: [...document.objects, object] },
      targetIds: [object.id],
      createdObjectId: object.id,
      message: "Added text.",
    };
  },
};
