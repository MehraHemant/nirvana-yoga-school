import { parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getMediaAssetsUsage } from "@/lib/cms/media-usage";
import { db } from "@/lib/db";

/**
 * List media assets for the admin media library.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");

  const rows = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const assets = tag
    ? rows.filter((asset) => parseMediaTagsFromDb(asset.tags).includes(tag))
    : rows;

  const usageMap = await getMediaAssetsUsage(
    assets.map((asset) => ({ id: asset.id, url: asset.url })),
  );

  return jsonOk({
    assets: assets.map((asset) => ({
      ...asset,
      tags: parseMediaTagsFromDb(asset.tags),
      createdAt: asset.createdAt.toISOString(),
      usage: usageMap.get(asset.id) ?? { inUse: false, references: [] },
    })),
  });
}
