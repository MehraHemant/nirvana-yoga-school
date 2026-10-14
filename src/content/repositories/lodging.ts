import type {
  FoodMenuRecord,
  MediaImageRecord,
  MediaVideoRecord,
  PageDateBatchRecord,
  PageRoomOfferRecord,
  PageSectionFlagRecord,
  PageSectionKey,
} from "@/content/types/lodging";
import type {
  RoomCatalog,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { roomDisplayTitle } from "@/content/lodging/room-catalog";
import { normalizeMediaTagKey } from "@/lib/cdn/media-tags";
import { lodgingAssetToMediaImageMatchSql } from "@/lib/cms/media-usage";
import { createId, db } from "@/lib/db";
import { requireDb } from "./db-fallback";
import type { ContentResult, RepositoryOptions } from "./fetch";

const DEFAULT_MEDIA_PAGE_SIZE = 48;
const MAX_MEDIA_PAGE_SIZE = 60;

export type MediaImageListOptions = RepositoryOptions & {
  /** 1-based page (default 1) */
  page?: number;
  /** Page size capped at 60 (default 48) */
  limit?: number;
};

export type MediaImageListResult = {
  images: MediaImageRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Rows inserted from media_assets during this request */
  synced: number;
  /** Unreferenced lodging rows removed because no CMS asset backs them */
  purged?: number;
};

/**
 * SQL predicate: lodging row has a valid backing CMS image asset.
 *
 * @param imageAlias - media_images table alias
 */
function mediaImageHasBackingAssetSql(imageAlias = "mi"): string {
  const matchSql = lodgingAssetToMediaImageMatchSql("ma", imageAlias);
  return `EXISTS (
    SELECT 1
    FROM "media_assets" ma
    WHERE ${matchSql}
      AND ma."mime" LIKE 'image/%'
      AND ma."url" IS NOT NULL
      AND TRIM(ma."url") <> ''
  )`;
}

/**
 * SQL predicate: lodging row has a non-empty URL.
 *
 * @param imageAlias - media_images table alias
 */
function validMediaImageUrlSql(imageAlias: string): string {
  return `TRIM(COALESCE(${imageAlias}."url", '')) <> ''`;
}

/**
 * Deletes unreferenced media_images rows with no matching CMS media_assets row.
 *
 * @returns Number of removed orphan rows
 */
export async function purgeOrphanMediaImages(): Promise<number> {
  const matchSql = lodgingAssetToMediaImageMatchSql("ma", "mi");
  const result = await db.$queryRawUnsafe<Array<{ count: string | number }>>(
    `WITH deleted AS (
       DELETE FROM "media_images" mi
       WHERE (
         TRIM(COALESCE(mi."url", '')) = ''
         OR NOT EXISTS (
           SELECT 1
           FROM "media_assets" ma
           WHERE ${matchSql}
             AND ma."mime" LIKE 'image/%'
             AND ma."url" IS NOT NULL
             AND TRIM(ma."url") <> ''
         )
       )
       AND NOT EXISTS (
         SELECT 1 FROM "room_images" ri WHERE ri."media_image_id" = mi."id"
       )
       AND NOT EXISTS (
         SELECT 1 FROM "food_images" fi WHERE fi."media_image_id" = mi."id"
       )
       RETURNING mi."id"
     )
     SELECT COUNT(*)::int AS count FROM deleted`,
  );
  return Number(result[0]?.count ?? 0);
}

/**
 * Allows site-relative paths or https CDN URLs (Cloudinary uploads).
 *
 * @param url - Candidate media URL
 */
export function isAllowedMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  return /^https:\/\//i.test(trimmed);
}

/**
 * @deprecated Prefer {@link isAllowedMediaUrl} — kept for seed scripts that expect local-only.
 * @param url - Candidate media URL
 */
export function isLocalMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  return trimmed.startsWith("/");
}

/**
 * Maps a media_images row.
 *
 * @param row - DB row
 */
function mapMediaImage(row: Record<string, unknown>): MediaImageRecord {
  return {
    id: String(row.id ?? ""),
    url: String(row.url ?? ""),
    tag: String(row.tag ?? ""),
    title: String(row.title ?? ""),
    alt: String(row.alt ?? ""),
    sort: Number(row.sort ?? 0),
  };
}

