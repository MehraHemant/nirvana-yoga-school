import type { ResidentialLifeContent } from "@/content/types/shared-sections";

/**
 * Whether a page lodging document has overrides worth persisting
 * (extras, per-room Live allowlist, or explicit Live toggles).
 *
 * @param content - Residential life / page lodging document
 */
export function hasResidentialLifeContent(
  content: ResidentialLifeContent | null | undefined,
): boolean {
  if (!content) return false;
  const extraRooms =
    content.accommodation?.extraRooms?.length ??
    content.accommodation?.galleries?.length ??
    0;
  const extraPoints = content.food?.extraPoints?.length ?? 0;
  const extraGallery = content.food?.extraGallery?.length ?? 0;
  const legacyFoodGallery = content.food?.gallery?.length ?? 0;
  const legacyFoodPoints = content.food?.content?.points?.length ?? 0;
  const legacyFoodTitle = content.food?.content?.title?.trim() ?? "";
  const hasRoomAllowlist = Array.isArray(content.accommodation?.roomIds);
  const hasExtras =
    extraRooms > 0 ||
    extraPoints > 0 ||
    extraGallery > 0 ||
    legacyFoodGallery > 0 ||
    legacyFoodPoints > 0 ||
    Boolean(legacyFoodTitle) ||
    hasRoomAllowlist;
  // Page docs with only Live toggles still count so admin can hide sections.
  const hasLiveOverrides =
    content.accommodation?.live === false || content.food?.live === false;
  return hasExtras || hasLiveOverrides || content.live === false;
}

/**
 * Whether a shared room is Live on this page.
 * Omitted `roomIds` means all catalog rooms are Live (legacy).
 *
 * @param roomId - Shared room id
 * @param roomIds - Page allowlist, or undefined for all
 */
export function isPageRoomLive(
  roomId: string,
  roomIds: string[] | undefined,
): boolean {
  if (roomIds === undefined) return true;
  return roomIds.includes(roomId);
}

/**
 * Builds the next page `roomIds` allowlist after toggling one room Live.
 *
 * @param roomIds - Current allowlist (undefined = all live)
 * @param catalogRoomIds - All shared room ids for this catalog
 * @param roomId - Room being toggled
 * @param live - Next Live state for that room
 */
export function setPageRoomLive(
  roomIds: string[] | undefined,
  catalogRoomIds: string[],
  roomId: string,
  live: boolean,
): string[] {
  const current = roomIds === undefined ? [...catalogRoomIds] : [...roomIds];
  if (live) {
    return current.includes(roomId) ? current : [...current, roomId];
  }
  return current.filter((id) => id !== roomId);
}

/**
 * Filters items linked to shared rooms by the page lodging Live allowlist.
 * Used for accommodation display only — do not use for admin/public Pricing.
 * Custom rows without `roomId` always remain.
 *
 * @param items - Rows that may carry a shared room id
 * @param roomIds - Page allowlist; undefined keeps all items
 */
export function filterItemsByPageRoomIds<T extends { roomId?: string }>(
  items: T[],
  roomIds: string[] | undefined,
): T[] {
  if (roomIds === undefined) return items;
  const allowed = new Set(roomIds);
  return items.filter((item) => !item.roomId || allowed.has(item.roomId));
}

/**
 * Public fee table rows: keeps entries with a non-empty price.
 * Not gated by per-page lodging Live.
 *
 * @param items - Pricing options or retreat packages
 */
export function filterItemsWithPrice<T extends { price?: string }>(
  items: T[],
): T[] {
  return items.filter((item) => Boolean(item.price?.trim()));
}
