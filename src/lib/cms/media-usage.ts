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
function buildUrlToAssetIds(assets: MediaAssetRef[]): Map<string, string[]> {
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
  const assetIds = [
    ...new Set(assets.map((asset) => asset.id).filter(Boolean)),
  ];
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
  const assetIds = [
    ...new Set(assets.map((asset) => asset.id).filter(Boolean)),
  ];
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
      fetchDirectUrlCounts("media_videos", "url", [
        ...new Set(assets.map((asset) => asset.url).filter(Boolean)),
      ]),
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
  }
  current.inUse = true;
  map.set(assetId, current);
}

/**
 * Initializes an empty usage map for the given assets.
 *
 * @param assets - Assets to track
 */
function emptyUsageMap(assets: MediaAssetRef[]): Map<string, MediaUsageResult> {
  return new Map(
    assets.map((asset) => [asset.id, { inUse: false, references: [] }]),
  );
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

type CorpusRow = {
  kind: string;
  label: string;
  text: string | null;
};

/**
 * Human-readable scan label for one preloaded CMS text blob.
 *
 * @param kind - Corpus source kind
 * @param label - Slug, settings key, or room catalog and name
 */
function corpusSourceLabel(kind: string, label: string): string | null {
  const raw = label.trim();
  if (kind === "page-modules") return `${raw || "page"} → page modules`;
  if (kind === "page-life") return `${raw || "page"} → lodging & food`;
  if (kind === "page-content") return `${raw || "page"} → page content`;
  if (kind === "setting") {
    if (raw === "residentialLife" || raw === "retreatAccommodation") {
      return `${lodgingCatalogLabel(raw === "retreatAccommodation" ? "retreat" : "course")} accommodation → shared meta`;
    }
    if (raw === "courseFood" || raw === "retreatFood") {
      return `${lodgingCatalogLabel(raw === "retreatFood" ? "retreat" : "course")} accommodation → Food gallery`;
    }
    return "global settings JSON";
  }
  if (kind === "room-images" || kind === "room-videos") {
    const [catalog = "course", roomName = ""] = raw.split("\u001f");
    if (kind === "room-images")
      return sharedRoomGalleryLabel(catalog, roomName);
    const name = roomName.trim() || "Room";
    return `${lodgingCatalogLabel(catalog)} accommodation → ${name} → video`;
  }
  if (kind === "course-doc") return "course document JSON";
  if (kind === "blog-content") return `${raw || "blog post"} → blog content`;
  if (kind === "blog-body") return `${raw || "blog post"} → blog body`;
  if (kind === "section-images") return "section gallery JSON";
  if (kind === "section-blocks") return "section blocks JSON";
  if (kind === "hero") return `${raw || "page"} → page hero`;
  if (kind === "section-image") return "page section image(s)";
  if (kind === "subsection") return "subsection image(s)";
  if (kind === "package") return "package image(s)";
  if (kind === "person") return "teacher/people image(s)";
  if (kind === "highlight") return "highlight image(s)";
  if (kind === "blog-image") return "blog post image(s)";
  if (kind === "seo") return "SEO og image(s)";
  if (kind === "gallery") return "gallery row(s)";
  return null;
}

/**
 * Loads CMS JSON/text once as text, without parsing and re-stringifying each row.
 */
async function loadJsonScanSources(): Promise<JsonScanSource[]> {
  const rows = await db.$queryRawUnsafe<CorpusRow[]>(
    `SELECT kind, label, txt AS text
     FROM (
       SELECT 'page-life' AS kind,
              COALESCE(NULLIF(btrim(slug), ''), 'page') AS label,
              (page_modules->'residentialLife')::text AS txt
       FROM pages
       WHERE page_modules IS NOT NULL
         AND jsonb_typeof(page_modules->'residentialLife') IS NOT NULL
         AND jsonb_typeof(page_modules->'residentialLife') <> 'null'
       UNION ALL
       SELECT 'page-modules',
              COALESCE(NULLIF(btrim(slug), ''), 'page'),
              page_modules::text
       FROM pages
       WHERE page_modules IS NOT NULL
       UNION ALL
       SELECT 'page-content',
              COALESCE(NULLIF(btrim(slug), ''), 'page'),
              content_data::text
       FROM pages
       WHERE content_data IS NOT NULL
       UNION ALL
       SELECT 'setting', key, value::text
       FROM global_settings
       WHERE value IS NOT NULL
       UNION ALL
       SELECT 'room-images',
              COALESCE(catalog, 'course') || chr(31) || COALESCE(name, ''),
              images::text
       FROM rooms
       WHERE images IS NOT NULL
       UNION ALL
       SELECT 'room-videos',
              COALESCE(catalog, 'course') || chr(31) || COALESCE(name, ''),
              videos::text
       FROM rooms
       WHERE videos IS NOT NULL
       UNION ALL
       SELECT 'course-doc', 'course document JSON', document::text
       FROM course_documents
       WHERE document IS NOT NULL
       UNION ALL
       SELECT 'blog-content',
              COALESCE(NULLIF(btrim(slug), ''), 'blog post'),
              content::text
       FROM blog_posts
       WHERE content IS NOT NULL
       UNION ALL
       SELECT 'blog-body',
              COALESCE(NULLIF(btrim(slug), ''), 'blog post'),
              body_html
       FROM blog_posts
       WHERE body_html IS NOT NULL AND btrim(body_html) <> ''
       UNION ALL
       SELECT 'section-images', 'section gallery JSON', images::text
       FROM page_sections
       WHERE images IS NOT NULL
       UNION ALL
       SELECT 'section-blocks', 'section blocks JSON', blocks::text
       FROM page_sections
       WHERE blocks IS NOT NULL
       UNION ALL
       SELECT 'hero',
              COALESCE(NULLIF(btrim(slug), ''), 'page'),
              image
       FROM pages
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'section-image', 'page section image(s)', image
       FROM page_sections
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'subsection', 'subsection image(s)', image
       FROM section_subsections
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'package', 'package image(s)', image
       FROM page_packages
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'person', 'teacher/people image(s)', image
       FROM page_people
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'highlight', 'highlight image(s)', image
       FROM page_highlights
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'blog-image', 'blog post image(s)', image
       FROM blog_posts
       WHERE image IS NOT NULL AND btrim(image) <> ''
       UNION ALL
       SELECT 'seo', 'SEO og image(s)', og_image
       FROM page_seo
       WHERE og_image IS NOT NULL AND btrim(og_image) <> ''
       UNION ALL
       SELECT 'gallery',
              'gallery row(s)',
              COALESCE(url, '') || ' ' || COALESCE(media_asset_id, '')
       FROM page_gallery_images
       WHERE COALESCE(url, '') <> '' OR COALESCE(media_asset_id, '') <> ''
     ) src
     WHERE txt IS NOT NULL AND length(txt) > 2`,
  );

  const sources: JsonScanSource[] = [];
  for (const row of rows) {
    const text = String(row.text ?? "");
    if (text.length <= 2) continue;
    const label = corpusSourceLabel(
      String(row.kind ?? ""),
      String(row.label ?? ""),
    );
    if (!label) continue;
    sources.push({ label, text });
  }
  return sources;
}

/**
 * Escapes a literal string for use inside a regular expression.
 *
 * @param value - Raw token
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Records one labeled hit for an asset.
 *
 * @param counts - Label → asset id → hit count
 * @param label - Reference label
 * @param assetId - Media asset id
 */
function bumpScanHit(
  counts: Map<string, Map<string, number>>,
  label: string,
  assetId: string,
): void {
  const hits = counts.get(label) ?? new Map<string, number>();
  hits.set(assetId, (hits.get(assetId) ?? 0) + 1);
  counts.set(label, hits);
}

/**
 * Scans preloaded JSON/text blobs once and marks matching assets.
 *
 * @param assets - Assets to check
 * @param sources - JSON/text sources
 * @param map - Usage map to update
 * @param lodgingMediaImageIdsByAssetId - Lodging image ids linked to each asset
 */
function applyJsonScanHits(
  assets: MediaAssetRef[],
  sources: JsonScanSource[],
  map: Map<string, MediaUsageResult>,
  lodgingMediaImageIdsByAssetId: Map<string, string[]>,
): void {
  const sourceHitCounts = new Map<string, Map<string, number>>();
  const tokensByAssetId = new Map<string, string[]>();
  const tokenOwners = new Map<string, string[]>();
  const tokens: string[] = [];

  for (const asset of assets) {
    const assetTokens = assetMatchTokens(
      asset,
      lodgingMediaImageIdsByAssetId.get(asset.id) ?? [],
    ).filter((token) => token.length > 0);
    tokensByAssetId.set(asset.id, assetTokens);
    for (const token of assetTokens) {
      const owners = tokenOwners.get(token);
      if (owners) {
        if (!owners.includes(asset.id)) owners.push(asset.id);
      } else {
        tokenOwners.set(token, [asset.id]);
        tokens.push(token);
      }
    }
  }

  const activeSources = sources.filter((source) => source.text.length > 2);
  tokens.sort((left, right) => right.length - left.length);
  const patternSource = tokens.map(escapeRegExp).join("|");
  const usePattern = tokens.length > 0 && patternSource.length <= 250_000;
  const pattern = usePattern ? new RegExp(patternSource, "g") : null;

  if (pattern) {
    for (const source of activeSources) {
      pattern.lastIndex = 0;
      const seen = new Set<string>();
      for (const match of source.text.matchAll(pattern)) {
        for (const assetId of tokenOwners.get(match[0]) ?? []) {
          seen.add(assetId);
        }
      }
      for (const assetId of seen) {
        bumpScanHit(sourceHitCounts, source.label, assetId);
      }
    }
  }

  // Longest-first alternation can swallow a shorter token that is a prefix of
  // a longer one. Confirm anything still unused with a direct substring check.
  const unmatched = assets.filter((asset) => {
    if (!pattern) return true;
    for (const hits of sourceHitCounts.values()) {
      if ((hits.get(asset.id) ?? 0) > 0) return false;
    }
    return true;
  });

  if (unmatched.length > 0) {
    for (const source of activeSources) {
      for (const asset of unmatched) {
        const assetTokens = tokensByAssetId.get(asset.id) ?? [];
        if (assetTokens.some((token) => source.text.includes(token))) {
          bumpScanHit(sourceHitCounts, source.label, asset.id);
        }
      }
    }
  }

  for (const [label, hits] of sourceHitCounts) {
    for (const [assetId, count] of hits) {
      if (count > 0) {
        const reference = label.includes("→") ? label : `${count} ${label}`;
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

  const [jsonSources, lodgingRows] = await Promise.all([
    loadJsonScanSources(),
    loadLodgingMediaImagesForAssets(assets),
    applyGalleryUsage(assets, map),
    applyLodgingAccommodationUsage(assets, map),
  ]);

  const lodgingMediaImageIdsByAssetId = buildLodgingMediaImageIdsByAssetId(
    assets,
    lodgingRows,
  );

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
  return usageMap.get(asset.id) ?? { inUse: false, references: [] };
}
