import type { SiteConfig } from "@/content/types/global-settings";

/** Public contact email used when `siteConfig` has none. */
export const FALLBACK_CONTACT_EMAIL = "hello@nirvanayogaschoolindia.com";

/** WhatsApp number used when `siteConfig` has none (digits, country code). */
export const FALLBACK_WHATSAPP_NUMBER = "918218564835";

/** Address shown when `siteConfig` has none. */
export const FALLBACK_ADDRESS = "Upper Tapovan, Rishikesh · Uttarakhand, India";

/**
 * Public contact email from CMS site config, or the bundled fallback.
 *
 * @param siteConfig - CMS site config, when loaded
 */
export function resolveContactEmail(siteConfig?: SiteConfig | null): string {
  return siteConfig?.contactEmail?.trim() || FALLBACK_CONTACT_EMAIL;
}

/**
 * WhatsApp number as digits from CMS site config, or the bundled fallback.
 *
 * @param siteConfig - CMS site config, when loaded
 */
export function resolveWhatsAppNumber(siteConfig?: SiteConfig | null): string {
  const digits = siteConfig?.whatsappNumber?.replace(/\D/g, "");
  return digits || FALLBACK_WHATSAPP_NUMBER;
}

/**
 * Public address from CMS site config, or the bundled fallback.
 *
 * @param siteConfig - CMS site config, when loaded
 */
export function resolveAddress(siteConfig?: SiteConfig | null): string {
  return siteConfig?.address?.trim() || FALLBACK_ADDRESS;
}

/**
 * Builds a `wa.me` link for the resolved WhatsApp number.
 *
 * @param siteConfig - CMS site config, when loaded
 * @param text - Optional pre-filled message
 */
export function whatsAppLink(
  siteConfig?: SiteConfig | null,
  text?: string,
): string {
  const number = resolveWhatsAppNumber(siteConfig);
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Builds a Google Maps search link for the resolved address.
 *
 * @param siteConfig - CMS site config, when loaded
 */
export function mapsLink(siteConfig?: SiteConfig | null): string {
  return `https://maps.google.com/?q=${encodeURIComponent(resolveAddress(siteConfig))}`;
}
