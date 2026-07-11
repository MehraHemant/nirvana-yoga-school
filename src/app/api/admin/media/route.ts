import { getSessionFromRequest } from "@/lib/cms/auth";
import { getMediaAssetsUsage } from "@/lib/cms/media-usage";
import { prisma } from "@/lib/db";

/**
 * List media assets for the admin media library.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");

  const assets = await prisma.mediaAsset.findMany({
    where: tag ? { tags: { has: tag } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const usageMap = await getMediaAssetsUsage(
    assets.map((asset) => ({ id: asset.id, url: asset.url })),
  );

  return Response.json({
    assets: assets.map((asset) => ({
      ...asset,
      createdAt: asset.createdAt.toISOString(),
      usage: usageMap.get(asset.id) ?? { inUse: false, references: [] },
    })),
  });
}
