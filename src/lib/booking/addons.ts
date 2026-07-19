import type {
  BookingAddon,
  BookingAddonsContent,
  BookingType,
} from "@/content/types/booking";

/**
 * Active add-ons available for a booking type.
 *
 * @param type - Course or retreat booking
 * @param doc - Add-ons CMS document
 */
export function filterBookingAddonsForType(
  type: BookingType,
  doc: BookingAddonsContent | null | undefined,
): BookingAddon[] {
  if (!doc || doc.live === false) return [];
  return (doc.items ?? []).filter((item) => {
    if (item.active === false) return false;
    if (!item.appliesTo?.length) return true;
    return item.appliesTo.includes(type);
  });
}
