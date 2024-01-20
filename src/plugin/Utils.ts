/**
 * Returns object is there are keys inside it. Returns undefined if obj = null | {}
 * @param item
 */
export function objValue<T extends Record<string, unknown>>(
  item?: T,
): T | undefined {
  const exists = !!(item && Object.keys(item).length);
  return exists ? item : undefined;
}