import { textLayoutKey } from "../../document/textLayout";
import type { CanvasObject } from "../../../types/document";
import type { CommandHandler, HandlerOutcome, TextMeasurement } from "../types";
import { DIMENSION_RULE, checkNumber, isPlainObject, type Check } from "../validation";

/** Measurements within this tolerance are considered equal (prevents churn). */
export const TEXT_HEIGHT_TOLERANCE = 0.5;

const MEASUREMENT_KEYS = ["objectId", "height", "layoutKey"];

function checkMeasurements(value: unknown): Check<TextMeasurement[]> {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, message: "Text layout sync needs at least one measurement." };
  }
  const measurements: TextMeasurement[] = [];
  for (const item of value) {
    if (!isPlainObject(item) || Object.keys(item).some((key) => !MEASUREMENT_KEYS.includes(key))) {
      return { ok: false, message: "A text measurement is malformed." };
    }
    if (typeof item.objectId !== "string" || typeof item.layoutKey !== "string") {
      return { ok: false, message: "A text measurement is malformed." };
    }
    const height = checkNumber(item.height, "The measured text height", DIMENSION_RULE);
    if (!height.ok) return height;
    measurements.push({ objectId: item.objectId, height: height.value, layoutKey: item.layoutKey });
  }
  return { ok: true, value: measurements };
}

/**
 * INTERNAL. Writes renderer-measured text heights into the model. Revision /
 * history-head staleness is checked by the dispatcher; this handler additionally
 * ignores measurements whose layout key no longer matches the object, so a
 * delayed measurement can never overwrite newer text content or layout.
 */
export const textSyncLayoutHandler: CommandHandler = {
  parameterKeys: ["basedOnRevision", "sourceOperationId", "measurements"],

  execute(document, params): HandlerOutcome {
    if (typeof params.basedOnRevision !== "number" || !Number.isInteger(params.basedOnRevision)) {
      return { kind: "rejected", message: "Text layout sync is missing its document revision." };
    }
    if (params.sourceOperationId !== null && typeof params.sourceOperationId !== "string") {
      return { kind: "rejected", message: "Text layout sync has an invalid source operation." };
    }
    const measurements = checkMeasurements(params.measurements);
    if (!measurements.ok) return { kind: "rejected", message: measurements.message };

    const updates = new Map<string, number>();
    for (const measurement of measurements.value) {
      const target = document.objects.find((object) => object.id === measurement.objectId);
      if (!target || target.type !== "text") continue; // deleted or not text: ignore
      if (textLayoutKey(target) !== measurement.layoutKey) continue; // stale measurement
      if (Math.abs(target.height - measurement.height) <= TEXT_HEIGHT_TOLERANCE) continue;
      updates.set(target.id, measurement.height);
    }

    if (updates.size === 0) {
      return { kind: "skipped", targetIds: [], message: "Text layout is already up to date." };
    }

    const objects: CanvasObject[] = document.objects.map((object) => {
      const height = updates.get(object.id);
      return height === undefined ? object : { ...object, height };
    });

    return {
      kind: "applied",
      document: { ...document, objects },
      targetIds: [...updates.keys()],
      message: "Updated text layout.",
    };
  },
};
