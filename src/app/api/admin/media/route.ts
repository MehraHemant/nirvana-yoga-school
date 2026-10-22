import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import { parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import type { MediaUsageResult } from "@/lib/cms/media-usage";
import { getCachedMediaUsageEntries } from "@/lib/cms/media-usage-cache";
import { db } from "@/lib/db";

const DEFAULT_PAGE_SIZE = 48;
const MAX_PAGE_SIZE = 60;

type MediaKind = "image" | "video";

type MediaUsageFilter = "unused" | "inUse";

type MediaAssetListRow = {
  id: string;
  url: string;
  cdn_key: string;
  mime: string;
  size_bytes: number | string;
  alt: string | null;
  caption: string | null;
  description: string | null;
  tags: unknown;
  created_at: Date | string;
};

/**
 * Resolves the SQL mime prefix for image/video library tabs.
 *
 * @param kind - Optional library kind filter
 */
function mimePrefixForKind(kind: string | null): string | null {
  if (kind === "image") return "image/";
  if (kind === "video") return "video/";
  return null;
}

/**
 * Counts referenced and unreferenced assets in a library slice.
 * Ids missing from the snapshot are unused (new uploads).
 *
 * @param assetIds - Asset ids in the current kind/tag slice
 * @param usageMap - Cached usage keyed by asset id
 */
function summarizeMediaUsage(
  assetIds: string[],
  usageMap: Map<string, MediaUsageResult>,
): { inUse: number; unused: number } {
  let inUse = 0;
  for (const id of assetIds) {
    if (usageMap.get(id)?.inUse) inUse += 1;
  }
  return { inUse, unused: assetIds.length - inUse };
}

/**
 * Maps a raw `media_assets` SQL row to the camelCase list shape.
 *
 * @param row - Raw SQL row
 */
function toMediaAssetListItem(row: MediaAssetListRow) {
  return {
    id: row.id,
    url: row.url,
    cdnKey: row.cdn_key,
    mime: row.mime,
    sizeBytes: Number(row.size_bytes ?? 0),
    alt: row.alt,
    caption: row.caption,
    description: row.description,
    tags: row.tags,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at
        : new Date(row.created_at),
  };
}

/**
 * List media assets for the admin media library (paginated thumbnails).
 *
 * Query: `?tag=&page=1&limit=48&includeUsage=1&kind=image|video&usage=unused|inUse`
 *
 * `usage` filters the whole library by CMS usage before paginating (implies
 * `includeUsage`), so "Load more" keeps returning matching assets.
 * Usage comes from a short-lived library snapshot, not a fresh JSON scan.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const url = new URL(request.url);
  const tag = url.searchParams.get("tag")?.trim() || "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limitRaw = Number(url.searchParams.get("limit") ?? DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.isFinite(limitRaw) ? limitRaw : DEFAULT_PAGE_SIZE),
  );
  const usageParam = url.searchParams.get("usage");
  const usageFilter: MediaUsageFilter | null =
    usageParam === "unused" || usageParam === "inUse" ? usageParam : null;
  const includeUsage =
    usageFilter !== null || url.searchParams.get("includeUsage") === "1";
  const kindParam = url.searchParams.get("kind");
  const kind: MediaKind | null =
    kindParam === "video" ? "video" : kindParam === "image" ? "image" : null;
  const mimePrefix = mimePrefixForKind(kind);
  const skip = (page - 1) * pageSize;

  const filters: string[] = [];
  const params: unknown[] = [];
  if (tag) {
    filters.push(`"tags" @> ?::jsonb`);
    params.push(JSON.stringify([tag]));
  }
  if (mimePrefix) {
    filters.push(`"mime" LIKE ?`);
    params.push(`${mimePrefix}%`);
  }
  const whereClause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const selectSql = `SELECT "id", "url", "cdn_key", "mime", "size_bytes", "alt", "caption", "description", "tags", "created_at"
     FROM "media_assets"
     ${whereClause}
     ORDER BY "created_at" DESC`;

  let total: number;
  let libraryTotal: number;
  let rows: ReturnType<typeof toMediaAssetListItem>[];
  let usageMap: Map<string, MediaUsageResult> | null = null;
  let usageSummary: { inUse: number; unused: number } | undefined;

  if (usageFilter) {
    // Filter the kind/tag slice, then paginate, so unused files are not stuck
    // on later pages of the unfiltered library.
    const [cached, rawRows] = await Promise.all([
      getCachedMediaUsageEntries(),
      db.$queryRawUnsafe<MediaAssetListRow[]>(selectSql, ...params),
    ]);
    usageMap = new Map(cached.entries);
    const allRows = rawRows.map(toMediaAssetListItem);
    libraryTotal = allRows.length;
    usageSummary = summarizeMediaUsage(
      allRows.map((asset) => asset.id),
      usageMap,
    );
    const wantInUse = usageFilter === "inUse";
    const matching = allRows.filter(
      (asset) => (usageMap?.get(asset.id)?.inUse ?? false) === wantInUse,
    );
    total = matching.length;
    rows = matching.slice(skip, skip + pageSize);
  } else if (includeUsage) {
    const [cached, countRows, rawRows, idRows] = await Promise.all([
      getCachedMediaUsageEntries(),
      db.$queryRawUnsafe<Array<{ count: string | number }>>(
        `SELECT COUNT(*)::int AS count FROM "media_assets" ${whereClause}`,
        ...params,
      ),
      db.$queryRawUnsafe<MediaAssetListRow[]>(
        `${selectSql} LIMIT ? OFFSET ?`,
        ...params,
        pageSize,
        skip,
      ),
      db.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT "id" FROM "media_assets" ${whereClause}`,
        ...params,
      ),
    ]);
    usageMap = new Map(cached.entries);
    total = Number(countRows[0]?.count ?? 0);
    libraryTotal = total;
    rows = rawRows.map(toMediaAssetListItem);
    usageSummary = summarizeMediaUsage(
      idRows.map((row) => String(row.id)),
      usageMap,
    );
  } else {
    const [countRows, rawRows] = await Promise.all([
      db.$queryRawUnsafe<Array<{ count: string | number }>>(
        `SELECT COUNT(*)::int AS count FROM "media_assets" ${whereClause}`,
        ...params,
      ),
      db.$queryRawUnsafe<MediaAssetListRow[]>(
        `${selectSql} LIMIT ? OFFSET ?`,
        ...params,
        pageSize,
        skip,
      ),
    ]);
    total = Number(countRows[0]?.count ?? 0);
    libraryTotal = total;
    rows = rawRows.map(toMediaAssetListItem);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return jsonOk({
    assets: rows.map((asset) => ({
      id: asset.id,
      url: asset.url,
      thumbUrl: cloudinaryThumbUrl(String(asset.url), 240),
      mime: asset.mime,
      sizeBytes: asset.sizeBytes,
      alt: asset.alt,
      caption: asset.caption,
      description: asset.description,
      tags: parseMediaTagsFromDb(asset.tags),
      createdAt: asset.createdAt.toISOString(),
      ...(usageMap
        ? {
            usage: usageMap.get(asset.id) ?? {
              inUse: false,
              references: [],
            },
          }
        : {}),
    })),
    page,
    pageSize,
    total,
    libraryTotal,
    totalPages,
    ...(usageSummary ? { usageSummary } : {}),
  });
}
