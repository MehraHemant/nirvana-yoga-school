import {
  type ContentResult,
  fromDb,
  fromJson,
  type RepositoryOptions,
  useDbSource,
} from "@/content/repositories/fetch";
import { isDbConnectionError } from "@/lib/db";

/**
 * Try MySQL first; fall back to bundled JSON if DB is unreachable.
 *
 * @param dbFn - Async loader from Prisma
 * @param jsonFn - Sync JSON fallback loader
 * @param options - Optional source override
 */
export async function withDbFallback<T>(
  dbFn: () => Promise<T>,
  jsonFn: () => T,
  options?: RepositoryOptions,
): Promise<ContentResult<T>> {
  if (!useDbSource(options)) {
    return fromJson(jsonFn());
  }

  try {
    const data = await dbFn();
    return fromDb(data);
  } catch (error) {
    if (isDbConnectionError(error)) {
      return fromJson(jsonFn());
    }
    throw error;
  }
}
