/**
 * Converts null and undefined values to undefined
 * @param obj
 * @returns
 */
export function nullsToUndefined<T>(obj: T) {
  if (obj === null || obj === undefined) {
    return undefined as any
  }

  if ((obj as any).constructor.name === "Object" || Array.isArray(obj)) {
    for (const key in obj) {
      obj[key] = nullsToUndefined(obj[key]) as any
    }
  }
  return obj as any
}
