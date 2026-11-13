/**
 * Site-wide SEO constants and URL helpers shared by metadata, JSON-LD,
 * sitemap, robots, and llms.txt.
 */

/** Canonical production origin (no trailing slash). */
export const SITE_URL = "https://www.nirvanayogaschoolindia.com";

/** Brand name used in titles, Open Graph, and structured data. */
export const SITE_NAME = "Nirvana Yoga School";

/** Square-ish brand logo for structured data (Organization.logo). */
export const SITE_LOGO_URL =
  "https://res.cloudinary.com/dyccxskji/image/upload/v1787811879/nirvana-cms/logo-1787811876594.png";

/** Physical school address used in Organization / LocalBusiness JSON-LD. */
export const SITE_ADDRESS = {
  streetAddress: "Upper Tapovan",
  addressLocality: "Rishikesh",
  addressRegion: "Uttarakhand",
  postalCode: "249192",
  addressCountry: "IN",
} as const;

/** Open Graph image size every social image is cropped to. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Absolute URL for a site path.
 *
 * @param path - Path starting with `/` (or an already absolute URL)
 * @param base - Origin to resolve against (defaults to {@link SITE_URL})
 */
export function absoluteUrl(path: string, base: string = SITE_URL): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = base.replace(/\/+$/, "");
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Social share image URL. Cloudinary uploads are cropped to 1200×630 and
 * delivered as JPG — WhatsApp, LinkedIn, and some Facebook surfaces skip
 * WebP/AVIF previews. Other URLs are returned unchanged.
 *
 * @param src - Original image URL
 */
export function socialImageUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  const marker = "/image/upload/";
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return trimmed;
  const insertAt = idx + marker.length;
  const after = trimmed.slice(insertAt);
  // Leave URLs that already carry a transformation alone.
  if (/^(c_|w_|h_|f_|q_|g_|ar_|fl_)/.test(after)) return trimmed;
  const transform = `c_fill,g_auto,w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT},f_jpg,q_auto`;
  return `${trimmed.slice(0, insertAt)}${transform}/${after}`;
}

/** Whether a social image URL is known to be cropped to 1200×630. */
export function isSizedSocialImage(url: string): boolean {
  return url.includes(`w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT}`);
}

/**
 * Plain text from HTML (for meta descriptions derived from body copy).
 *
 * @param html - HTML string
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trims text to a meta-description length at a word boundary.
 *
 * @param text - Source text
 * @param max - Max characters (default 158)
 */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-–—\s]+$/, "")}…`;
}

/**
 * Numeric price from a CMS fee label ("From 899 USD", "$39 USD", "649 USD").
 *
 * @param fee - Fee label
 */
export function parsePrice(
  fee: string | null | undefined,
): { price: string; currency: string } | null {
  if (!fee) return null;
  const match = fee.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const currency = /inr|₹|rs\.?/i.test(fee)
    ? "INR"
    : /eur|€/i.test(fee)
      ? "EUR"
      : "USD";
  return { price: match[1], currency };
}

/**
 * ISO-8601 duration from a CMS label ("25 Days" → "P25D", "3 Weeks" → "P3W").
 *
 * @param label - Duration label
 */
export function isoDuration(label: string | null | undefined): string | null {
  if (!label) return null;
  const m = label.match(/(\d+)\s*(day|week|month|hour)/i);
  if (!m) return null;
  const unit = m[2].toLowerCase();
  if (unit === "hour") return `PT${m[1]}H`;
  return `P${m[1]}${unit === "day" ? "D" : unit === "week" ? "W" : "M"}`;
}
