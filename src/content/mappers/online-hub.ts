import {
  mapVenueToHomeHero,
  resolveVenueHeroVideo,
} from "@/content/mappers/venue-home-hero";
import type {
  HomeHeroContent,
  HomeHeroVideoContent,
  HomeWelcomeContent,
} from "@/content/types/dedicated-pages";
import type {
  OverviewModule,
  PageMinimalHero,
} from "@/content/types/page-modules";
import {
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL,
} from "@/lib/cms/online-hub-defaults";

/**
 * Whether mapped hub hero has enough CMS fields to render.
 * Matches homepage hero visibility: copy, CTA, marquee, chips, or video/poster.
 *
 * @param hero - Mapped homepage-shaped hero
 */
export function onlineHubHeroHasData(hero: HomeHeroContent): boolean {
  const video = hero.video;
  return Boolean(
    hero.badge.trim() ||
      hero.titleLead.trim() ||
      hero.titleAccent.trim() ||
      hero.support?.trim() ||
      (hero.ctaLabel.trim() && hero.ctaHref.trim()) ||
      (hero.secondaryCtaLabel?.trim() && hero.secondaryCtaHref?.trim()) ||
      hero.marqueeItems.some((item) => item.trim()) ||
      hero.mobileTrust.some((chip) => chip.value.trim() || chip.label.trim()) ||
      video.mobileSrc.trim() ||
      video.desktopSrc.trim() ||
      video.mobilePoster.trim() ||
      video.desktopPoster.trim(),
  );
}

/**
 * Resolves hub hero video from this page's CMS only — never the homepage MP4.
 * Posters may use `heroImage` when a playable src exists; otherwise stay empty.
 *
 * @param hero - Online hub page-minimal hero module
 */
export function resolveOnlineHubHeroVideo(
  hero: PageMinimalHero,
): HomeHeroVideoContent {
  return resolveVenueHeroVideo(hero);
}

/**
 * Resolves the overview content video (YouTube/MP4) from the overview module.
 * Prefers an explicit video media item; falls back to the live-site default.
 *
 * @param overview - Online hub overview module
 */
export function resolveOnlineHubOverviewVideo(overview: OverviewModule): {
  url: string;
  poster: string;
  title: string;
} {
  const videoItem =
    overview.media.items.find(
      (item) => item.type === "video" && item.url.trim(),
    ) ??
    (overview.media.mode === "video"
      ? overview.media.items.find((item) => item.url.trim())
      : undefined);
  const url = videoItem?.url?.trim() || DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL;
  return {
    url,
    poster:
      videoItem?.poster?.trim() || DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
    title:
      videoItem?.title?.trim() ||
      "Online yoga teacher training at Nirvana Yoga School",
  };
}

const DEFAULT_OVERVIEW_VISION = {
  label: "Learn anywhere",
  body: "Self-paced lessons, manuals, and weekly live Q&A — practice from home while staying connected to Rishikesh teachers.",
} as const;

const DEFAULT_OVERVIEW_PROMISE = {
  label: "Globally recognized",
  body: "Yoga Alliance certification that supports teaching opportunities worldwide, with the same credibility as our residential programs.",
} as const;

const DEFAULT_OVERVIEW_HIGHLIGHTS = [
  "Yoga Alliance certified",
  "Lifetime course access",
  "Weekly live Q&A",
  "Beginner to advanced paths",
] as const;

/**
 * Maps online hub overview modules onto the homepage {@link HomeWelcomeContent}
 * shape used by the YTT hub overview (video replaces the image collage).
 *
 * @param overview - Online hub overview module
 */
export function mapOnlineHubToHomeWelcome(
  overview: OverviewModule,
): HomeWelcomeContent {
  const video = resolveOnlineHubOverviewVideo(overview);
  const rotatingStats =
    overview.rotatingStats?.filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    ) ??
    overview.glance
      .filter((item) => item.value.trim() || item.label.trim())
      .map((item) => ({ value: item.value, label: item.label }));

  const highlights = (overview.highlights ?? []).filter((item) => item.trim());
  const visionLabel = overview.vision?.label?.trim() || "";
  const visionBody = overview.vision?.body?.trim() || "";
  const promiseLabel = overview.promise?.label?.trim() || "";
  const promiseBody =
    overview.promise?.body?.trim() || overview.supportingCopy?.trim() || "";

  return {
    _id: overview._id,
    sectionFallbackId: "about",
    eyebrow: overview.eyebrow?.trim() || "Overview",
    title: overview.title?.trim() || "Online yoga courses",
    lead: overview.lead?.trim() || "",
    highlights:
      highlights.length > 0 ? highlights : [...DEFAULT_OVERVIEW_HIGHLIGHTS],
    rotatingStats,
    ctaLabel: overview.ctaLabel?.trim() || "Browse courses",
    ctaHref: overview.ctaHref?.trim() || "#courses",
    images: [],
    video: {
      url: video.url,
      poster: video.poster,
      title: video.title,
    },
    vision: {
      label: visionLabel || DEFAULT_OVERVIEW_VISION.label,
      body: visionBody || DEFAULT_OVERVIEW_VISION.body,
    },
    promise: {
      label: promiseLabel || DEFAULT_OVERVIEW_PROMISE.label,
      body: promiseBody || DEFAULT_OVERVIEW_PROMISE.body,
    },
  };
}

/**
 * Maps online hub CMS hero fields onto the homepage {@link HomeHeroContent} shape.
 * Copy and CTAs stay empty unless the CMS provides them — no invented defaults.
 *
 * @param hero - Online hub `page-minimal` hero module
 */
export function mapOnlineHubToHomeHero(hero: PageMinimalHero): HomeHeroContent {
  return mapVenueToHomeHero(hero);
}
