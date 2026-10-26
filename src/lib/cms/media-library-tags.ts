import { db } from "@/lib/db";

/**
 * Distinct tags saved on media assets and lodging images.
 * Preset labels are merged in the UI; this list is only what is stored.
 */
export async function listStoredMediaTags(): Promise<string[]> {
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
