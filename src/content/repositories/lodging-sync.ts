import { dropOrphanPricingOptions } from "@/content/mappers/page-room-fees";
import type { PageRoomOfferRecord } from "@/content/types/lodging";
import type {
  PageModulesDocument,
  PricingBatch,
} from "@/content/types/page-modules";
import type {
  RetreatDocument,
  RetreatPackage,
} from "@/content/types/retreat-page";
import type { CoursePricingOption } from "@/content/types/shared";
import { createEmptyResidentialLife } from "@/lib/cms/structural-defaults";
import {
  getPageDateBatches,
  getPageIdBySlug,
  getPageRoomOffers,
  getPageSectionFlags,
  replacePageDateBatches,
  replacePageRoomOffers,
  upsertPageSectionFlag,
} from "./lodging";

/**
 * Builds pricing options from page room offers.
 * Name / description / features / image come from the shared room join.
 *
 * @param offers - Offers with joined room fields
 * @param liveOnly - When true (default), exclude non-Live offers
 */
export function offersToPricingOptions(
  offers: PageRoomOfferRecord[],
  liveOnly = true,
): CoursePricingOption[] {
  return offers
    .filter((offer) => !liveOnly || offer.live)
    .map((offer) => ({
      roomId: offer.roomId,
      roomType: offer.roomName ?? "",
      price: offer.price,
      originalPrice: offer.originalPrice.trim()
        ? offer.originalPrice
        : undefined,
      description: offer.roomDescription ?? "",
      features: offer.roomFeatures ?? [],
      image: offer.roomImages?.[0]?.url,
    }));
}

/**
 * Builds retreat packages from page room offers.
 *
 * @param offers - Offers with joined room fields
 * @param liveOnly - When true (default), only Live offers with a price
 */
export function offersToRetreatPackages(
  offers: PageRoomOfferRecord[],
  liveOnly = true,
): RetreatPackage[] {
  return offers
    .filter((offer) => {
      if (!liveOnly) return true;
      return offer.live && Boolean(offer.price.trim());
    })
    .map((offer) => ({
      roomId: offer.roomId,
      title: offer.roomName ?? "",
      price: offer.price,
      originalPrice: offer.originalPrice.trim()
        ? offer.originalPrice
        : undefined,
      description: offer.roomDescription ?? "",
      features: offer.roomFeatures ?? [],
      image: offer.roomImages?.[0]?.url,
    }));
}

/**
 * Maps pricing module batches into `page_date_batches` row shapes.
 *
 * @param batches - Pricing batches from page modules
 */
export function pricingBatchesToDateBatchRows(batches: PricingBatch[]): Array<{
  dates: string;
  spaces: string;
  status?: string;
  tone?: string;
  sort?: number;
}> {
  return batches.map((batch, index) => ({
    dates: batch.dates ?? "",
    spaces: batch.spaces ?? "",
    status: batch.status ?? "",
    tone: batch.tone ?? "open",
    sort: index,
  }));
}

/**
 * Maps date batch rows into pricing batch modules.
 *
 * @param batches - Date batch records
 */
export function dateBatchesToPricingBatches(
  batches: Array<{
    dates: string;
    spaces: string;
    status: string;
    tone: string;
  }>,
): PricingBatch[] {
  return batches.map((batch) => {
    const tone =
      batch.tone === "fast" || batch.tone === "last" ? batch.tone : "open";
    const statusColor =
      tone === "last"
        ? "text-rose-700 bg-rose-50 border-rose-200"
        : tone === "fast"
          ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-emerald-700 bg-emerald-50 border-emerald-200";
    return {
      dates: batch.dates,
      spaces: batch.spaces,
      tone,
      status:
        batch.status ||
        (tone === "last"
          ? "Last seats"
          : tone === "fast"
            ? "Filling Fast"
            : "Open"),
      statusColor,
    };
  });
}

/**
 * Hydrates page modules from relational offers / dates / flags when present.
 * Prefers DB tables over nested page_modules JSON for lodging prices and dates.
 *
 * @param slug - Page slug
 * @param modules - Modules loaded from page_modules
 */