/**
 * Maps a media_videos row.
 *
 * @param row - DB row
 */
function mapMediaVideo(row: Record<string, unknown>): MediaVideoRecord {
  return {
    id: String(row.id ?? ""),
    url: String(row.url ?? ""),
    tag: String(row.tag ?? ""),
    title: String(row.title ?? ""),
    alt: String(row.alt ?? ""),
    poster:
      row.poster === null || row.poster === undefined
        ? null
        : String(row.poster),
    sort: Number(row.sort ?? 0),
  };
}

/**
 * Bulk-copies CMS `media_assets` image URLs into lodging `media_images`.
 * Room/food Library pickers require `media_images` ids for `room_images` FKs.
 * Uses one INSERT…SELECT so list endpoints stay fast.
 *
 * @returns Number of newly created lodging rows
 */
export async function syncMediaAssetsToLodgingImages(): Promise<number> {
  const inserted = await db.$queryRawUnsafe<Array<{ count: string | number }>>(
    `WITH inserted AS (
       INSERT INTO "media_images" ("id", "url", "tag", "title", "alt", "sort", "created_at", "updated_at")
       SELECT
         'mi' || replace(gen_random_uuid()::text, '-', ''),
         ma."url",
         COALESCE(NULLIF(ma."tags"->>0, ''), ''),
         COALESCE(NULLIF(TRIM(ma."caption"), ''), NULLIF(TRIM(ma."alt"), ''), 'Untitled'),
         COALESCE(NULLIF(TRIM(ma."alt"), ''), NULLIF(TRIM(ma."caption"), ''), 'Untitled'),
         0,
         CURRENT_TIMESTAMP,
         CURRENT_TIMESTAMP
       FROM "media_assets" ma
       WHERE ma."mime" LIKE 'image/%'
         AND ma."url" IS NOT NULL
         AND TRIM(ma."url") <> ''
         AND (
           ma."url" LIKE '/%'
           OR ma."url" LIKE 'https://%'
         )
         AND NOT EXISTS (
           SELECT 1 FROM "media_images" mi WHERE mi."url" = ma."url"
         )
       ON CONFLICT ("url") DO NOTHING
       RETURNING "id"
     )
     SELECT COUNT(*)::int AS count FROM inserted`,
  );
  return Number(inserted[0]?.count ?? 0);
}

/**
 * Lists media images with optional tag filter and pagination.
 * Syncs missing CMS uploads into `media_images` first so Room Library
 * matches the Media page. Tag match is exact or normalized-key equal
 * (`Private room` ↔ `private-room`).
 *
 * @param tag - Optional tag filter
 * @param options - Pagination / repository options
 */
export async function getMediaImages(
  tag?: string,
  options?: MediaImageListOptions,
): Promise<ContentResult<MediaImageListResult>> {
  return requireDb(async () => {
    const purged = await purgeOrphanMediaImages();
    const synced = await syncMediaAssetsToLodgingImages();
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(
      MAX_MEDIA_PAGE_SIZE,
      Math.max(1, options?.limit ?? DEFAULT_MEDIA_PAGE_SIZE),
    );
    const skip = (page - 1) * pageSize;
    const tagFilter = tag?.trim() || "";
    const tagKey = tagFilter ? normalizeMediaTagKey(tagFilter) : "";
    const backingAssetSql = mediaImageHasBackingAssetSql("mi");

    let total: number;
    let rows: Record<string, unknown>[];

    if (tagFilter) {
      const countRows = await db.$queryRawUnsafe<
        Array<{ count: string | number }>
      >(
        `SELECT COUNT(*)::int AS count
         FROM "media_images" mi
         WHERE ${validMediaImageUrlSql("mi")}
           AND ${backingAssetSql}
           AND (
             mi."tag" = ?
             OR lower(regexp_replace(trim(mi."tag"), '[^a-zA-Z0-9]+', '-', 'g')) = ?
           )`,
        tagFilter,
        tagKey,
      );
      total = Number(countRows[0]?.count ?? 0);
      rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT mi."id", mi."url", mi."tag", mi."title", mi."alt", mi."sort", mi."created_at", mi."updated_at"
         FROM "media_images" mi
         WHERE ${validMediaImageUrlSql("mi")}
           AND ${backingAssetSql}
           AND (
             mi."tag" = ?
             OR lower(regexp_replace(trim(mi."tag"), '[^a-zA-Z0-9]+', '-', 'g')) = ?
           )
         ORDER BY mi."updated_at" DESC, mi."sort" ASC, mi."title" ASC
         LIMIT ? OFFSET ?`,
        tagFilter,
        tagKey,
        pageSize,
        skip,
      );
    } else {
      const countRows = await db.$queryRawUnsafe<
        Array<{ count: string | number }>
      >(
        `SELECT COUNT(*)::int AS count
         FROM "media_images" mi
         WHERE ${validMediaImageUrlSql("mi")}
           AND ${backingAssetSql}`,
      );
      total = Number(countRows[0]?.count ?? 0);
      rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT mi."id", mi."url", mi."tag", mi."title", mi."alt", mi."sort", mi."created_at", mi."updated_at"
         FROM "media_images" mi
         WHERE ${validMediaImageUrlSql("mi")}
           AND ${backingAssetSql}
         ORDER BY mi."updated_at" DESC, mi."sort" ASC, mi."title" ASC
         LIMIT ? OFFSET ?`,
        pageSize,
        skip,
      );
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
      images: rows.map(mapMediaImage),
      page,
      pageSize,
      total,
      totalPages,
      synced,
      purged,
    };
  }, options);
}

