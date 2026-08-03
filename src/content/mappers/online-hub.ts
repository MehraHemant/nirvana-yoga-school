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
  DEFAULT_ONLINE_HUB_HERO_VIDEO,
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL,
} from "@/lib/cms/online-hub-defaults";

/** Prior seed copy — upgraded in presentation only when still exact-match. */
const LEGACY_HERO_COPY = {
  eyebrow: "Online Yoga Teacher Training",
  titleLead: "Online yoga teacher",
  titleAccent: "training courses",
  subtitle: "Learn anytime, anywhere with teachers of Rishikesh",
  ctaLabel: "Enquire now",
  ctaHref: "/enquire-now",
} as const;

const PRESENTATION_DEFAULTS = {
  badge: "Online · Yoga Alliance certified",
  titleLead: "Nirvana online yoga",
  titleAccent: "teacher training",
  support:
    "Self-paced courses from Rishikesh teachers — lifetime access and weekly live Q&A.",
  ctaLabel: "Browse courses",
  ctaHref: "#courses",
} as const;

/**
 * True when the hero has a playable MP4 source.
 *
 * @param video - Resolved hero video fields
 */
function hasPlayableHeroVideo(video: HomeHeroVideoContent): boolean {
  return Boolean(video.mobileSrc?.trim() || video.desktopSrc?.trim());
}

/**
 * Returns presentation copy, replacing exact legacy seed strings with tighter defaults.
 *
 * @param value - CMS string
 * @param legacy - Prior default to treat as unset
 * @param next - Replacement presentation default
 */
function upgradeLegacyCopy(
  value: string | undefined,
  legacy: string,
  next: string,
): string {
  const trimmed = value?.trim() || "";
  if (!trimmed || trimmed === legacy) return next;
  return trimmed;
}

/**
 * Splits a single title into lead + accent when CMS accent is unset.
 * Uses the last two words as the accent phrase when possible.
 *
 * @param title - Full hero title from CMS
 */
function splitTitleLeadAccent(title: string): {
  titleLead: string;
  titleAccent: string;
} {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { titleLead: "", titleAccent: "" };
  if (words.length === 1) return { titleLead: words[0] ?? "", titleAccent: "" };
  if (words.length === 2) {
    return { titleLead: words[0] ?? "", titleAccent: words[1] ?? "" };
  }
  return {
    titleLead: words.slice(0, -2).join(" "),
    titleAccent: words.slice(-2).join(" "),
  };
}

/**
 * True when a CTA already points at the courses band.
 *
 * @param label - CTA label
 * @param href - CTA href
 */
function isCoursesCta(label: string, href: string): boolean {
  return (
    href.includes("#courses") || /browse|view courses|see courses/i.test(label)
  );
}

/**
 * True when a CTA is an enquire / contact action.
 *
 * @param label - CTA label
 * @param href - CTA href
 */
function isEnquireCta(label: string, href: string): boolean {
  return /enquire|enquir|contact/i.test(label) || href.includes("enquire");
}

/**
 * Resolves hub hero video sources; posters fall back to the still image.
 *
 * @param hero - Online hub page-minimal hero module
 */
export function resolveOnlineHubHeroVideo(
  hero: PageMinimalHero,
): HomeHeroVideoContent {
  const stored = hero.heroVideo;
  const fromCms: HomeHeroVideoContent = {
    mobileSrc: stored?.mobileSrc?.trim() || "",
    desktopSrc: stored?.desktopSrc?.trim() || "",
    mobilePoster: stored?.mobilePoster?.trim() || "",
    desktopPoster: stored?.desktopPoster?.trim() || "",
  };
  // Seeded hub pages may omit heroVideo — match the homepage MP4 sources.
  const video = hasPlayableHeroVideo(fromCms)
    ? fromCms
    : { ...DEFAULT_ONLINE_HUB_HERO_VIDEO };
  const posterFallback = hero.heroImage?.trim() || "";
  return {
    mobileSrc: video.mobileSrc?.trim() || "",
    desktopSrc: video.desktopSrc?.trim() || "",
    mobilePoster: video.mobilePoster?.trim() || posterFallback,
    desktopPoster: video.desktopPoster?.trim() || posterFallback,
  };
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
 * Adds a complementary secondary CTA (browse ↔ enquire) when only one is set.
 *
 * @param hero - Online hub `page-minimal` hero module
 */
export function mapOnlineHubToHomeHero(hero: PageMinimalHero): HomeHeroContent {
  const split = splitTitleLeadAccent(hero.title);
  const titleLead = upgradeLegacyCopy(
    hero.titleLead?.trim() || split.titleLead,
    LEGACY_HERO_COPY.titleLead,
    PRESENTATION_DEFAULTS.titleLead,
  );
  const titleAccent = upgradeLegacyCopy(
    hero.titleAccent?.trim() || split.titleAccent,
    LEGACY_HERO_COPY.titleAccent,
    PRESENTATION_DEFAULTS.titleAccent,
  );
  const support = upgradeLegacyCopy(
    hero.subtitle?.trim() || hero.description?.trim(),
    LEGACY_HERO_COPY.subtitle,
    PRESENTATION_DEFAULTS.support,
  );
  const rawCtaLabel = hero.ctaLabel?.trim() || "";
  const rawCtaHref = hero.ctaHref?.trim() || "";
  const isLegacyEnquirePair =
    (!rawCtaLabel || rawCtaLabel === LEGACY_HERO_COPY.ctaLabel) &&
    (!rawCtaHref || rawCtaHref === LEGACY_HERO_COPY.ctaHref);
  // Seeded enquire-only CTA → Browse primary; custom CMS CTAs stay untouched.
  const ctaLabel = isLegacyEnquirePair
    ? PRESENTATION_DEFAULTS.ctaLabel
    : rawCtaLabel || PRESENTATION_DEFAULTS.ctaLabel;
  const ctaHref = isLegacyEnquirePair
    ? PRESENTATION_DEFAULTS.ctaHref
    : rawCtaHref || PRESENTATION_DEFAULTS.ctaHref;

  let secondaryCtaLabel: string | undefined;
  let secondaryCtaHref: string | undefined;
  if (isCoursesCta(ctaLabel, ctaHref)) {
    secondaryCtaLabel = "Enquire now";
    secondaryCtaHref = "/enquire-now";
  } else if (isEnquireCta(ctaLabel, ctaHref)) {
    secondaryCtaLabel = "Browse courses";
    secondaryCtaHref = "#courses";
  }

  return {
    _id: hero._id,
    badge: upgradeLegacyCopy(
      hero.eyebrow,
      LEGACY_HERO_COPY.eyebrow,
      PRESENTATION_DEFAULTS.badge,
    ),
    titleLead,
    titleAccent,
    support,
    ctaLabel,
    ctaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    marqueeItems: hero.marqueeItems?.filter((item) => item.trim()) ?? [],
    mobileTrust: (hero.mobileTrust ?? []).filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    ),
    video: resolveOnlineHubHeroVideo(hero),
  };
}
