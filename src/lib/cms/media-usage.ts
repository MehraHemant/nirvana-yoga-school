import { db } from "@/lib/db";

export type MediaUsageResult = {
  inUse: boolean;
  references: string[];
};

type MediaAssetRef = {
  id: string;
  url: string;
  cdnKey?: string | null;
};

type JsonScanSource = {
  label: string;
  text: string;
};

type LodgingMediaImageRow = {
  id: string;
  url: string;
};

type LodgingRoomUsageRow = {
  asset_id: string;
  catalog: string;
  room_name: string;
  count: bigint | number;
};

type LodgingPageUsageRow = {
  asset_id: string;
  page_slug: string;
  catalog: string;
  room_name: string;
  count: bigint | number;
};

type LodgingFoodUsageRow = {
  asset_id: string;
  catalog: string;
  count: bigint | number;
};

const EMPTY_USAGE: MediaUsageResult = { inUse: false, references: [] };

/**
 * Builds unique match tokens for a media asset (id, url, Cloudinary public id).
 *
 * @param asset - Media asset identifiers
 */
function assetMatchTokens(
  asset: MediaAssetRef,
  lodgingMediaImageIds: string[] = [],
): string[] {
  const tokens = new Set<string>();
  if (asset.id) tokens.add(asset.id);
  if (asset.url) tokens.add(asset.url);
  if (asset.cdnKey) tokens.add(asset.cdnKey);
  for (const mediaImageId of lodgingMediaImageIds) {
    if (mediaImageId) tokens.add(mediaImageId);
  }
  return [...tokens];
}

/**
 * SQL fragment matching lodging `media_images` rows to CMS `media_assets`.
 *
 * @param assetAlias - media_assets table alias
 * @param imageAlias - media_images table alias
 */
export function lodgingAssetToMediaImageMatchSql(
  assetAlias: string,
  imageAlias: string,
): string {
  return `(
    ${assetAlias}."url" = ${imageAlias}."url"
    OR (
      COALESCE(${assetAlias}."cdn_key", '') <> ''
      AND ${imageAlias}."url" LIKE '%/' || ${assetAlias}."cdn_key" || '%'
    )
  )`;
}

/**
 * SQL fragment matching a JSON gallery image object to CMS `media_assets`.
 *
 * @param assetAlias - media_assets table alias
 * @param imageJsonAlias - jsonb_array_elements alias
 */
function lodgingJsonImageToAssetMatchSql(
  assetAlias: string,
  imageJsonAlias: string,
): string {
  return `(
    NULLIF(${imageJsonAlias}->>'mediaAssetId', '') = ${assetAlias}."id"
    OR NULLIF(${imageJsonAlias}->>'url', '') = ${assetAlias}."url"
    OR (
      COALESCE(${assetAlias}."cdn_key", '') <> ''
      AND NULLIF(${imageJsonAlias}->>'url', '') LIKE '%/' || ${assetAlias}."cdn_key" || '%'
    )
    OR EXISTS (
      SELECT 1
      FROM "media_images" mi_json
      WHERE mi_json."id" = NULLIF(${imageJsonAlias}->>'mediaImageId', '')
        AND ${lodgingAssetToMediaImageMatchSql(assetAlias, "mi_json")}
    )
  )`;
}

/**
 * Maps asset URLs to matching CMS asset ids.
 *
 * @param assets - Assets on the current page/batch
 */
function buildUrlToAssetIds(
  assets: MediaAssetRef[],
): Map<string, string[]> {
  const urlToAssetIds = new Map<string, string[]>();
  for (const asset of assets) {
    if (!asset.url) continue;
    const bucket = urlToAssetIds.get(asset.url) ?? [];
    bucket.push(asset.id);
    urlToAssetIds.set(asset.url, bucket);
  }
  return urlToAssetIds;
}

/**
 * Human-readable catalog label for lodging references.
 *
 * @param catalog - Room or food menu catalog
 */
function lodgingCatalogLabel(catalog: string): string {
  return catalog === "retreat" ? "Retreat" : "Course";
}