/**
 * Lists media videos, optionally filtered by tag.
 *
 * @param tag - Optional tag filter
 * @param options - Repository options
 */
export async function getMediaVideos(
  tag?: string,
  options?: RepositoryOptions,
): Promise<ContentResult<MediaVideoRecord[]>> {
  return requireDb(async () => {
    const rows = await db.mediaVideo.findMany({
      where: tag ? { tag } : undefined,
      orderBy: [{ sort: "asc" }, { title: "asc" }],
    });
    return (rows as Record<string, unknown>[]).map(mapMediaVideo);
  }, options);
}

/**
 * Upserts a local media image by URL.
 *
 * @param input - Image fields
 */
export async function upsertMediaImage(input: {
  url: string;
  tag: string;
  title: string;
  alt: string;
  sort?: number;
}): Promise<MediaImageRecord> {
  if (!isAllowedMediaUrl(input.url)) {
    throw new Error(`Unsupported media URL: ${input.url}`);
  }
  const existing = await db.mediaImage.findFirst({
    where: { url: input.url },
  });
  if (existing) {
    const row = await db.mediaImage.update({
      where: { id: (existing as { id: string }).id },
      data: {
        tag: input.tag,
        title: input.title,
        alt: input.alt,
        sort: input.sort ?? 0,
      },
    });
    return mapMediaImage(row as Record<string, unknown>);
  }
  const row = await db.mediaImage.create({
    data: {
      id: createId(),
      url: input.url,
      tag: input.tag,
      title: input.title,
      alt: input.alt,
      sort: input.sort ?? 0,
    },
  });
  return mapMediaImage(row as Record<string, unknown>);
}

/**
 * Loads gallery images for rooms via room_images JOIN media_images.
 *
 * @param roomIds - Room ids
 */
export async function getRoomMediaImagesByRoomIds(
  roomIds: string[],
): Promise<Map<string, SharedGalleryImage[]>> {
  const unique = [...new Set(roomIds.filter(Boolean))];
  const map = new Map<string, SharedGalleryImage[]>();
  if (unique.length === 0) return map;

  const rows = await db.$queryRawUnsafe<
    Array<{
      room_id: string;
      media_image_id: string;
      url: string;
      title: string;
      alt: string;
      sort: number;
    }>
  >(
    `SELECT ri."room_id", mi."id" AS media_image_id, mi."url", mi."title", mi."alt", ri."sort"
     FROM "room_images" ri
     INNER JOIN "media_images" mi ON mi."id" = ri."media_image_id"
     WHERE ri."room_id" = ANY($1::text[])
     ORDER BY ri."sort" ASC`,
    unique,
  );

  for (const row of rows) {
    const list = map.get(row.room_id) ?? [];
    list.push({
      url: row.url,
      title: row.title,
      alt: row.alt || row.title,
      mediaImageId: row.media_image_id,
    });
    map.set(row.room_id, list);
  }
  return map;
}

