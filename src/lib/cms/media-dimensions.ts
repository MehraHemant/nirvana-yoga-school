import "server-only";

import { after } from "next/server";
import { lookupCloudinaryImageDimensions } from "@/lib/cdn/cloudinary";
import { db } from "@/lib/db";

type DimensionRow = {
  id: string;
  cdnKey: string;
  mime: string;
  width: number | null;
  height: number | null;
};

/**
 * True when a library row still needs a Cloudinary dimension lookup.
 *
 * @param row - Media row about to be shown
 */
function needsImageDimensions(row: DimensionRow): boolean {
  return (
    row.mime.startsWith("image/") &&
    Boolean(row.cdnKey) &&
    (row.width == null || row.height == null)
  );
}

/**
 * Looks up missing pixel sizes after the library response is sent and stores
 * them on `media_assets`. The current response keeps stored dimensions so
 * Square / Portrait / Landscape tags stay available without waiting on Cloudinary.
 *
 * @param rows - Media rows included in the response
 */
export function scheduleMissingImageDimensionFill<T extends DimensionRow>(
  rows: T[],
): void {
  if (!rows.some(needsImageDimensions)) return;
  after(() => {
    void fillMissingImageDimensions(rows).catch(() => undefined);
  });
}

/**
 * Fills missing pixel size for the current library page from Cloudinary and
 * stores it on `media_assets`. Rows that already have dimensions are unchanged.
 *
 * @param rows - Media rows about to be shown
 */
export async function fillMissingImageDimensions<T extends DimensionRow>(
  rows: T[],
): Promise<T[]> {
  const missing = rows.filter(needsImageDimensions);
  if (missing.length === 0) return rows;

  let sizes: Map<string, { width: number; height: number }>;
  try {
    sizes = await lookupCloudinaryImageDimensions(
      missing.map((row) => row.cdnKey),
    );
  } catch {
    return rows;
  }

  const updates: Array<{ id: string; width: number; height: number }> = [];
  for (const row of missing) {
    const size = sizes.get(row.cdnKey);
    if (!size) continue;
    updates.push({ id: row.id, width: size.width, height: size.height });
  }
  if (updates.length === 0) return rows;

  try {
    await db.$executeRawUnsafe(
      `UPDATE "media_assets" AS m
       SET "width" = v.width, "height" = v.height
       FROM (
         SELECT * FROM unnest(?::text[], ?::int[], ?::int[]) AS t(id, width, height)
       ) AS v
       WHERE m."id" = v.id
         AND (m."width" IS NULL OR m."height" IS NULL)`,
      updates.map((item) => item.id),
      updates.map((item) => item.width),
      updates.map((item) => item.height),
    );
  } catch {
    // Keep the looked-up sizes in this response even if the write fails.
  }

  const byId = new Map(updates.map((item) => [item.id, item]));
  return rows.map((row) => {
    const size = byId.get(row.id);
    if (!size) return row;
    return { ...row, width: size.width, height: size.height };
  });
}
