import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/** Cache tag for the distinct media-library tag list. */
const MEDIA_LIBRARY_TAGS_CACHE_TAG = "media-library-tags";

/**
 * Drops the cached tag list after an upload, tag edit, or delete.
 */
export function invalidateStoredMediaTags(): void {
  revalidateTag(MEDIA_LIBRARY_TAGS_CACHE_TAG, "max");
}

/**
 * Reads distinct tags saved on media assets and lodging images.
 */
async function queryStoredMediaTags(): Promise<string[]> {
  try {
    const rows = await db.$queryRawUnsafe<Array<{ tag: string | null }>>(
      `SELECT DISTINCT btrim(tag) AS tag
       FROM (
         SELECT jsonb_array_elements_text("tags"::jsonb) AS tag
         FROM "media_assets"
         WHERE "tags" IS NOT NULL
           AND jsonb_typeof("tags"::jsonb) = 'array'
         UNION
         SELECT "tag" AS tag
         FROM "media_images"
         WHERE "tag" IS NOT NULL
       ) tags
       WHERE tag IS NOT NULL AND btrim(tag) <> ''
       ORDER BY 1`,
    );
    return rows.flatMap((row) => {
      const tag = row.tag?.trim();
      return tag ? [tag] : [];
    });
  } catch {
    return [];
  }
}

/**
 * Distinct tags saved on media assets and lodging images.
 * Preset labels are merged in the UI; this list is only what is stored.
 * Cached briefly so opening the library does not rescan every tag array.
 */
export async function listStoredMediaTags(): Promise<string[]> {
  const cached = unstable_cache(queryStoredMediaTags, ["media-library-tags"], {
    revalidate: 60,
    tags: [MEDIA_LIBRARY_TAGS_CACHE_TAG],
  });
  return cached();
}