/**
 * Label for shared room catalog gallery usage.
 *
 * @param catalog - Room catalog
 * @param roomName - Room display name
 */
function sharedRoomGalleryLabel(catalog: string, roomName: string): string {
  const prefix = `${lodgingCatalogLabel(catalog)} accommodation`;
  const name = String(roomName ?? "").trim();
  return name ? `${prefix} → ${name} → gallery` : `${prefix} → Rooms`;
}

/**
 * Resolves lodging `media_images` rows linked to CMS assets by URL or Cloudinary key.
 *
 * @param assets - CMS media assets
 */
async function loadLodgingMediaImagesForAssets(
  assets: MediaAssetRef[],
): Promise<LodgingMediaImageRow[]> {
  const assetIds = [...new Set(assets.map((asset) => asset.id).filter(Boolean))];
  if (assetIds.length === 0) return [];

  const placeholders = assetIds.map(() => "?").join(", ");
  const matchSql = lodgingAssetToMediaImageMatchSql("ma", "mi");

  return db.$queryRawUnsafe<LodgingMediaImageRow[]>(
    `SELECT DISTINCT mi."id", mi."url"
     FROM "media_assets" ma
     INNER JOIN "media_images" mi ON ${matchSql}
     WHERE ma."id" IN (${placeholders})`,
    ...assetIds,
  );
}

/**
 * Builds CMS asset id → linked lodging media_images ids.
 *
 * @param assets - CMS media assets
 * @param lodgingRows - Matching lodging media rows
 */
function buildLodgingMediaImageIdsByAssetId(
  assets: MediaAssetRef[],
  lodgingRows: LodgingMediaImageRow[],
): Map<string, string[]> {
  const urlToAssetIds = buildUrlToAssetIds(assets);
  const byAssetId = new Map<string, Set<string>>();

  for (const row of lodgingRows) {
    const assetIds = new Set<string>();
    for (const assetId of urlToAssetIds.get(row.url) ?? []) {
      assetIds.add(assetId);
    }
    for (const asset of assets) {
      if (asset.cdnKey && row.url.includes(asset.cdnKey)) {
        assetIds.add(asset.id);
      }
    }
    for (const assetId of assetIds) {
      const bucket = byAssetId.get(assetId) ?? new Set<string>();
      bucket.add(row.id);
      byAssetId.set(assetId, bucket);
    }
  }

  return new Map(
    [...byAssetId.entries()].map(([assetId, ids]) => [assetId, [...ids]]),
  );
}

/**
 * Marks CMS assets used in lodging room/food junction tables, room JSON, and page offers.
 *
 * @param assets - CMS media assets
 * @param map - Usage map to update
 */
