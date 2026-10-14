import { cmsImageUrl } from "@/content/types/cms-image";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";
import type { HeroModule, PageMinimalHero } from "@/content/types/page-modules";

const EMPTY_HERO_VIDEO: HomeHeroVideoContent = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

/**
 * Empty page-minimal venue hero — no invented title, CTA, or media.
 *
 * @param live - Optional live flag copied from the source hero
 * @param id - Optional section HTML id
 */
function emptyPageMinimalHero(live?: boolean, id?: string): PageMinimalHero {
  return {
    type: "page-minimal",
    live,
    _id: id,
    title: "",
    heroImage: "",
    heroVideo: { ...EMPTY_HERO_VIDEO },
  };
}

/**
 * Coerces any hero variant into a venue page-minimal hero with video fields.
 * Preserves existing CMS copy and media; does not invent titles, CTAs, or URLs.
 *
 * @param hero - Existing hero module (any type)
 */
export function normalizeVenueHero(
  hero: HeroModule | null | undefined,
): PageMinimalHero {
  if (!hero) return emptyPageMinimalHero();

  if (hero.type === "page-minimal") {
    return {
      ...hero,
      type: "page-minimal",
      title: hero.title ?? "",
      heroImage: hero.heroImage ?? "",
      heroVideo: {
        mobileSrc: hero.heroVideo?.mobileSrc ?? "",
        mobilePoster: hero.heroVideo?.mobilePoster ?? "",
        desktopSrc: hero.heroVideo?.desktopSrc ?? "",
        desktopPoster: hero.heroVideo?.desktopPoster ?? "",
      },
    };
  }

  if (hero.type === "simple-banner") {
    return {
      type: "page-minimal",
      live: hero.live,
      _id: hero._id,
      eyebrow: hero.eyebrow,
      title: hero.title ?? "",
      subtitle: hero.subtitle,
      heroImage: hero.backgroundImage ?? "",
      ctaLabel: hero.ctaLabel,
      ctaHref: hero.ctaHref,
      heroVideo: { ...EMPTY_HERO_VIDEO },
    };
  }

  if (hero.type === "split-copy") {
    return {
      type: "page-minimal",
      live: hero.live,
      _id: hero._id,
      eyebrow: hero.eyebrow,
      title: hero.title ?? "",
      subtitle: hero.subtitle,
      heroImage: hero.previewUrl ?? "",
      ctaLabel: hero.ctaPrimary,
      ctaHref: hero.ctaPrimaryHref,
      heroVideo: { ...EMPTY_HERO_VIDEO },
    };
  }

  const first = hero.heroImages?.[0];
  return {
    type: "page-minimal",
    live: hero.live,
    _id: hero._id,
    title: hero.title ?? "",
    subtitle: hero.subtitle,
    heroImage: first ? cmsImageUrl(first) : "",
    heroVideo: { ...EMPTY_HERO_VIDEO },
  };
}