export async function hydrateModulesFromLodgingTables(
  slug: string,
  modules: PageModulesDocument | null,
): Promise<PageModulesDocument | null> {
  if (!modules) return null;
  const pageId = await getPageIdBySlug(slug);
  if (!pageId) return modules;

  const [offersResult, batchesResult, flagsResult] = await Promise.all([
    getPageRoomOffers(pageId, false).catch(() => ({
      data: [] as PageRoomOfferRecord[],
    })),
    getPageDateBatches(pageId).catch(() => ({ data: [] })),
    getPageSectionFlags(pageId).catch(() => ({ data: [] })),
  ]);

  const offers = offersResult.data ?? [];
  const batches = batchesResult.data ?? [];
  const flags = flagsResult.data ?? [];
  let next = { ...modules };

  if (offers.length > 0) {
    const liveRoomIds = offers.filter((o) => o.live).map((o) => o.roomId);
    // Keep all offers (incl. not Live) so admin can restore prices when
    // toggling Live back on. Public clients filter by roomIds.
    const pricingOptions = offersToPricingOptions(offers, false);
    const residential = next.residentialLife ?? createEmptyResidentialLife();
    next = {
      ...next,
      pricing: {
        ...next.pricing,
        options: pricingOptions,
      },
      residentialLife: {
        ...residential,
        accommodation: {
          ...residential.accommodation,
          roomIds: liveRoomIds,
        },
      },
    };
  } else if (next.residentialLife) {
    next = {
      ...next,
      pricing: {
        ...next.pricing,
        options: dropOrphanPricingOptions(next.pricing.options ?? []),
      },
    };
  }

  if (batches.length > 0) {
    next = {
      ...next,
      pricing: {
        ...next.pricing,
        batches: dateBatchesToPricingBatches(batches),
      },
    };
  } else {
    const jsonBatches = next.pricing?.batches ?? [];
    if (jsonBatches.length > 0) {
      await replacePageDateBatches(
        pageId,
        pricingBatchesToDateBatchRows(jsonBatches),
      ).catch((error) => {
        console.error(
          "[hydrateModulesFromLodgingTables] batch backfill failed",
          error,
        );
      });
    }
  }

  if (flags.length > 0) {
    const residential = next.residentialLife ?? createEmptyResidentialLife();
    const accommodationFlag = flags.find(
      (f) => f.sectionKey === "accommodation",
    );
    const foodFlag = flags.find((f) => f.sectionKey === "food");
    next = {
      ...next,
      residentialLife: {
        ...residential,
        accommodation: {
          ...residential.accommodation,
          live: accommodationFlag
            ? accommodationFlag.live
            : residential.accommodation.live,
          roomIds: residential.accommodation.roomIds,
        },
        food: {
          ...residential.food,
          live: foodFlag ? foodFlag.live : residential.food.live,
        },
      },
    };
  }

  return next;
}

/**
 * Dual-writes lodging offers, section flags, and date batches from saved modules.
 *
 * @param pageId - Page id
 * @param modules - Saved page modules
 * @param retreat - Optional retreat document (packages as offer source)
 */
export async function syncLodgingTablesFromModules(
  pageId: string,
  modules: PageModulesDocument,
  retreat?: RetreatDocument | null,
): Promise<void> {
  const residential = modules.residentialLife;
  const catalogRoomAllowlist = residential?.accommodation?.roomIds;

  const linkedItems: Array<{
    roomId?: string;
    price: string;
    originalPrice?: string;
  }> = retreat
    ? retreat.packages.map((pkg) => ({
        roomId: pkg.roomId,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
      }))
    : (modules.pricing?.options ?? []).map((option) => ({
        roomId: option.roomId,
        price: option.price,
        originalPrice: option.originalPrice,
      }));

  const offers: Array<{
    roomId: string;
    live: boolean;
    price: string;
    originalPrice?: string;
    sort?: number;
  }> = [];
  let sort = 0;
  for (const item of linkedItems) {
    if (!item.roomId) continue;
    const live =
      catalogRoomAllowlist === undefined
        ? true
        : catalogRoomAllowlist.includes(item.roomId);
    offers.push({
      roomId: item.roomId,
      live,
      price: item.price ?? "",
      originalPrice: item.originalPrice,
      sort: sort++,
    });
  }

  // Include allowlisted rooms that have no pricing row yet (Live without fee).
  if (Array.isArray(catalogRoomAllowlist)) {
    const seen = new Set(offers.map((o) => o.roomId));
    for (const roomId of catalogRoomAllowlist) {
      if (seen.has(roomId)) continue;
      offers.push({
        roomId,
        live: true,
        price: "",
        sort: sort++,
      });
    }
  }

  if (offers.length > 0) {
    await replacePageRoomOffers(pageId, offers);
  }

  if (residential) {
    await upsertPageSectionFlag(
      pageId,
      "accommodation",
      residential.accommodation?.live !== false,
    );
    await upsertPageSectionFlag(
      pageId,
      "food",
      residential.food?.live !== false,
    );
  }

  // Always dual-write batches (including empty) so Add/remove stays in sync.
  if (modules.pricing) {
    await replacePageDateBatches(
      pageId,
      pricingBatchesToDateBatchRows(modules.pricing.batches ?? []),
    );
  }
}
