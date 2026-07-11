export type ContentSource = "json" | "db";

export type ContentResult<T> = {
  data: T;
  source: ContentSource;
};

export type RepositoryOptions = {
  /** Force json or db; default auto-detects from DATABASE_URL. */
  source?: ContentSource;
};

/** Wrap file-based content in a typed result. */
export function fromJson<T>(data: T): ContentResult<T> {
  return { data, source: "json" };
}

/** Wrap database content in a typed result. */
export function fromDb<T>(data: T): ContentResult<T> {
  return { data, source: "db" };
}

/**
 * Resolve whether repositories should read from Postgres.
 *
 * @param options - Optional source override
 */
export function useDbSource(options?: RepositoryOptions): boolean {
  if (options?.source === "json") return false;
  if (options?.source === "db")
    return Boolean(process.env.DATABASE_URL?.trim());
  return Boolean(process.env.DATABASE_URL?.trim());
}
