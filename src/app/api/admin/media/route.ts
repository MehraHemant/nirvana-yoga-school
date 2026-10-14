import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import { parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import {
  getMediaAssetsUsage,
  type MediaUsageResult,
} from "@/lib/cms/media-usage";
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
  let rows: ReturnType<typeof toMediaAssetListItem>[];
  let usageMap: Map<string, MediaUsageResult> | null = null;

  if (usageFilter) {
    // Usage is resolved in memory, so filter the full set, then paginate.
    const allRows = (
      await db.$queryRawUnsafe<MediaAssetListRow[]>(selectSql, ...params)
    ).map(toMediaAssetListItem);
    const allUsage = await getMediaAssetsUsage(allRows);
    const wantInUse = usageFilter === "inUse";
    const matching = allRows.filter(
      (asset) => (allUsage.get(asset.id)?.inUse ?? false) === wantInUse,
    );
    total = matching.length;
    rows = matching.slice(skip, skip + pageSize);
    usageMap = allUsage;
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
    rows = rawRows.map(toMediaAssetListItem);
    if (includeUsage) usageMap = await getMediaAssetsUsage(rows);
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
      usage: usageMap?.get(asset.id) ?? { inUse: false, references: [] },
    })),
    page,
    pageSize,
    total,
    totalPages,
  });
}