/**
 * Replaces room_images links for a room with the given media image ids.
 *
 * @param roomId - Room id
 * @param mediaImageIds - Ordered media image ids
 */
export async function setRoomImages(
  roomId: string,
  mediaImageIds: string[],
): Promise<void> {
  await db.roomImage.deleteMany({ where: { roomId } });
  let sort = 0;
  for (const mediaImageId of mediaImageIds) {
    await db.roomImage.create({
      data: {
        id: createId(),
        roomId,
        mediaImageId,
        sort: sort++,
      },
    });
  }
}

/**
 * Loads the food menu for a catalog (points + gallery).
 *
 * @param catalog - course | retreat
 * @param options - Repository options
 */
export async function getFoodMenu(
  catalog: RoomCatalog,
  options?: RepositoryOptions,
): Promise<ContentResult<FoodMenuRecord | null>> {
  return requireDb(async () => {
    const menu = await db.foodMenu.findFirst({ where: { catalog } });
    if (!menu) return null;
    const menuId = (menu as { id: string }).id;
    const points = await db.foodPoint.findMany({
      where: { foodMenuId: menuId },
      orderBy: [{ sort: "asc" }],
    });
    const imageRows = await db.$queryRawUnsafe<
      Array<{ url: string; title: string; alt: string; sort: number }>
    >(
      `SELECT mi."url", mi."title", mi."alt", fi."sort"
       FROM "food_images" fi
       INNER JOIN "media_images" mi ON mi."id" = fi."media_image_id"
       WHERE fi."food_menu_id" = $1
       ORDER BY fi."sort" ASC`,
      menuId,
    );
    const record = menu as Record<string, unknown>;
    return {
      id: menuId,
      catalog,
      title: String(record.title ?? ""),
      description: String(record.description ?? ""),
      dietaryNote: String(record.dietaryNote ?? ""),
      live: record.live !== false && record.live !== 0,
      points: (points as Array<{ text?: string }>).map((p) =>
        String(p.text ?? ""),
      ),
      gallery: imageRows.map((row) => ({
        url: row.url,
        title: row.title,
        alt: row.alt || row.title,
      })),
    } satisfies FoodMenuRecord;
  }, options);
}

/**
 * Upserts a food menu and replaces points + image links.
 *
 * @param input - Menu fields
 */
export async function upsertFoodMenu(input: {
  catalog: RoomCatalog;
  title: string;
  description: string;
  dietaryNote: string;
  live?: boolean;
  points: string[];
  mediaImageIds: string[];
}): Promise<FoodMenuRecord> {
  const existing = await db.foodMenu.findFirst({
    where: { catalog: input.catalog },
  });
  let menuId: string;
  if (existing) {
    menuId = (existing as { id: string }).id;
    await db.foodMenu.update({
      where: { id: menuId },
      data: {
        title: input.title,
        description: input.description,
        dietaryNote: input.dietaryNote,
        live: input.live !== false,
      },
    });
  } else {
    menuId = createId();
    await db.foodMenu.create({
      data: {
        id: menuId,
        catalog: input.catalog,
        title: input.title,
        description: input.description,
        dietaryNote: input.dietaryNote,
        live: input.live !== false,
      },
    });
  }

  await db.foodPoint.deleteMany({ where: { foodMenuId: menuId } });
  let pointSort = 0;
  for (const text of input.points) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    await db.foodPoint.create({
      data: {
        id: createId(),
        foodMenuId: menuId,
        text: trimmed,
        sort: pointSort++,
      },
    });
  }

  await db.foodImage.deleteMany({ where: { foodMenuId: menuId } });
  let imageSort = 0;
  for (const mediaImageId of input.mediaImageIds) {
    await db.foodImage.create({
      data: {
        id: createId(),
        foodMenuId: menuId,
        mediaImageId,
        sort: imageSort++,
      },
    });
  }

  const result = await getFoodMenu(input.catalog);
  if (!result.data) {
    throw new Error("Failed to load food menu after upsert");
  }
  return result.data;
}

