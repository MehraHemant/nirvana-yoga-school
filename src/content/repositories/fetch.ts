export type ContentSource = "json" | "db";

export type ContentResult<T> = {
  data: T;
  source: ContentSource;
};

export type RepositoryOptions = {
  /**
   * @deprecated JSON source is disabled. Repositories always require MySQL.
   */
  source?: ContentSource;
};

/**
 * Wrap database content in a typed result.
 *
 * @param data - Loaded content
 */
export function fromDb<T>(data: T): ContentResult<T> {
  return { data, source: "db" };
}

/**
 * @deprecated JSON fallbacks are removed; prefer {@link fromDb}.
 */
export function fromJson<T>(data: T): ContentResult<T> {
  return { data, source: "json" };
}

/**
 * Whether repositories should read from MySQL.
 * Always true when `DATABASE_URL` is set; JSON overrides are ignored.
 *
 * @param _options - Ignored (kept for call-site compatibility)
 */
export function useDbSource(_options?: RepositoryOptions): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
