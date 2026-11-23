interface Size {
  width: number;
  height: number;
}

/** Top-left position that centers `size` inside `canvas`. Deterministic engine math. */
export function centeredPosition(canvas: Size, size: Size): { x: number; y: number } {
  return {
    x: (canvas.width - size.width) / 2,
    y: (canvas.height - size.height) / 2,
  };
}

/** Normalizes degrees into [0, 360). */
export function normalizeRotation(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360;
  return normalized === 0 ? 0 : normalized; // avoid -0
}
