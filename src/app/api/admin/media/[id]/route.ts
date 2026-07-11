import { deleteFromCloudinary } from "@/lib/cdn/cloudinary";
import { normalizeMediaTags } from "@/lib/cdn/media-tags";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getMediaAssetUsage } from "@/lib/cms/media-usage";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

type MediaUpdateBody = {
  caption?: string | null;
  description?: string | null;
  alt?: string | null;
  tags?: string[];
};

/**
 * Load a single media asset with usage info.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const usage = await getMediaAssetUsage({ id: asset.id, url: asset.url });

  return Response.json({
    asset: {
      ...asset,
      createdAt: asset.createdAt.toISOString(),
      usage,
    },
  });
}

/**
 * Update media metadata (caption, description, tags, alt).
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as MediaUpdateBody;

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      ...(body.caption !== undefined
        ? { caption: body.caption?.trim() || null }
        : {}),
      ...(body.description !== undefined
        ? { description: body.description?.trim() || null }
        : {}),
      ...(body.alt !== undefined ? { alt: body.alt?.trim() || null } : {}),
      ...(body.tags !== undefined
        ? { tags: normalizeMediaTags(body.tags) }
        : {}),
    },
  });

  const usage = await getMediaAssetUsage({ id: asset.id, url: asset.url });

  return Response.json({
    asset: {
      ...asset,
      createdAt: asset.createdAt.toISOString(),
      usage,
    },
  });
}

/**
 * Delete a media asset when it is not referenced anywhere in the CMS.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const usage = await getMediaAssetUsage({ id: asset.id, url: asset.url });
  if (usage.inUse) {
    return Response.json(
      {
        error: "Image is in use and cannot be deleted",
        references: usage.references,
      },
      { status: 409 },
    );
  }

  await deleteFromCloudinary(asset.cdnKey);
  await prisma.mediaAsset.delete({ where: { id } });

  return Response.json({ ok: true });
}
