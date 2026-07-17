/**
 * Shared interactive image shape for CMS-managed course / page media.
 */

export type ImageClickAction = "fullscreen" | "redirect" | "none";

export type CmsInteractiveImage = {
  /** Image URL */
  url: string;
  /** Accessible alt text shown to assistive tech */
  alt?: string;
  /**
   * Click behaviour:
   * - `fullscreen` — open lightbox (default)
   * - `redirect` — open `redirectUrl` in a new tab
   * - `none` — not clickable
   */
  clickAction?: ImageClickAction;
  /** Destination when `clickAction` is `redirect` */
  redirectUrl?: string;
};

/**
 * Normalizes a legacy URL string or rich image object into a full meta shape.
 *
 * @param input - URL string or interactive image object
 * @returns Normalized interactive image (defaults click to fullscreen)
 */
export function normalizeCmsImage(
  input: string | CmsInteractiveImage,
): CmsInteractiveImage {
  if (typeof input === "string") {
    return { url: input, alt: "", clickAction: "fullscreen" };
  }
  return {
    url: input.url ?? "",
    alt: input.alt ?? "",
    clickAction: input.clickAction ?? "fullscreen",
    redirectUrl: input.redirectUrl ?? "",
  };
}

/**
 * Extracts the URL from a string or interactive image.
 *
 * @param input - URL string or interactive image
 * @returns Image URL
 */
export function cmsImageUrl(input: string | CmsInteractiveImage): string {
  return typeof input === "string" ? input : (input.url ?? "");
}

/**
 * Resolves display alt text with sensible fallbacks.
 *
 * @param image - Interactive image
 * @param fallback - Fallback when alt is empty
 * @returns Alt string (never empty if fallback provided)
 */
export function cmsImageAlt(image: CmsInteractiveImage, fallback = ""): string {
  const alt = image.alt?.trim();
  if (alt) return alt;
  return fallback;
}

/**
 * Runs the configured click action for an interactive image.
 *
 * @param image - Image with click settings
 * @param openFullscreen - Callback used for the fullscreen action
 */
export function handleCmsImageClick(
  image: CmsInteractiveImage,
  openFullscreen: () => void,
): void {
  const action = image.clickAction ?? "fullscreen";
  if (action === "none") return;
  if (action === "redirect") {
    const href = image.redirectUrl?.trim();
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  openFullscreen();
}

/**
 * Cursor / interaction class for an image based on click action.
 *
 * @param action - Configured click action
 * @returns Tailwind cursor utility class
 */
export function cmsImageCursorClass(
  action: ImageClickAction = "fullscreen",
): string {
  if (action === "none") return "cursor-default";
  if (action === "redirect") return "cursor-pointer";
  return "cursor-zoom-in";
}