async function applyLodgingAccommodationUsage(
  assets: MediaAssetRef[],
  map: Map<string, MediaUsageResult>,
): Promise<void> {
  const assetIds = [...new Set(assets.map((asset) => asset.id).filter(Boolean))];
  if (assetIds.length === 0) return;

  const placeholders = assetIds.map(() => "?").join(", ");
  const assetToImageMatch = lodgingAssetToMediaImageMatchSql("ma", "mi");
  const jsonImageMatch = lodgingJsonImageToAssetMatchSql("ma", "img");
  const roomImagesJson = `CASE
    WHEN jsonb_typeof(r."images") = 'array' THEN r."images"
    ELSE '[]'::jsonb
  END`;

  const [roomRows, roomJsonRows, pageRows, foodRows, lodgingVideoCounts] =
    await Promise.all([
      db.$queryRawUnsafe<LodgingRoomUsageRow[]>(
        `SELECT ma."id" AS asset_id, r."catalog", r."name" AS room_name,
                COUNT(*)::int AS count
         FROM "room_images" ri
         INNER JOIN "media_images" mi ON mi."id" = ri."media_image_id"
         INNER JOIN "rooms" r ON r."id" = ri."room_id"
         INNER JOIN "media_assets" ma ON ${assetToImageMatch}
         WHERE ma."id" IN (${placeholders})
         GROUP BY ma."id", r."catalog", r."name"`,
        ...assetIds,
      ),
      db.$queryRawUnsafe<LodgingRoomUsageRow[]>(
        `SELECT ma."id" AS asset_id, r."catalog", r."name" AS room_name,
                COUNT(*)::int AS count
         FROM "rooms" r
         CROSS JOIN LATERAL jsonb_array_elements(${roomImagesJson}) AS img
         INNER JOIN "media_assets" ma ON ma."id" IN (${placeholders})
         WHERE ${jsonImageMatch}
         GROUP BY ma."id", r."catalog", r."name"`,
        ...assetIds,
      ),
      db.$queryRawUnsafe<LodgingPageUsageRow[]>(
        `SELECT ma."id" AS asset_id, p."slug" AS page_slug, r."catalog",
                r."name" AS room_name, COUNT(*)::int AS count
         FROM "page_room_offers" pro
         INNER JOIN "pages" p ON p."id" = pro."page_id"
         INNER JOIN "rooms" r ON r."id" = pro."room_id"
         INNER JOIN "room_images" ri ON ri."room_id" = r."id"
         INNER JOIN "media_images" mi ON mi."id" = ri."media_image_id"
         INNER JOIN "media_assets" ma ON ${assetToImageMatch}
         WHERE ma."id" IN (${placeholders})
         GROUP BY ma."id", p."slug", r."catalog", r."name"`,
        ...assetIds,
      ),
      db.$queryRawUnsafe<LodgingFoodUsageRow[]>(
        `SELECT ma."id" AS asset_id, fm."catalog", COUNT(*)::int AS count
         FROM "food_images" fi
         INNER JOIN "media_images" mi ON mi."id" = fi."media_image_id"
         INNER JOIN "food_menus" fm ON fm."id" = fi."food_menu_id"
         INNER JOIN "media_assets" ma ON ${assetToImageMatch}
         WHERE ma."id" IN (${placeholders})
         GROUP BY ma."id", fm."catalog"`,
        ...assetIds,
      ),
      fetchDirectUrlCounts(
        "media_videos",
        "url",
        [...new Set(assets.map((asset) => asset.url).filter(Boolean))],
      ),
    ]);

  for (const row of [...roomRows, ...roomJsonRows]) {
    const assetId = String(row.asset_id ?? "").trim();
    if (!assetId) continue;
    addReference(
      map,
      assetId,
      sharedRoomGalleryLabel(String(row.catalog ?? "course"), row.room_name),
    );
  }

  for (const row of pageRows) {
    const assetId = String(row.asset_id ?? "").trim();
    if (!assetId) continue;
    const catalog = lodgingCatalogLabel(String(row.catalog ?? "course"));
    const slug = String(row.page_slug ?? "").trim() || "page";
    const roomName = String(row.room_name ?? "").trim();
    const suffix = roomName ? ` (${roomName})` : "";
    const label = `${catalog}: ${slug} → accommodation${suffix}`;
    addReference(map, assetId, label);
  }

  for (const row of foodRows) {
    const assetId = String(row.asset_id ?? "").trim();
    if (!assetId) continue;
    const catalog = lodgingCatalogLabel(String(row.catalog ?? "course"));
    const label = `${catalog} accommodation → Food gallery`;
    addReference(map, assetId, label);
  }

  applyDirectUrlHits(
    assets,
    lodgingVideoCounts,
    "lodging room/food video(s)",
    map,
  );
}

/**
 * Adds a human-readable reference label to an asset usage entry.
 *
 * @param map - Usage map keyed by asset id
 * @param assetId - Target asset id
 * @param label - Reference label
 */
function addReference(
  map: Map<string, MediaUsageResult>,
  assetId: string,
  label: string,
): void {
  const current = map.get(assetId) ?? { inUse: false, references: [] };
  if (!current.references.includes(label)) {
    current.references.push(label);
    current.inUse = true;
  }
  map.set(assetId, current);
}

