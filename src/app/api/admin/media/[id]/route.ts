import { deleteFromCloudinary } from "@/lib/cdn/cloudinary";
import { normalizeMediaTags, parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import {
  jsonConflict,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getMediaAssetUsage } from "@/lib/cms/media-usage";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

type MediaUpdateBody = {
  caption?: string | null;
  description?: string | null;
  alt?: string | null;
  tags?: string[];
};

/**
 * Load a single media asset with usage info.
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return jsonNotFound();
  }

  const usage = await getMediaAssetUsage({ id: asset.id, url: asset.url });

  return jsonOk({
    asset: {
      ...asset,
      tags: parseMediaTagsFromDb(asset.tags),
      createdAt: asset.createdAt.toISOString(),
      usage,
    },
  });
}

/**
 * Update media metadata (caption, description, tags, alt).
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;
  const body = (await request.json()) as MediaUpdateBody;

  const asset = await db.mediaAsset.update({
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

  return jsonOk({
    asset: {
      ...asset,
      tags: parseMediaTagsFromDb(asset.tags),
      createdAt: asset.createdAt.toISOString(),
      usage,
    },
  });
}

/**
 * Delete a media asset when it is not referenced anywhere in the CMS.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return jsonNotFound();
  }

  const usage = await getMediaAssetUsage({ id: asset.id, url: asset.url });
  if (usage.inUse) {
    return jsonConflict(
      "Image is in use and cannot be deleted",
      usage.references,
    );
  }

  await deleteFromCloudinary(asset.cdnKey);
  await db.mediaAsset.delete({ where: { id } });

  return jsonMutationOk();
}
