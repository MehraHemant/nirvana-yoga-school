import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import { parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getMediaAssetsUsage } from "@/lib/cms/media-usage";
import { db } from "@/lib/db";

const DEFAULT_PAGE_SIZE = 48;
const MAX_PAGE_SIZE = 60;

type MediaKind = "image" | "video";

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
 * List media assets for the admin media library (paginated thumbnails).
 *
 * Query: `?tag=&page=1&limit=48&includeUsage=1&kind=image|video`
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
  const includeUsage = url.searchParams.get("includeUsage") === "1";
  const kindParam = url.searchParams.get("kind");
  const kind: MediaKind | null =
    kindParam === "video" ? "video" : kindParam === "image" ? "image" : null;
  const mimePrefix = mimePrefixForKind(kind);
  const skip = (page - 1) * pageSize;

  let total: number;
  let rows: Array<{
    id: string;
    url: string;
    cdnKey: string;
    mime: string;
    sizeBytes: number;
    alt: string | null;
    caption: string | null;
    description: string | null;
    tags: unknown;
    createdAt: Date;
  }>;

  if (tag) {
    const filters = [`"tags" @> ?::jsonb`];
    const params: unknown[] = [JSON.stringify([tag])];

    if (mimePrefix) {
      filters.push(`"mime" LIKE ?`);
      params.push(`${mimePrefix}%`);
    }

    const whereClause = filters.join(" AND ");

    const countRows = await db.$queryRawUnsafe<
      Array<{ count: string | number }>
    >(
      `SELECT COUNT(*)::int AS count FROM "media_assets" WHERE ${whereClause}`,
      ...params,
    );
    total = Number(countRows[0]?.count ?? 0);

    const rawRows = await db.$queryRawUnsafe<MediaAssetListRow[]>(
      `SELECT "id", "url", "cdn_key", "mime", "size_bytes", "alt", "caption", "description", "tags", "created_at"
       FROM "media_assets"
       WHERE ${whereClause}
       ORDER BY "created_at" DESC
       LIMIT ? OFFSET ?`,
      ...params,
      pageSize,
      skip,
    );
    rows = rawRows.map((row) => ({
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
    }));
  } else if (mimePrefix) {
    const countRows = await db.$queryRawUnsafe<
      Array<{ count: string | number }>
    >(
      `SELECT COUNT(*)::int AS count FROM "media_assets" WHERE "mime" LIKE ?`,
      `${mimePrefix}%`,
    );
    total = Number(countRows[0]?.count ?? 0);

    const rawRows = await db.$queryRawUnsafe<MediaAssetListRow[]>(
      `SELECT "id", "url", "cdn_key", "mime", "size_bytes", "alt", "caption", "description", "tags", "created_at"
       FROM "media_assets"
       WHERE "mime" LIKE ?
       ORDER BY "created_at" DESC
       LIMIT ? OFFSET ?`,
      `${mimePrefix}%`,
      pageSize,
      skip,
    );
    rows = rawRows.map((row) => ({
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
    }));
  } else {
    [total, rows] = await Promise.all([
      db.mediaAsset.count(),
      db.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip,
        select: {
          id: true,
          url: true,
          cdnKey: true,
          mime: true,
          sizeBytes: true,
          alt: true,
          caption: true,
          description: true,
          tags: true,
          createdAt: true,
        },
      }) as Promise<
        Array<{
          id: string;
          url: string;
          cdnKey: string;
          mime: string;
          sizeBytes: number;
          alt: string | null;
          caption: string | null;
          description: string | null;
          tags: unknown;
          createdAt: Date;
        }>
      >,
    ]);
  }

  const usageMap = includeUsage
    ? await getMediaAssetsUsage(
        rows.map((asset) => ({
          id: asset.id,
          url: asset.url,
          cdnKey: asset.cdnKey,
        })),
      )
    : null;

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
