/** Site-wide promotional popup stored in `global_settings.offerPopup`. */

export type OfferPopupFrequency = "session" | "day" | "week";

export type OfferPopupCta = {
  label: string;
  href: string;
};

export type OfferPopupContent = {
  /** When false the popup never shows. */
  live: boolean;
  eyebrow: string;
  title: string;
  /** Short discount for the image badge, e.g. "25%" (empty hides the badge). */
  discountLabel: string;
  description: string;
  /**
   * Last day of the offer as `YYYY-MM-DD` (ends 23:59:59 India time).
   * Drives the countdown; the popup hides once it has passed. Empty = no end.
   */
  deadline: string;
  perks: string[];
  primaryCta: OfferPopupCta;
  secondaryCta: OfferPopupCta;
  image: string;
  imageAlt: string;
  /** Seconds after page load before the popup opens. */
  delaySeconds: number;
  /** How long a dismissal is remembered. */
  frequency: OfferPopupFrequency;
};

/** `global_settings` key. */
export const OFFER_POPUP_KEY = "offerPopup";

/** Empty (hidden) popup document. */
export function createEmptyOfferPopup(): OfferPopupContent {
  return {
    live: false,
    eyebrow: "",
    title: "",
    discountLabel: "",
    description: "",
    deadline: "",
    perks: [],
    primaryCta: { label: "", href: "" },
    secondaryCta: { label: "", href: "" },
    image: "",
    imageAlt: "",
    delaySeconds: 5,
    frequency: "session",
  };
}

/**
 * Merges stored JSON with defaults.
 *
 * @param value - Raw `global_settings.value`
 */
export function normalizeOfferPopup(value: unknown): OfferPopupContent {
  const base = createEmptyOfferPopup();
  if (!value || typeof value !== "object") return base;
  const raw = value as Partial<OfferPopupContent>;
  const delay = Number(raw.delaySeconds);
  return {
    ...base,
    ...raw,
    live: raw.live === true,
    perks: Array.isArray(raw.perks) ? raw.perks.filter(Boolean) : [],
    primaryCta: { ...base.primaryCta, ...raw.primaryCta },
    secondaryCta: { ...base.secondaryCta, ...raw.secondaryCta },
    delaySeconds: Number.isFinite(delay) ? Math.min(60, Math.max(0, delay)) : 5,
    frequency:
      raw.frequency === "day" || raw.frequency === "week"
        ? raw.frequency
        : "session",
  };
}

/**
 * End of the deadline day in India time (UTC+05:30), or null when unset/invalid.
 *
 * @param deadline - `YYYY-MM-DD`
 */
export function offerDeadlineMs(deadline: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return null;
  const ms = Date.parse(`${deadline}T23:59:59+05:30`);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Human date for the deadline, e.g. "20 Nov 2026".
 *
 * @param deadline - `YYYY-MM-DD`
 */
export function formatOfferDeadline(deadline: string): string {
  const ms = offerDeadlineMs(deadline);
  if (ms === null) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(ms);
}

/**
 * Stable signature of the offer — dismissals are remembered per signature, so
 * publishing a new offer shows it again to people who closed the old one.
 *
 * @param content - Popup document
 */
export function offerSignature(content: OfferPopupContent): string {
  const source = [
    content.title,
    content.discountLabel,
    content.deadline,
    content.description,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}
