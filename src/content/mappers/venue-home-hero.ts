import type {
  HomeHeroContent,
  HomeHeroVideoContent,
} from "@/content/types/dedicated-pages";
import type { PageMinimalHero } from "@/content/types/page-modules";

const EMPTY_HERO_VIDEO: HomeHeroVideoContent = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

/**
 * True when the venue hero has a playable MP4 source.
 * Posters or still images alone are not enough.
 *
 * @param video - Resolved hero video fields
 */
export function venueHeroHasPlayableVideo(
  video: HomeHeroVideoContent,
): boolean {
  return Boolean(video.mobileSrc.trim() || video.desktopSrc.trim());
}

/**
 * True when a retreat-venue still hero has CMS title, copy, or image.
 *
 * @param hero - Normalized venue hero
 */
export function venueHeroHasStillContent(hero: PageMinimalHero): boolean {
  return Boolean(
    hero.title?.trim() ||
      hero.subtitle?.trim() ||
      hero.description?.trim() ||
      hero.heroImage?.trim(),
  );
}

/**
 * Resolves venue hero video from CMS only — never the homepage MP4.
 * Posters may use `heroImage` when a playable src exists; otherwise stay empty.
 *
 * @param hero - Venue page-minimal hero module
 */
export function resolveVenueHeroVideo(
  hero: PageMinimalHero,
): HomeHeroVideoContent {
  const stored = hero.heroVideo;
  const fromCms: HomeHeroVideoContent = {
    mobileSrc: stored?.mobileSrc?.trim() || "",
    desktopSrc: stored?.desktopSrc?.trim() || "",
    mobilePoster: stored?.mobilePoster?.trim() || "",
    desktopPoster: stored?.desktopPoster?.trim() || "",
  };
  const posterFallback = venueHeroHasPlayableVideo(fromCms)
    ? hero.heroImage?.trim() || ""
    : "";
  return {
    mobileSrc: fromCms.mobileSrc,
    desktopSrc: fromCms.desktopSrc,
    mobilePoster: fromCms.mobilePoster || posterFallback,
    desktopPoster: fromCms.desktopPoster || posterFallback,
  };
}

/**
 * Maps venue CMS hero fields onto the homepage {@link HomeHeroContent} shape.
 * Copy and CTAs stay empty unless the CMS provides them — no invented defaults.
 *
 * @param hero - Venue `page-minimal` hero module
 */
export function mapVenueToHomeHero(hero: PageMinimalHero): HomeHeroContent {
  return {
    _id: hero._id,
    badge: hero.eyebrow?.trim() || "",
    titleLead: hero.titleLead?.trim() || hero.title?.trim() || "",
    titleAccent: hero.titleAccent?.trim() || "",
    support: hero.subtitle?.trim() || hero.description?.trim() || "",
    ctaLabel: hero.ctaLabel?.trim() || "",
    ctaHref: hero.ctaHref?.trim() || "",
    marqueeItems: hero.marqueeItems?.filter((item) => item.trim()) ?? [],
    mobileTrust: (hero.mobileTrust ?? []).filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    ),
    video: resolveVenueHeroVideo(hero),
  };
}
