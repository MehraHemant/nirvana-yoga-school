import { unstable_cache } from "next/cache";
import {
  getMediaAssetsUsage,
  type MediaUsageResult,
} from "@/lib/cms/media-usage";
import { MEDIA_USAGE_CACHE_TAG } from "@/lib/cms/media-usage-tag";
import { db } from "@/lib/db";

/** How long a usage snapshot stays warm between CMS edits. */
const MEDIA_USAGE_REVALIDATE_SECONDS = 60;

type CachedMediaUsage = {
  entries: Array<[string, MediaUsageResult]>;
};

/**
 * Builds the used/unused map for every media asset.
 * Serialized as entries so Next can store it in the data cache.
 */
async function loadMediaUsageEntries(): Promise<CachedMediaUsage> {
  const assets = await db.mediaAsset.findMany({
    select: { id: true, url: true, cdnKey: true },
  });
  const usage = await getMediaAssetsUsage(assets);
  return { entries: [...usage.entries()] };
}

/**
 * Library-wide usage snapshot. Reused across media list pages and pickers
 * so each request does not rescan CMS JSON.
 */
export const getCachedMediaUsageEntries = unstable_cache(
  loadMediaUsageEntries,
  ["media-library-usage"],
  {
    revalidate: MEDIA_USAGE_REVALIDATE_SECONDS,
    tags: [MEDIA_USAGE_CACHE_TAG],
  },
);
