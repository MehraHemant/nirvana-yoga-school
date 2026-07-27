import type {
  HomeHeroContent,
  HomeHeroVideoContent,
  HomeWelcomeContent,
} from "@/content/types/dedicated-pages";
import type {
  YttHubContent,
  YttHubNavItem,
} from "@/content/types/shared-sections";

const EMPTY_HERO_VIDEO: HomeHeroVideoContent = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

/** Sticky jump-nav order matching the public YTT hub section layout. */
export const DEFAULT_YTT_HUB_NAV: YttHubNavItem[] = [
  { id: "#about", label: "Overview", shortLabel: "Overview" },
  { id: "#video", label: "Videos", shortLabel: "Videos" },
  { id: "#gallery", label: "Gallery", shortLabel: "Gallery" },
  { id: "#exam", label: "Certification", shortLabel: "Cert" },
  { id: "#courses", label: "Courses", shortLabel: "Courses" },
  { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why Nirvana" },
  { id: "#teachers", label: "Teachers", shortLabel: "Teachers" },
  { id: "#location", label: "Map", shortLabel: "Map" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

/**
 * Resolves hub hero video sources without falling back to homepage video files.
 * Posters may fall back to the hub still image when video posters are unset.
 *
 * @param hub - YTT hub CMS document
 */
export function resolveYttHubHeroVideo(
  hub: YttHubContent,
): HomeHeroVideoContent {
  const video = hub.heroVideo ?? EMPTY_HERO_VIDEO;
  const posterFallback = hub.heroImage?.trim() || "";
  return {
    mobileSrc: video.mobileSrc?.trim() || "",
    desktopSrc: video.desktopSrc?.trim() || "",
    mobilePoster: video.mobilePoster?.trim() || posterFallback,
    desktopPoster: video.desktopPoster?.trim() || posterFallback,
  };
}

/**
 * Maps hub CMS fields onto the homepage {@link HomeHeroContent} shape.
 *
 * @param hub - YTT hub CMS document
 */
export function mapYttHubToHomeHero(hub: YttHubContent): HomeHeroContent {
  const intro = hub.intro;
  const titleLead = intro.titleLead?.trim() || intro.title;
  const titleAccent = intro.titleAccent?.trim() || "";
  return {
    _id: hub.sectionIds?.hero,
    badge: intro.pill,
    titleLead,
    titleAccent,
    ctaLabel: intro.primaryCtaLabel?.trim() || "View Courses",
    ctaHref: intro.primaryCtaHref?.trim() || "#courses",
    marqueeItems: intro.marqueeItems?.filter((item) => item.trim()) ?? [],
    mobileTrust: intro.stats.filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    ),
    video: resolveYttHubHeroVideo(hub),
  };
}

/**
 * Builds up to three overview collage tiles for the homepage welcome layout.
 *
 * @param hub - YTT hub CMS document
 */
function mapYttHubWelcomeImages(
  hub: YttHubContent,
): HomeWelcomeContent["images"] {
  const alts = [
    "Students practicing yoga at Nirvana Yoga School in Rishikesh",
    "Guided meditation during yoga teacher training",
    "Yoga teacher training life at Nirvana Yoga School",
  ];
  const sources = [
    hub.overviewImage,
    hub.overviewInsetImage,
    hub.overviewThirdImage ?? "",
  ]
    .map((src) => src.trim())
    .filter(Boolean);
  if (sources.length === 0) return [];
  const fallbackAlt = alts[0] ?? "";
  while (sources.length < 3) {
    const last = sources[sources.length - 1];
    if (!last) break;
    sources.push(last);
  }
  return sources.slice(0, 3).map((src, index) => ({
    src,
    alt: alts[index] ?? fallbackAlt,
  }));
}

/**
 * Maps hub overview fields onto the homepage {@link HomeWelcomeContent} shape.
 *
 * @param hub - YTT hub CMS document
 */
export function mapYttHubToHomeWelcome(hub: YttHubContent): HomeWelcomeContent {
  const intro = hub.intro;
  const images = mapYttHubWelcomeImages(hub);

  return {
    _id: hub.sectionIds?.overview,
    eyebrow: intro.overviewEyebrow?.trim() || "Overview",
    title: intro.overviewTitle?.trim() || intro.title,
    lead:
      intro.overviewDescription?.trim() ||
      intro.overviewBody?.trim() ||
      intro.lead,
    highlights: intro.overviewPoints.filter((point) => point.trim()),
    rotatingStats: intro.stats.filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    ),
    ctaLabel: intro.primaryCtaLabel?.trim() || "View Courses",
    ctaHref: intro.primaryCtaHref?.trim() || "#courses",
    images,
    vision: {
      label: intro.vision?.label?.trim() || "",
      body: intro.vision?.body?.trim() || "",
    },
    promise: {
      label: intro.promise?.label?.trim() || "",
      body: intro.promise?.body?.trim() || "",
    },
  };
}

/**
 * Sticky nav items from CMS, falling back to the hub default order.
 *
 * @param nav - Hub nav from MySQL
 */
export function resolveYttHubNav(nav: YttHubNavItem[]): YttHubNavItem[] {
  const cleaned = nav.filter((item) => item.id.trim() && item.label.trim());
  return cleaned.length > 0 ? cleaned : DEFAULT_YTT_HUB_NAV;
}
