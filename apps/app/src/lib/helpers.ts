/**
 * Compares two objects for equality
 * @param a
 * @param b
 * @returns
 */
export function isEqual<T extends object>(a: T, b: T) {
  return JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort())
}

/**
 * Converts a file to a data URL
 * @param file
 * @returns
 */
export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener("load", () => {
      const result = reader.result

      if (typeof result === "string") {
        resolve(result)
      } else {
        reject(new Error("Unable to read file"))
      }
    })

    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Unable to read file"))
    })

    reader.readAsDataURL(file)
  })
}
