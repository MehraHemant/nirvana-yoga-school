import { revalidatePath } from "next/cache";
import {
  getMediaImages,
  getMediaVideos,
  getPageDateBatches,
  getPageIdBySlug,
  getPageRoomOffers,
  getPageSectionFlags,
  replacePageDateBatches,
  replacePageRoomOffers,
  upsertPageRoomOffer,
  upsertPageSectionFlag,
} from "@/content/repositories/lodging";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import {
  jsonBadRequest,
  jsonError,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";

/**
 * Lists lodging media, or page offers/dates/flags when `pageSlug` is set.
 *
 * Query: `?kind=images&tag=&page=1&limit=48` for media;
 * `?pageSlug=&view=offers|dates|flags` for page lodging data.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const url = new URL(request.url);
  const pageSlug = url.searchParams.get("pageSlug")?.trim();
  const view = url.searchParams.get("view")?.trim() ?? "offers";
  const tag = url.searchParams.get("tag")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limitRaw = Number(url.searchParams.get("limit") ?? 48);
  const limit = Math.min(
    60,
    Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 48),
  );

  try {
    if (pageSlug) {
      const pageId = await getPageIdBySlug(pageSlug);
      if (!pageId) return jsonNotFound("Page not found");

      if (view === "dates") {
        const batches = await getPageDateBatches(pageId);
        return jsonOk({ pageId, batches: batches.data ?? [] });
      }
      if (view === "flags") {
        const flags = await getPageSectionFlags(pageId);
        return jsonOk({ pageId, flags: flags.data ?? [] });
      }
      const offers = await getPageRoomOffers(pageId, false);
      return jsonOk({ pageId, offers: offers.data ?? [] });
    }

    const kind = url.searchParams.get("kind")?.trim() ?? "images";
    if (kind === "videos") {
      const videos = await getMediaVideos(tag || undefined);
      return jsonOk({ videos: videos.data ?? [] });
    }
    const result = await getMediaImages(tag || undefined, { page, limit });
    const list = result.data;
    return jsonOk({
      images: (list?.images ?? []).map((image) => ({
        ...image,
        thumbUrl: cloudinaryThumbUrl(image.url, 240),
      })),
      page: list?.page ?? page,
      pageSize: list?.pageSize ?? limit,
      total: list?.total ?? 0,
      totalPages: list?.totalPages ?? 1,
      synced: list?.synced ?? 0,
      purged: list?.purged ?? 0,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load lodging data",
      500,
    );
  }
}

/**
 * Upserts page room offers, section flags, and/or date batches.
 *
 * Body: `{ pageSlug, offers?, flags?, batches? }`
 */
export async function PUT(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  try {
    const body = await request.json();
    const pageSlug = String(body.pageSlug ?? "").trim();
    if (!pageSlug) {
      return jsonBadRequest("pageSlug is required");
    }
    const pageId = await getPageIdBySlug(pageSlug);
    if (!pageId) return jsonNotFound("Page not found");

    if (Array.isArray(body.offers)) {
      await replacePageRoomOffers(
        pageId,
        body.offers
          .map(
            (
              offer: {
                roomId?: string;
                live?: boolean;
                price?: string;
                originalPrice?: string;
                sort?: number;
              },
              index: number,
            ) => ({
              roomId: String(offer.roomId ?? ""),
              live: offer.live !== false,
              price: String(offer.price ?? ""),
              originalPrice: String(offer.originalPrice ?? ""),
              sort: typeof offer.sort === "number" ? offer.sort : index,
            }),
          )
          .filter((offer: { roomId: string }) => Boolean(offer.roomId)),
      );
    } else if (body.offer && typeof body.offer === "object") {
      const offer = body.offer as {
        roomId?: string;
        live?: boolean;
        price?: string;
        originalPrice?: string;
        sort?: number;
      };
      if (!offer.roomId) return jsonBadRequest("offer.roomId is required");
      await upsertPageRoomOffer({
        pageId,
        roomId: String(offer.roomId),
        live: offer.live !== false,
        price: String(offer.price ?? ""),
        originalPrice: String(offer.originalPrice ?? ""),
        sort: typeof offer.sort === "number" ? offer.sort : 0,
      });
    }

    if (Array.isArray(body.flags)) {
      for (const flag of body.flags as Array<{
        sectionKey?: string;
        live?: boolean;
      }>) {
        if (flag.sectionKey !== "accommodation" && flag.sectionKey !== "food") {
          continue;
        }
        await upsertPageSectionFlag(
          pageId,
          flag.sectionKey,
          flag.live !== false,
        );
      }
    }

    if (Array.isArray(body.batches)) {
      await replacePageDateBatches(
        pageId,
        body.batches.map(
          (
            batch: {
              dates?: string;
              spaces?: string;
              status?: string;
              tone?: string;
              sort?: number;
            },
            index: number,
          ) => ({
            dates: String(batch.dates ?? ""),
            spaces: String(batch.spaces ?? ""),
            status: String(batch.status ?? ""),
            tone: String(batch.tone ?? "open"),
            sort: typeof batch.sort === "number" ? batch.sort : index,
          }),
        ),
      );
    }

    const [offers, batches, flags] = await Promise.all([
      getPageRoomOffers(pageId, false),
      getPageDateBatches(pageId),
      getPageSectionFlags(pageId),
    ]);

    // Revalidate product pages so lodging changes appear immediately
    revalidatePath("/course", "layout");
    revalidatePath("/online-course", "layout");
    revalidatePath("/retreat", "layout");

    return jsonOk({
      pageId,
      offers: offers.data ?? [],
      batches: batches.data ?? [],
      flags: flags.data ?? [],
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save lodging data",
      500,
    );
  }
}
