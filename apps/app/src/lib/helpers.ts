/**
 * Compares two objects for equality
 * @param a
 * @param b
 * @returns
 */
export function isEqual<T extends object>(a: T, b: T) {
  return JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort())
}
