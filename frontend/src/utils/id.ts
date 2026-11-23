/** Creates a stable, globally unique object/document ID. */
export function createId(): string {
  return crypto.randomUUID();
}
