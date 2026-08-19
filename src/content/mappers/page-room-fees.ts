import { roomDisplayTitle } from "@/content/lodging/room-catalog";
import type { RetreatPackage } from "@/content/types/retreat-page";
import type { CoursePricingOption } from "@/content/types/shared";
import type { RoomRecord } from "@/content/types/shared-sections";

/** Price fields edited inline on Lodging & food. */
export type PageRoomFee = {
  price: string;
  originalPrice?: string;
};

/**
 * Builds a roomId → fee map from pricing options or packages.
 *
 * @param items - Rows that may carry a shared room id
 */
export function roomFeesFromLinkedItems(
  items: Array<{ roomId?: string; price: string; originalPrice?: string }>,
): Record<string, PageRoomFee> {
  const fees: Record<string, PageRoomFee> = {};
  for (const item of items) {
    if (!item.roomId) continue;
    fees[item.roomId] = {
      price: item.price ?? "",
      originalPrice: item.originalPrice,
    };
  }
  return fees;
}

/**
 * Drops legacy pricing rows that are not linked to a shared room id.
 *
 * @param options - Current pricing.options
 */
export function dropOrphanPricingOptions(
  options: CoursePricingOption[],
): CoursePricingOption[] {
  return options.filter((option) => Boolean(option.roomId));
}

/**
 * Public fee rows: lodging-linked options that have a price set.
 * Not gated by per-page lodging Live (that only controls accommodation gallery).
 *
 * @param options - Current pricing.options
 */
export function publicPricingOptionsWithFees(
  options: CoursePricingOption[],
): CoursePricingOption[] {
  return dropOrphanPricingOptions(options).filter((option) =>
    Boolean(option.price?.trim()),
  );
}

/**
 * Shared room fields copied onto pricing options / packages for public display.
 *
 * @param room - Shared catalog room
 */
function roomCatalogFields(room: RoomRecord): {
  roomType: string;
  description: string;
  features: string[];
  image?: string;
} {
  return {
    roomType: roomDisplayTitle(room),
    description: room.description ?? "",
    features: room.features ?? [],
    image: room.images[0]?.url,
  };
}

/**
 * Upserts a course pricing option linked to a shared room.
 * Name / description / features / image come from the shared room;
 * price fields come from the page offer.
 *
 * @param options - Current pricing.options
 * @param room - Shared room being priced
 * @param fee - Price / originalPrice from Lodging & food
 */
export function upsertCoursePricingForRoom(
  options: CoursePricingOption[],
  room: RoomRecord,
  fee: PageRoomFee,
): CoursePricingOption[] {
  const catalog = roomCatalogFields(room);
  const index = options.findIndex((option) => option.roomId === room.id);
  if (index >= 0) {
    const next = [...options];
    next[index] = {
      ...next[index],
      ...catalog,
      roomId: room.id,
      price: fee.price,
      originalPrice: fee.originalPrice?.trim() ? fee.originalPrice : undefined,
    };
    return next;
  }
  return [
    ...options,
    {
      roomId: room.id,
      ...catalog,
      price: fee.price,
      originalPrice: fee.originalPrice?.trim() ? fee.originalPrice : undefined,
    },
  ];
}

/**
 * Upserts a retreat package linked to a shared room.
 *
 * @param packages - Current retreat packages
 * @param room - Shared room being priced
 * @param fee - Price / originalPrice from Lodging & food
 */
export function upsertRetreatPackageForRoom(
  packages: RetreatPackage[],
  room: RoomRecord,
  fee: PageRoomFee,
): RetreatPackage[] {
  const catalog = roomCatalogFields(room);
  const index = packages.findIndex((pkg) => pkg.roomId === room.id);
  if (index >= 0) {
    const next = [...packages];
    next[index] = {
      ...next[index],
      roomId: room.id,
      title: catalog.roomType,
      description: catalog.description,
      features: catalog.features,
      image: catalog.image,
      price: fee.price,
      originalPrice: fee.originalPrice?.trim() ? fee.originalPrice : undefined,
    };
    return next;
  }
  return [
    ...packages,
    {
      roomId: room.id,
      title: catalog.roomType,
      description: catalog.description,
      features: catalog.features,
      image: catalog.image,
      price: fee.price,
      originalPrice: fee.originalPrice?.trim() ? fee.originalPrice : undefined,
    },
  ];
}