/**
 * Initializes an empty usage map for the given assets.
 *
 * @param assets - Assets to track
 */
function emptyUsageMap(assets: MediaAssetRef[]): Map<string, MediaUsageResult> {
  return new Map(assets.map((asset) => [asset.id, { ...EMPTY_USAGE }]));
}

/**
 * Maps direct URL column hits back to asset ids.
 *
 * @param assets - Assets on the current page/batch
 * @param urlCounts - URL → row count from a direct column query
 * @param label - Human-readable reference label
 * @param map - Usage map to update
 */
function applyDirectUrlHits(
  assets: MediaAssetRef[],
  urlCounts: Map<string, number>,
  label: string,
  map: Map<string, MediaUsageResult>,
): void {
  const urlToAssets = new Map<string, MediaAssetRef[]>();
  for (const asset of assets) {
    if (!asset.url) continue;
    const bucket = urlToAssets.get(asset.url) ?? [];
    bucket.push(asset);
    urlToAssets.set(asset.url, bucket);
  }

  for (const [url, count] of urlCounts) {
    if (count <= 0) continue;
    const matches = urlToAssets.get(url) ?? [];
    for (const asset of matches) {
      addReference(map, asset.id, `${count} ${label}`);
    }
  }
}

/**
 * Counts rows where a direct URL/image column matches any of the given URLs.
 *
 * @param table - Postgres table name
 * @param column - Column name
 * @param urls - Asset URLs to match
 */
async function fetchDirectUrlCounts(
  table: string,
  column: string,
  urls: string[],
): Promise<Map<string, number>> {
  if (urls.length === 0) return new Map();

  const placeholders = urls.map(() => "?").join(", ");
  const rows = await db.$queryRawUnsafe<Array<{ ref: string; count: bigint }>>(
    `SELECT "${column}" AS ref, COUNT(*)::int AS count
     FROM "${table}"
     WHERE "${column}" IN (${placeholders})
     GROUP BY "${column}"`,
    ...urls,
  );

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.ref) continue;
    counts.set(String(row.ref), Number(row.count ?? 0));
  }
  return counts;
}

/**
 * Loads JSON/text blobs from CMS tables for substring matching.
 */
async function loadJsonScanSources(): Promise<JsonScanSource[]> {
  const [
    pages,
    globalSettings,
    rooms,
    courseDocuments,
    blogPosts,
    pageSections,
  ] = await Promise.all([
    db.page.findMany({
      select: { slug: true, pageModules: true, contentData: true },
    }),
    db.globalSettings.findMany({ select: { key: true, value: true } }),
    db.room.findMany({
      select: { catalog: true, name: true, images: true, videos: true },
    }),
    db.courseDocument.findMany({ select: { document: true } }),
    db.blogPost.findMany({ select: { content: true, bodyHtml: true } }),
    db.pageSection.findMany({ select: { images: true, blocks: true } }),
  ]);

  const sources: JsonScanSource[] = [];

  for (const page of pages) {
    const slug = String(page.slug ?? "").trim() || "page";
    const residentialLife = (
      page.pageModules as { residentialLife?: unknown } | null | undefined
    )?.residentialLife;
    if (residentialLife != null) {
      sources.push({
        label: `${slug} → lodging & food`,
        text: JSON.stringify(residentialLife),
      });
    }
    if (page.pageModules != null) {
      sources.push({
        label: "page module JSON",
        text: JSON.stringify(page.pageModules),
      });
    }
    if (page.contentData != null) {
      sources.push({
        label: "page content JSON",
        text: JSON.stringify(page.contentData),
      });
    }
  }

  for (const row of globalSettings) {
    if (row.value == null) continue;
    const key = String(row.key ?? "").trim();
    if (key === "residentialLife" || key === "retreatAccommodation") {
      sources.push({
        label: `${lodgingCatalogLabel(key === "retreatAccommodation" ? "retreat" : "course")} accommodation → shared meta`,
        text: JSON.stringify(row.value),
      });
    } else if (key === "courseFood" || key === "retreatFood") {
      sources.push({
        label: `${lodgingCatalogLabel(key === "retreatFood" ? "retreat" : "course")} accommodation → Food gallery`,
        text: JSON.stringify(row.value),
      });
    } else {
      sources.push({
        label: "global settings JSON",
        text: JSON.stringify(row.value),
      });
    }
  }

  for (const room of rooms) {
    const catalog = String(room.catalog ?? "course");
    const roomName = String(room.name ?? "").trim();
    if (room.images != null) {
      sources.push({
        label: sharedRoomGalleryLabel(catalog, roomName),
        text: JSON.stringify(room.images),
      });
    }
    if (room.videos != null) {
      sources.push({
        label: `${lodgingCatalogLabel(catalog)} accommodation → ${roomName || "Room"} → video`,
        text: JSON.stringify(room.videos),
      });
    }
  }

  for (const doc of courseDocuments) {
    if (doc.document != null) {
      sources.push({
        label: "course document JSON",
        text: JSON.stringify(doc.document),
      });
    }
  }

  for (const post of blogPosts) {
    if (post.content != null) {
      sources.push({
        label: "blog content JSON",
        text: JSON.stringify(post.content),
      });
    }
    if (post.bodyHtml) {
      sources.push({ label: "blog body HTML", text: post.bodyHtml });
    }
  }

  for (const section of pageSections) {
    if (section.images != null) {
      sources.push({
        label: "section gallery JSON",
        text: JSON.stringify(section.images),
      });
    }
    if (section.blocks != null) {
      sources.push({
        label: "section blocks JSON",
        text: JSON.stringify(section.blocks),
      });
    }
  }

  return sources;
}

