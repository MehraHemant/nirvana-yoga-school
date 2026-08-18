import { cmsImageUrl } from "@/content/types/cms-image";
import type {
  HeroModule,
  SimpleBannerHero,
} from "@/content/types/page-modules";

/**
 * Converts any hero variant into a venue-friendly simple-banner.
 * Venue pages use DarkMediaHero (one background image + copy), not course bento.
 *
 * @param hero - Existing hero module (any type)
 * @param fallbackImage - Image used when the hero has no media
 */
export function normalizeVenueHero(
  hero: HeroModule | null | undefined,
  fallbackImage = "",
): SimpleBannerHero {
  const title =
    hero && "title" in hero && hero.title.trim() ? hero.title : "Venue";
  const subtitle =
    hero && "subtitle" in hero && typeof hero.subtitle === "string"
      ? hero.subtitle
      : undefined;

  let backgroundImage = fallbackImage;
  let eyebrow = "Venue";
  let ctaLabel: string | undefined;
  let ctaHref: string | undefined;

  if (!hero) {
    return {
      type: "simple-banner",
      live: true,
      eyebrow,
      title,
      subtitle,
      backgroundImage,
    };
  }

  if (hero.type === "simple-banner") {
    backgroundImage = hero.backgroundImage || fallbackImage;
    eyebrow = hero.eyebrow?.trim() || eyebrow;
    ctaLabel = hero.ctaLabel;
    ctaHref = hero.ctaHref;
  } else if (hero.type === "page-minimal") {
    backgroundImage = hero.heroImage || fallbackImage;
    eyebrow = hero.eyebrow?.trim() || eyebrow;
    ctaLabel = hero.ctaLabel;
    ctaHref = hero.ctaHref;
  } else if (hero.type === "bento-media") {
    const first = hero.heroImages?.[0];
    backgroundImage = (first ? cmsImageUrl(first) : "") || fallbackImage;
  } else if (hero.type === "split-copy") {
    backgroundImage = hero.previewUrl || fallbackImage;
    eyebrow = hero.eyebrow?.trim() || eyebrow;
    ctaLabel = hero.ctaPrimary;
    ctaHref = hero.ctaPrimaryHref;
  }

  return {
    type: "simple-banner",
    live: hero.live,
    _id: hero._id,
    eyebrow,
    title,
    subtitle,
    backgroundImage,
    ctaLabel,
    ctaHref,
  };
}
