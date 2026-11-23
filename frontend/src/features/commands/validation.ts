/**
 * Parameter validation helpers. Every reader treats input as untrusted and
 * returns either a normalized value or a user-facing message.
 */

export const LIMITS = {
  minDimension: 0, // exclusive
  maxDimension: 10000,
  maxCoordinate: 10000,
  maxStrokeWidth: 1000,
  minFontSize: 1,
  maxFontSize: 1000,
  maxTextLength: 5000,
  minLineHeight: 0.5,
  maxLineHeight: 5,
  minLetterSpacing: -100,
  maxLetterSpacing: 1000,
} as const;

export type Check<T> = { ok: true; value: T } | { ok: false; message: string };

export const ok = <T>(value: T): Check<T> => ({ ok: true, value });
export const fail = <T = never>(message: string): Check<T> => ({ ok: false, message });

export type Params = Record<string, unknown>;

export function isPlainObject(value: unknown): value is Params {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface NumberRule {
  min?: number;
  max?: number;
  /** Value must be strictly greater than `min`. */
  exclusiveMin?: boolean;
  unit?: string;
}

function formatLimit(value: number, unit?: string): string {
  return unit ? `${value} ${unit}` : String(value);
}

/** Validates a number against a rule; `subject` reads like "The rectangle's width". */
export function checkNumber(value: unknown, subject: string, rule: NumberRule = {}): Check<number> {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fail(`${subject} must be a number.`);
  }
  if (rule.min !== undefined) {
    if (rule.exclusiveMin && value <= rule.min) {
      return fail(rule.min === 0 ? `${subject} must be greater than zero.` : `${subject} must be greater than ${formatLimit(rule.min, rule.unit)}.`);
    }
    if (!rule.exclusiveMin && value < rule.min) {
      return fail(`${subject} must be at least ${formatLimit(rule.min, rule.unit)}.`);
    }
  }
  if (rule.max !== undefined && value > rule.max) {
    return fail(`${subject} can't be more than ${formatLimit(rule.max, rule.unit)}.`);
  }
  return ok(value);
}

export function optionalNumber(
  params: Params,
  key: string,
  subject: string,
  rule: NumberRule,
  fallback: number,
): Check<number> {
  return params[key] === undefined ? ok(fallback) : checkNumber(params[key], subject, rule);
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Accepts #RGB or #RRGGBB; normalizes to uppercase #RRGGBB. */
export function checkColor(value: unknown, subject: string): Check<string> {
  if (typeof value !== "string" || !HEX_COLOR.test(value.trim())) {
    return fail(`${subject} must be a hex color like #FF0000.`);
  }
  let hex = value.trim().slice(1).toUpperCase();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return ok(`#${hex}`);
}

export function optionalColor(params: Params, key: string, subject: string, fallback: string): Check<string> {
  return params[key] === undefined ? ok(fallback) : checkColor(params[key], subject);
}

export function checkEnum<T extends string>(value: unknown, allowed: readonly T[], subject: string): Check<T> {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return ok(value as T);
  }
  return fail(`${subject} must be one of: ${allowed.join(", ")}.`);
}

export function optionalEnum<T extends string>(
  params: Params,
  key: string,
  allowed: readonly T[],
  subject: string,
  fallback: T,
): Check<T> {
  return params[key] === undefined ? ok(fallback) : checkEnum(params[key], allowed, subject);
}

export const POSITION_RULE: NumberRule = {
  min: -LIMITS.maxCoordinate,
  max: LIMITS.maxCoordinate,
  unit: "px",
};

export const DIMENSION_RULE: NumberRule = {
  min: LIMITS.minDimension,
  exclusiveMin: true,
  max: LIMITS.maxDimension,
  unit: "px",
};

export const OPACITY_RULE: NumberRule = { min: 0, max: 1 };

export const STROKE_WIDTH_RULE: NumberRule = { min: 0, max: LIMITS.maxStrokeWidth, unit: "px" };