/**
 * Parses a JSON features array from a joined rooms row.
 *
 * @param value - Raw features JSON / array
 */
function parseRoomFeatures(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

/**
 * Maps a page_room_offers row (optionally joined).
 *
 * @param row - DB row
 */
function mapOffer(row: Record<string, unknown>): PageRoomOfferRecord {
  return {
    id: String(row.id ?? ""),
    pageId: String(row.pageId ?? row.page_id ?? ""),
    roomId: String(row.roomId ?? row.room_id ?? ""),
    live: row.live !== false && row.live !== 0,
    price: String(row.price ?? ""),
    originalPrice: String(row.originalPrice ?? row.original_price ?? ""),
    sort: Number(row.sort ?? 0),
    roomName:
      row.room_name || row.room_title || row.room_slug
        ? roomDisplayTitle({
            title: row.room_title ? String(row.room_title) : undefined,
            name: row.room_name ? String(row.room_name) : undefined,
            slug: row.room_slug ? String(row.room_slug) : undefined,
          })
        : undefined,
    roomSlug: row.room_slug ? String(row.room_slug) : undefined,
    roomDescription: row.room_description
      ? String(row.room_description)
      : undefined,
    roomFeatures: parseRoomFeatures(row.room_features ?? row.features),
  };
}

/**
 * Lists page room offers with room name/description.
 *
 * @param pageId - Page id
 * @param liveOnly - When true, only live offers
 * @param options - Repository options
 */
export async function getPageRoomOffers(
  pageId: string,
  liveOnly = false,
  options?: RepositoryOptions,
): Promise<ContentResult<PageRoomOfferRecord[]>> {
  return requireDb(async () => {
    const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT o."id", o."page_id", o."room_id", o."live", o."price", o."original_price",
              o."sort", r."name" AS room_name, r."title" AS room_title,
              r."slug" AS room_slug,
              r."description" AS room_description, r."features" AS room_features
       FROM "page_room_offers" o
       INNER JOIN "rooms" r ON r."id" = o."room_id"
       WHERE o."page_id" = $1
         AND ($2::boolean = FALSE OR o."live" = TRUE)
       ORDER BY o."sort" ASC, r."sort" ASC, r."name" ASC`,
      pageId,
      liveOnly,
    );
    const offers = rows.map(mapOffer);
    const media = await getRoomMediaImagesByRoomIds(
      offers.map((offer) => offer.roomId),
    );
    return offers.map((offer) => ({
      ...offer,
      roomImages: media.get(offer.roomId) ?? [],
    }));
  }, options);
}

type PricedOffersBySlugOptions = RepositoryOptions & {
  /**
   * When true, only `page_room_offers.live` rows (lodging gallery allowlist).
   * When false (default for public pricing), all rows with a non-empty fee.
   */
  liveOnly?: boolean;
};

/**
 * Lean batch load of priced room offers for many page slugs.
 * Joins `page_room_offers` → `rooms` → `room_images`/`media_images`.
 * Skips empty-price rows. `liveOnly` matches lodging gallery when true;
 * public Dates & pricing / blog rail should pass `liveOnly: false`.
 *
 * @param slugs - Published page slugs
 * @param options - Repository options + optional live filter
 */
export async function getPricedRoomOffersByPageSlugs(
  slugs: string[],
  options?: PricedOffersBySlugOptions,
): Promise<ContentResult<Map<string, PageRoomOfferRecord[]>>> {
  const liveOnly = options?.liveOnly === true;
  return requireDb(async () => {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
    const map = new Map<string, PageRoomOfferRecord[]>();
    if (unique.length === 0) return map;

    const rows = await db.$queryRawUnsafe<
      Array<Record<string, unknown> & { page_slug: string }>
    >(
      `SELECT p."slug" AS page_slug,
              o."id", o."page_id", o."room_id", o."live", o."price", o."original_price",
              o."sort", r."name" AS room_name, r."title" AS room_title,
              r."slug" AS room_slug,
              r."description" AS room_description, r."features" AS room_features
       FROM "pages" p
       INNER JOIN "page_room_offers" o ON o."page_id" = p."id"
       INNER JOIN "rooms" r ON r."id" = o."room_id"
       WHERE p."slug" = ANY($1::text[])
         AND ($2::boolean = FALSE OR o."live" = TRUE)
         AND TRIM(BOTH FROM o."price") <> ''
       ORDER BY p."slug" ASC, o."sort" ASC, r."sort" ASC, r."name" ASC`,
      unique,
      liveOnly,
    );

    const offersBySlug = new Map<string, PageRoomOfferRecord[]>();
    const roomIds: string[] = [];
    for (const row of rows) {
      const slug = String(row.page_slug ?? "");
      if (!slug) continue;
      const offer = mapOffer(row);
      const list = offersBySlug.get(slug) ?? [];
      list.push(offer);
      offersBySlug.set(slug, list);
      roomIds.push(offer.roomId);
    }

    const media = await getRoomMediaImagesByRoomIds(roomIds);
    for (const [slug, offers] of offersBySlug) {
      map.set(
        slug,
        offers.map((offer) => ({
          ...offer,
          roomImages: (media.get(offer.roomId) ?? []).filter((img) =>
            isAllowedMediaUrl(img.url),
          ),
        })),
      );
    }
    return map;
  }, options);
}

/**
 * Lean batch load of live, priced room offers for many page slugs
 * (lodging gallery Live only). Prefer {@link getPricedRoomOffersByPageSlugs}
 * with `liveOnly: false` for public fee tables.
 *
 * @param slugs - Published page slugs
 * @param options - Repository options
 */
export async function getLivePricedRoomOffersByPageSlugs(
  slugs: string[],
  options?: RepositoryOptions,
): Promise<ContentResult<Map<string, PageRoomOfferRecord[]>>> {
  return getPricedRoomOffersByPageSlugs(slugs, { ...options, liveOnly: true });
}

/**
 * Batch-loads `page_date_batches` for many page slugs (sort order preserved).
 *
 * @param slugs - Published page slugs
 * @param options - Repository options
 */
export async function getDateBatchesByPageSlugs(
  slugs: string[],
  options?: RepositoryOptions,
): Promise<ContentResult<Map<string, PageDateBatchRecord[]>>> {
  return requireDb(async () => {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
    const map = new Map<string, PageDateBatchRecord[]>();
    if (unique.length === 0) return map;

    const rows = await db.$queryRawUnsafe<
      Array<Record<string, unknown> & { page_slug: string }>
    >(
      `SELECT p."slug" AS page_slug,
              b."id", b."page_id", b."dates", b."spaces", b."status", b."tone", b."sort"
       FROM "pages" p
       INNER JOIN "page_date_batches" b ON b."page_id" = p."id"
       WHERE p."slug" = ANY($1::text[])
       ORDER BY p."slug" ASC, b."sort" ASC`,
      unique,
    );

    for (const row of rows) {
      const slug = String(row.page_slug ?? "");
      if (!slug) continue;
      const list = map.get(slug) ?? [];
      list.push({
        id: String(row.id ?? ""),
        pageId: String(row.page_id ?? row.pageId ?? ""),
        dates: String(row.dates ?? ""),
        spaces: String(row.spaces ?? ""),
        status: String(row.status ?? ""),
        tone: String(row.tone ?? "open"),
        sort: Number(row.sort ?? 0),
      });
      map.set(slug, list);
    }
    return map;
  }, options);
}

/**
 * Resolves page id from slug.
 *
 * @param slug - Page slug
 */
export async function getPageIdBySlug(slug: string): Promise<string | null> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { id: true },
  });
  return page ? String((page as { id: string }).id) : null;
}

/**
 * Upserts a single page room offer.
 *
 * @param input - Offer fields
 */
export async function upsertPageRoomOffer(input: {
  pageId: string;
  roomId: string;
  live: boolean;
  price: string;
  originalPrice?: string;
  sort?: number;
}): Promise<PageRoomOfferRecord> {
  const existing = await db.pageRoomOffer.findFirst({
    where: { pageId: input.pageId, roomId: input.roomId },
  });
  const data = {
    live: input.live,
    price: input.price.trim(),
    originalPrice: (input.originalPrice ?? "").trim(),
    sort: input.sort ?? 0,
  };
  if (existing) {
    const row = await db.pageRoomOffer.update({
      where: { id: (existing as { id: string }).id },
      data,
    });
    return mapOffer(row as Record<string, unknown>);
  }
  const row = await db.pageRoomOffer.create({
    data: {
      id: createId(),
      pageId: input.pageId,
      roomId: input.roomId,
      ...data,
    },
  });
  return mapOffer(row as Record<string, unknown>);
}

/**
 * Replaces all page room offers for a page.
 *
 * @param pageId - Page id
 * @param offers - Offer rows
 */
export async function replacePageRoomOffers(
  pageId: string,
  offers: Array<{
    roomId: string;
    live: boolean;
    price: string;
    originalPrice?: string;
    sort?: number;
  }>,
): Promise<void> {
  await db.pageRoomOffer.deleteMany({ where: { pageId } });
  let sort = 0;
  for (const offer of offers) {
    await db.pageRoomOffer.create({
      data: {
        id: createId(),
        pageId,
        roomId: offer.roomId,
        live: offer.live,
        price: offer.price.trim(),
        originalPrice: (offer.originalPrice ?? "").trim(),
        sort: offer.sort ?? sort,
      },
    });
    sort += 1;
  }
}

/**
 * Gets section flags for a page.
 *
 * @param pageId - Page id
 * @param options - Repository options
 */
export async function getPageSectionFlags(
  pageId: string,
  options?: RepositoryOptions,
): Promise<ContentResult<PageSectionFlagRecord[]>> {
  return requireDb(async () => {
    const rows = await db.pageSectionFlag.findMany({
      where: { pageId },
    });
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id ?? ""),
      pageId: String(row.pageId ?? ""),
      sectionKey: (row.sectionKey === "food"
        ? "food"
        : "accommodation") as PageSectionKey,
      live: row.live !== false && row.live !== 0,
    }));
  }, options);
}

/**
 * Upserts a section Live flag.
 *
 * @param pageId - Page id
 * @param sectionKey - accommodation | food
 * @param live - Live state
 */
export async function upsertPageSectionFlag(
  pageId: string,
  sectionKey: PageSectionKey,
  live: boolean,
): Promise<PageSectionFlagRecord> {
  const existing = await db.pageSectionFlag.findFirst({
    where: { pageId, sectionKey },
  });
  if (existing) {
    const row = await db.pageSectionFlag.update({
      where: { id: (existing as { id: string }).id },
      data: { live },
    });
    return {
      id: String((row as { id: string }).id),
      pageId,
      sectionKey,
      live,
    };
  }
  const row = await db.pageSectionFlag.create({
    data: {
      id: createId(),
      pageId,
      sectionKey,
      live,
    },
  });
  return {
    id: String((row as { id: string }).id),
    pageId,
    sectionKey,
    live,
  };
}

/**
 * Lists date batches for a page.
 *
 * @param pageId - Page id
 * @param options - Repository options
 */
export async function getPageDateBatches(
  pageId: string,
  options?: RepositoryOptions,
): Promise<ContentResult<PageDateBatchRecord[]>> {
  return requireDb(async () => {
    const rows = await db.pageDateBatch.findMany({
      where: { pageId },
      orderBy: [{ sort: "asc" }],
    });
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id ?? ""),
      pageId: String(row.pageId ?? ""),
      dates: String(row.dates ?? ""),
      spaces: String(row.spaces ?? ""),
      status: String(row.status ?? ""),
      tone: String(row.tone ?? "open"),
      sort: Number(row.sort ?? 0),
    }));
  }, options);
}

/**
 * Replaces all date batches for a page (dates only).
 *
 * @param pageId - Page id
 * @param batches - Batch rows
 */
export async function replacePageDateBatches(
  pageId: string,
  batches: Array<{
    dates: string;
    spaces: string;
    status?: string;
    tone?: string;
    sort?: number;
  }>,
): Promise<void> {
  await db.pageDateBatch.deleteMany({ where: { pageId } });
  let sort = 0;
  for (const batch of batches) {
    await db.pageDateBatch.create({
      data: {
        id: createId(),
        pageId,
        dates: batch.dates.trim(),
        spaces: batch.spaces.trim(),
        status: (batch.status ?? "").trim(),
        tone: batch.tone ?? "open",
        sort: batch.sort ?? sort,
      },
    });
    sort += 1;
  }
}
