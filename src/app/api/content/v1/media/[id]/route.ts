import {
  jsonCached,
  jsonInternal,
  jsonNotFound,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { deliveryPreflight } from "@/lib/cms/delivery-auth";
import { isDbConnectionError, prisma } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Delivery API — one media asset by id.
 *
 * @param request - Incoming request
 * @param context - Route params with the media id
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const blocked = deliveryPreflight(request);
  if (blocked) return blocked;

  const { id } = await context.params;
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return jsonNotFound("Media not found");
    return jsonCached({
      media: {
        id: asset.id,
        url: asset.url,
        mime: asset.mime,
        width: asset.width,
        height: asset.height,
        alt: asset.alt,
        caption: asset.caption,
        description: asset.description,
        tags: asset.tags,
      },
    });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Content delivery is not available.");
    }
    return jsonInternal();
  }
}
