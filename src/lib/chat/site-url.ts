/** Fallback public origin when env / site-config URL is unset. */
const FALLBACK_SITE_ORIGIN = "https://www.nirvanayogaschoolindia.com";

/**
 * Resolve the public site origin for absolute chat links.
 * Prefers the current request origin, then `NEXT_PUBLIC_SITE_URL`, then
 * `SITE_URL`, then the production fallback.
 *
 * @param requestOrigin - Origin from the incoming chat API request
 */
export function getChatSiteOrigin(requestOrigin?: string): string {
  const raw =
    requestOrigin?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    FALLBACK_SITE_ORIGIN;
  return raw.replace(/\/$/, "");
}

/**
 * Turn a site-relative path into an absolute public URL.
 *
 * @param path - Relative path (e.g. `/200-hour-ytt`) or absolute URL
 * @param siteOrigin - Optional origin override (request base URL)
 */
export function toPublicUrl(
  path: string | undefined,
  siteOrigin?: string,
): string | undefined {
  if (!path) return undefined;
  const trimmed = path.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getChatSiteOrigin(siteOrigin)}${normalized}`;
}