/**
 * Scans preloaded JSON/text blobs once and marks matching assets.
 *
 * @param assets - Assets to check
 * @param sources - JSON/text sources
 * @param map - Usage map to update
 */
function applyJsonScanHits(
  assets: MediaAssetRef[],
  sources: JsonScanSource[],
  map: Map<string, MediaUsageResult>,
  lodgingMediaImageIdsByAssetId: Map<string, string[]>,
): void {
  const sourceHitCounts = new Map<string, Map<string, number>>();

  for (const source of sources) {
    if (!source.text) continue;
    const hits = sourceHitCounts.get(source.label) ?? new Map<string, number>();

    for (const asset of assets) {
      const tokens = assetMatchTokens(
        asset,
        lodgingMediaImageIdsByAssetId.get(asset.id) ?? [],
      );
      if (tokens.some((token) => source.text.includes(token))) {
        hits.set(asset.id, (hits.get(asset.id) ?? 0) + 1);
      }
    }

    sourceHitCounts.set(source.label, hits);
  }

  for (const [label, hits] of sourceHitCounts) {
    for (const [assetId, count] of hits) {
      if (count > 0) {
        const reference = label.includes("→")
          ? label
          : `${count} ${label}`;
        addReference(map, assetId, reference);
      }
    }
  }
}

/**
 * Resolves gallery usage via media_asset_id and url columns.
 *
 * @param assets - Assets to check
 * @param map - Usage map to update
 */
