export interface Size {
  width: number;
  height: number;
}

/**
 * Largest scale (capped at 1) at which `content` fits inside `container`
 * with `padding` pixels of space on every side. Returns 0 for degenerate sizes.
 */
export function fitScale(container: Size, content: Size, padding = 0): number {
  const availableWidth = container.width - padding * 2;
  const availableHeight = container.height - padding * 2;
  if (availableWidth <= 0 || availableHeight <= 0 || content.width <= 0 || content.height <= 0) {
    return 0;
  }
  return Math.min(1, availableWidth / content.width, availableHeight / content.height);
}
