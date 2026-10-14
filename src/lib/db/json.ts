/**
 * Parses a Postgres JSONB column value into a JS value.
 *
 * @param value - Driver string, object, Buffer, or null
 * @param fallback - Value when null/invalid
 * @returns Parsed JSON or fallback
 */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (Buffer.isBuffer(value)) {
    try {
      return JSON.parse(value.toString("utf8")) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Serializes a value for a Postgres JSONB column.
 *
 * @param value - JS value to store
 * @returns JSON string
 */
export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}