async function applyGalleryUsage(
  assets: MediaAssetRef[],
  map: Map<string, MediaUsageResult>,
): Promise<void> {
  const ids = assets.map((asset) => asset.id);
  const urls = [...new Set(assets.map((asset) => asset.url).filter(Boolean))];
  if (ids.length === 0 && urls.length === 0) return;

  const [byIdRows, byUrlRows] = await Promise.all([
    ids.length > 0
      ? db.$queryRawUnsafe<Array<{ ref: string; count: bigint }>>(
          `SELECT "media_asset_id" AS ref, COUNT(*)::int AS count
           FROM "page_gallery_images"
           WHERE "media_asset_id" IN (${ids.map(() => "?").join(", ")})
           GROUP BY "media_asset_id"`,
          ...ids,
        )
      : Promise.resolve([]),
    urls.length > 0
      ? db.$queryRawUnsafe<Array<{ ref: string; count: bigint }>>(
          `SELECT "url" AS ref, COUNT(*)::int AS count
           FROM "page_gallery_images"
           WHERE "url" IN (${urls.map(() => "?").join(", ")})
           GROUP BY "url"`,
          ...urls,
        )
      : Promise.resolve([]),
  ]);

  for (const row of byIdRows) {
    if (!row.ref) continue;
    addReference(map, row.ref, `${Number(row.count ?? 0)} gallery row(s)`);
  }

  const urlToAssetIds = new Map<string, string[]>();
  for (const asset of assets) {
    if (!asset.url) continue;
    const bucket = urlToAssetIds.get(asset.url) ?? [];
    bucket.push(asset.id);
    urlToAssetIds.set(asset.url, bucket);
  }

  for (const row of byUrlRows) {
    if (!row.ref) continue;
    const assetIds = urlToAssetIds.get(row.ref) ?? [];
    for (const assetId of assetIds) {
      addReference(map, assetId, `${Number(row.count ?? 0)} gallery row(s)`);
    }
  }
}

/**
 * Batch usage lookup for media library list views.
 * Loads CMS reference data once, then matches all assets in memory.
 *
 * @param assets - Assets to check
 * @returns Map of asset id → usage result
 */
export async function getMediaAssetsUsage(
  assets: MediaAssetRef[],
): Promise<Map<string, MediaUsageResult>> {
  if (assets.length === 0) return new Map();

  const map = emptyUsageMap(assets);
  const urls = [...new Set(assets.map((asset) => asset.url).filter(Boolean))];

  const [
    jsonSources,
    lodgingRows,
    pageHeroCounts,
    sectionImageCounts,
    subsectionCounts,
    packageCounts,
    peopleCounts,
    highlightCounts,
    blogImageCounts,
    seoImageCounts,
  ] = await Promise.all([
    loadJsonScanSources(),
    loadLodgingMediaImagesForAssets(assets),
    fetchDirectUrlCounts("pages", "image", urls),
    fetchDirectUrlCounts("page_sections", "image", urls),
    fetchDirectUrlCounts("section_subsections", "image", urls),
    fetchDirectUrlCounts("page_packages", "image", urls),
    fetchDirectUrlCounts("page_people", "image", urls),
    fetchDirectUrlCounts("page_highlights", "image", urls),
    fetchDirectUrlCounts("blog_posts", "image", urls),
    fetchDirectUrlCounts("page_seo", "og_image", urls),
  ]);

  const lodgingMediaImageIdsByAssetId = buildLodgingMediaImageIdsByAssetId(
    assets,
    lodgingRows,
  );

  await Promise.all([
    applyGalleryUsage(assets, map),
    applyLodgingAccommodationUsage(assets, map),
  ]);

  applyDirectUrlHits(assets, pageHeroCounts, "page hero image(s)", map);
  applyDirectUrlHits(assets, sectionImageCounts, "page section image(s)", map);
  applyDirectUrlHits(assets, subsectionCounts, "subsection image(s)", map);
  applyDirectUrlHits(assets, packageCounts, "package image(s)", map);
  applyDirectUrlHits(assets, peopleCounts, "teacher/people image(s)", map);
  applyDirectUrlHits(assets, highlightCounts, "highlight image(s)", map);
  applyDirectUrlHits(assets, blogImageCounts, "blog post image(s)", map);
  applyDirectUrlHits(assets, seoImageCounts, "SEO og image(s)", map);
  applyJsonScanHits(assets, jsonSources, map, lodgingMediaImageIdsByAssetId);

  return map;
}

/**
 * Check whether a media asset is referenced anywhere in the CMS database.
 *
 * @param asset - Media asset id, public URL, and optional Cloudinary key
 * @returns Usage summary with human-readable reference labels
 */
export async function getMediaAssetUsage(
  asset: MediaAssetRef,
): Promise<MediaUsageResult> {
  const usageMap = await getMediaAssetsUsage([asset]);
  return usageMap.get(asset.id) ?? { ...EMPTY_USAGE };
}
