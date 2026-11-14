import { unstable_cache } from "next/cache";
import {
  normalizeOfferPopup,
  OFFER_POPUP_KEY,
  type OfferPopupContent,
} from "@/content/types/offer-popup";
import { db } from "@/lib/db";

/**
 * Cached read of `global_settings.offerPopup`.
 * Uses the shared `global-settings:offerPopup` tag, so admin saves invalidate
 * it immediately; the short revalidate also picks up direct DB edits (seed
 * scripts) within a few minutes, since the offer is time-sensitive.
 */
const loadOfferPopup = unstable_cache(
  async () => {
    const record = await db.globalSettings.findUnique({
      where: { key: OFFER_POPUP_KEY },
    });
    return record?.value ?? null;
  },
  ["offer-popup-v2"],
  { tags: [`global-settings:${OFFER_POPUP_KEY}`], revalidate: 300 },
);

/**
 * Site-wide offer popup (hidden on failure).
 */
export async function getOfferPopup(): Promise<OfferPopupContent> {
  const value = await loadOfferPopup().catch(() => null);
  return normalizeOfferPopup(value);
}
