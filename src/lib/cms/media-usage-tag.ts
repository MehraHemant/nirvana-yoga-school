import { revalidateTag } from "next/cache";

/** Cache tag for the admin media used/unused map. */
export const MEDIA_USAGE_CACHE_TAG = "media-usage";

/**
 * Drops the cached usage snapshot after a CMS edit that can change references.
 */
export function invalidateMediaUsageCache(): void {
  revalidateTag(MEDIA_USAGE_CACHE_TAG, "max");
}
