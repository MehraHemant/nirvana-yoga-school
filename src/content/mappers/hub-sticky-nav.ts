import {
  DEFAULT_ONLINE_HUB_NAV,
  DEFAULT_YTT_HUB_NAV,
} from "@/content/page-modules-defaults";
import type {
  OverviewModule,
  PageModulesDocument,
} from "@/content/types/page-modules";
import type { StickyNavItem } from "@/content/types/shared";
import type { YttHubContent } from "@/content/types/shared-sections";
import { resolveSectionHtmlId } from "@/lib/html-id";

/** Legacy overview anchors stored before hubs standardized on `#about`. */
const LEGACY_OVERVIEW_ANCHORS = new Set(["#overview"]);

export type YttHubNavVisibility = {
  showVideos: boolean;
  showGallery: boolean;
  showWhyRishikesh: boolean;
  showEligibility: boolean;
  showTeachers: boolean;
  showReviews: boolean;
  showMap: boolean;
  showFaqs: boolean;
};

export type OnlineHubNavVisibility = {
  showOverview: boolean;
  showWhyOnline: boolean;
  showFaqs: boolean;
};

type YttHubSectionIdContext = {
  sectionIds?: YttHubContent["sectionIds"];
  homeSectionIds?: {
    video?: string;
    gallery?: string;
    testimonials?: string;
    whyRishikesh?: string;
    map?: string;
  };
};

/**
 * Normalizes hub sticky-nav rows (legacy `#overview` → `#about`, drops retired anchors).
 *
 * @param items - Raw CMS nav items
 */
export function normalizeHubStickyNavItems(
  items: StickyNavItem[],
): StickyNavItem[] {
  return items.map((item) =>
    LEGACY_OVERVIEW_ANCHORS.has(item.id)
      ? { ...item, id: "#about" as const }
      : item,
  );
}

/**
 * Maps canonical hub anchors to public section ids when CMS `_id` overrides exist.
 *
 * @param items - Sticky nav items using preset anchors
 * @param ctx - Hub section id overrides and reused home section ids
 */
export function resolveYttHubNavTargets(
  items: StickyNavItem[],
  ctx: YttHubSectionIdContext,
): StickyNavItem[] {
  const { sectionIds, homeSectionIds } = ctx;

  const anchorToDomId: Partial<Record<StickyNavItem["id"], string>> = {
    "#about": resolveSectionHtmlId("about", sectionIds?.overview),
    "#courses": resolveSectionHtmlId("courses", sectionIds?.courses),
    "#faq": resolveSectionHtmlId("faq", sectionIds?.faq),
    "#why-rishikesh": resolveSectionHtmlId(
      "why-rishikesh",
      sectionIds?.whyRishikesh ?? homeSectionIds?.whyRishikesh,
    ),
    "#video": resolveSectionHtmlId("video", homeSectionIds?.video),
    "#gallery": resolveSectionHtmlId("gallery", homeSectionIds?.gallery),
    "#reviews": resolveSectionHtmlId("reviews", homeSectionIds?.testimonials),
    "#location": resolveSectionHtmlId("location", homeSectionIds?.map),
    "#teachers": resolveSectionHtmlId("teachers"),
    "#exam": resolveSectionHtmlId("exam"),
  };

  return items.map((item) => {
    const domId = anchorToDomId[item.id];
    if (!domId) return item;
    return { ...item, id: `#${domId}` as StickyNavItem["id"] };
  });
}

/**
 * Resolves online hub sticky targets from page module `_id` fields.
 *
 * @param items - CMS sticky nav items
 * @param modules - Online hub page modules
 */
export function resolveOnlineHubNavTargets(
  items: StickyNavItem[],
  modules: PageModulesDocument,
): StickyNavItem[] {
  const overview = modules.overview as OverviewModule | undefined;
  const whyOnline = modules.whyOnline;

  const anchorToDomId: Partial<Record<StickyNavItem["id"], string>> = {
    "#about": resolveSectionHtmlId("about", overview?._id),
    "#why-online": resolveSectionHtmlId("why-online", whyOnline?._id),
    "#courses": resolveSectionHtmlId("courses"),
    "#faq": resolveSectionHtmlId("faq", modules.faqs?._id),
  };

  return items.map((item) => {
    const domId = anchorToDomId[item.id];
    if (!domId) return item;
    return { ...item, id: `#${domId}` as StickyNavItem["id"] };
  });
}

/**
 * Filters YTT hub nav links to sections that render on the public page.
 *
 * @param items - CMS nav items (after normalization)
 * @param visibility - Per-band inclusion flags from the hub page
 */
export function filterYttHubNavItems(
  items: StickyNavItem[],
  visibility: YttHubNavVisibility,
): StickyNavItem[] {
  return items.filter((item) => {
    switch (item.id) {
      case "#about":
        return true;
      case "#video":
        return visibility.showVideos;
      case "#gallery":
        return visibility.showGallery;
      case "#why-rishikesh":
        return visibility.showWhyRishikesh;
      case "#courses":
        return true;
      case "#exam":
        return visibility.showEligibility;
      case "#teachers":
        return visibility.showTeachers;
      case "#reviews":
        return visibility.showReviews;
      case "#location":
        return visibility.showMap;
      case "#faq":
        return visibility.showFaqs;
      default:
        return true;
    }
  });
}

/**
 * Filters online hub nav links to live / non-empty sections.
 *
 * @param items - CMS sticky nav items
 * @param visibility - Section render flags for the online hub
 */
export function filterOnlineHubNavItems(
  items: StickyNavItem[],
  visibility: OnlineHubNavVisibility,
): StickyNavItem[] {
  return items.filter((item) => {
    if (item.id === "#about") return visibility.showOverview;
    if (item.id === "#why-online") return visibility.showWhyOnline;
    if (item.id === "#courses") return true;
    if (item.id === "#faq") return visibility.showFaqs;
    return true;
  });
}

/**
 * Resolves YTT hub sticky nav for the public page (defaults, normalize, filter, ids).
 *
 * @param hub - YTT hub CMS document
 * @param visibility - Which optional bands render
 * @param homeSectionIds - `_id` values reused from the homepage document
 */
export function buildYttHubStickyNav(
  hub: YttHubContent,
  visibility: YttHubNavVisibility,
  homeSectionIds?: YttHubSectionIdContext["homeSectionIds"],
): StickyNavItem[] {
  const source = hub.nav?.length > 0 ? hub.nav : [...DEFAULT_YTT_HUB_NAV];
  const normalized = normalizeHubStickyNavItems(source);
  const filtered = filterYttHubNavItems(normalized, visibility);
  return resolveYttHubNavTargets(filtered, {
    sectionIds: hub.sectionIds,
    homeSectionIds,
  });
}

/**
 * Resolves online hub sticky nav from page modules.
 *
 * @param modules - Published online hub modules
 * @param visibility - Section render flags
 */
export function buildOnlineHubStickyNav(
  modules: PageModulesDocument,
  visibility: OnlineHubNavVisibility,
): StickyNavItem[] {
  const source =
    modules.stickyNav.items?.length > 0
      ? modules.stickyNav.items
      : [...DEFAULT_ONLINE_HUB_NAV];
  const normalized = normalizeHubStickyNavItems(source).filter(
    (item) => item.id !== "#exam",
  );
  const filtered = filterOnlineHubNavItems(normalized, visibility);
  return resolveOnlineHubNavTargets(filtered, modules);
}
