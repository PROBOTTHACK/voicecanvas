import { DEFAULT_CIRCLE, DEFAULT_OBJECT_STATE, DEFAULT_RECTANGLE } from "../../document/defaults";
import { centeredPosition, normalizeRotation } from "../../document/geometry";
import type { CircleObject, RectangleObject } from "../../../types/document";
import type { CommandHandler, HandlerOutcome } from "../types";
import {
  checkEnum,
  DIMENSION_RULE,
  OPACITY_RULE,
  optionalColor,
  optionalNumber,
  POSITION_RULE,
  STROKE_WIDTH_RULE,
  checkColor,
  checkNumber,
} from "../validation";

const SHAPES = ["rectangle", "circle"] as const;

export const shapeCreateHandler: CommandHandler = {
  parameterKeys: [
    "shape",
    "x",
    "y",
    "width",
    "height",
    "rotation",
    "opacity",
    "fill",
    "stroke",
    "strokeWidth",
    "cornerRadius",
  ],

  execute(document, params, ctx): HandlerOutcome {
    if (params.shape === undefined) {
      return { kind: "rejected", message: "Tell me which shape to create: rectangle or circle." };
    }
    const shape = checkEnum(params.shape, SHAPES, "The shape");
    if (!shape.ok) return { kind: "rejected", message: shape.message };

    const label = shape.value;
    const defaults = label === "rectangle" ? DEFAULT_RECTANGLE : DEFAULT_CIRCLE;

    if (label === "circle" && params.cornerRadius !== undefined) {
      return { kind: "rejected", message: "Circles don't have a corner radius." };
    }

    const width = optionalNumber(params, "width", `The ${label}'s width`, DIMENSION_RULE, defaults.width);
    if (!width.ok) return { kind: "rejected", message: width.message };
    const height = optionalNumber(params, "height", `The ${label}'s height`, DIMENSION_RULE, defaults.height);
    if (!height.ok) return { kind: "rejected", message: height.message };

    const center = centeredPosition(document, { width: width.value, height: height.value });
    const x = optionalNumber(params, "x", `The ${label}'s x position`, POSITION_RULE, center.x);
    if (!x.ok) return { kind: "rejected", message: x.message };
    const y = optionalNumber(params, "y", `The ${label}'s y position`, POSITION_RULE, center.y);
    if (!y.ok) return { kind: "rejected", message: y.message };

    const rotation = optionalNumber(params, "rotation", `The ${label}'s rotation`, {}, DEFAULT_OBJECT_STATE.rotation);
    if (!rotation.ok) return { kind: "rejected", message: rotation.message };
    const opacity = optionalNumber(params, "opacity", `The ${label}'s opacity`, OPACITY_RULE, DEFAULT_OBJECT_STATE.opacity);
    if (!opacity.ok) return { kind: "rejected", message: opacity.message };
    const fill = optionalColor(params, "fill", `The ${label}'s fill color`, defaults.fill);
    if (!fill.ok) return { kind: "rejected", message: fill.message };

    const stroke = params.stroke === undefined ? undefined : checkColor(params.stroke, `The ${label}'s stroke color`);
    if (stroke && !stroke.ok) return { kind: "rejected", message: stroke.message };
    const strokeWidth =
      params.strokeWidth === undefined
        ? undefined
        : checkNumber(params.strokeWidth, `The ${label}'s stroke width`, STROKE_WIDTH_RULE);
    if (strokeWidth && !strokeWidth.ok) return { kind: "rejected", message: strokeWidth.message };

    const base = {
      id: ctx.createId(),
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
      rotation: normalizeRotation(rotation.value),
      opacity: opacity.value,
      visible: DEFAULT_OBJECT_STATE.visible,
      locked: DEFAULT_OBJECT_STATE.locked,
      fill: fill.value,
      ...(stroke ? { stroke: stroke.value } : {}),
      ...(strokeWidth ? { strokeWidth: strokeWidth.value } : {}),
    };

    let object: RectangleObject | CircleObject;
    if (label === "rectangle") {
      const radius = optionalNumber(
        params,
        "cornerRadius",
        "The rectangle's corner radius",
        { min: 0, max: DIMENSION_RULE.max, unit: "px" },
        DEFAULT_RECTANGLE.cornerRadius,
      );
      if (!radius.ok) return { kind: "rejected", message: radius.message };
      const maxRadius = Math.min(width.value, height.value) / 2;
      object = { ...base, type: "rectangle", cornerRadius: Math.min(radius.value, maxRadius) };
    } else {
      object = { ...base, type: "circle" };
    }

    return {
      kind: "applied",
      document: { ...document, objects: [...document.objects, object] },
      targetIds: [object.id],
      createdObjectId: object.id,
      message: `Created a ${label}.`,
    };
  },
};
