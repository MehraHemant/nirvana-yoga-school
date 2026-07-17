import {
  type ContentResult,
  fromDb,
  type RepositoryOptions,
} from "@/content/repositories/fetch";
import { isDbEnabled } from "@/lib/db";

/**
 * Error thrown when content repositories cannot use MySQL.
 */
export class DatabaseRequiredError extends Error {
  /**
   * @param message - Human-readable reason
   */
  constructor(
    message = "DATABASE_URL is required; JSON content fallback is disabled.",
  ) {
    super(message);
    this.name = "DatabaseRequiredError";
  }
}

/**
 * Load content exclusively from MySQL. Never falls back to bundled JSON/TS.
 *
 * @param dbFn - Async loader from Prisma
 * @param _options - Optional repository options (source overrides are ignored)
 * @returns Content wrapped as a DB result
 * @throws {DatabaseRequiredError} When `DATABASE_URL` is unset
 */
export async function requireDb<T>(
  dbFn: () => Promise<T>,
  _options?: RepositoryOptions,
): Promise<ContentResult<T>> {
  if (!isDbEnabled()) {
    throw new DatabaseRequiredError();
  }

  const data = await dbFn();
  return fromDb(data);
}

/**
 * @deprecated Use {@link requireDb}. Kept as an alias so call sites migrate cleanly.
 */
export const withDbFallback = requireDb;
