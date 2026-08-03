import { DEFAULT_ONLINE_HUB_NAV } from "@/content/page-modules-defaults";
import { ONLINE_HUB_SLUG } from "@/content/pages/slugs";
import type { PageModulesDocument } from "@/content/types";
import { invalidateContentCache } from "@/lib/cms/cache";
import { upsertPageModules } from "@/lib/cms/document-to-db";
import {
  createDefaultOnlineHubModules,
  DEFAULT_ONLINE_HUB_HERO_VIDEO,
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
  DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL,
  ONLINE_HUB_HERO_IMAGE,
} from "@/lib/cms/online-hub-defaults";
import { db } from "@/lib/db";

/**
 * True when hub hero modules already have a playable video source.
 *
 * @param modules - Stored page modules
 */
function hasHeroVideoSource(modules: PageModulesDocument): boolean {
  const hero = modules.hero;
  if (!hero || hero.type !== "page-minimal") return false;
  const video = hero.heroVideo;
  if (!video) return false;
  return Boolean(video.mobileSrc?.trim() || video.desktopSrc?.trim());
}

/**
 * True when overview already has a video media item with a URL.
 *
 * @param modules - Stored page modules
 */
function hasOverviewVideo(modules: PageModulesDocument): boolean {
  return modules.overview.media.items.some(
    (item) => item.type === "video" && Boolean(item.url?.trim()),
  );
}

/**
 * True when sticky nav still points at legacy `#overview` instead of `#about`.
 *
 * @param modules - Stored page modules
 */
function needsAboutNavBackfill(modules: PageModulesDocument): boolean {
  return modules.stickyNav.items.some((item) => item.id === "#overview");
}

/**
 * Ensures the published online-courses hub site page exists with editable modules.
 * Backfills homepage-matching hero video, overview content video, and `#about` nav.
 *
 * @returns Whether a write was performed
 */
export async function ensureOnlineHubPage(): Promise<{
  created: boolean;
  updated: boolean;
}> {
  const existing = await db.page.findUnique({
    where: { slug: ONLINE_HUB_SLUG },
    select: { id: true, published: true, pageModules: true },
  });

  if (existing?.published && existing.pageModules) {
    const modules = existing.pageModules as PageModulesDocument;
    let next: PageModulesDocument = modules;
    let changed = false;

    if (!hasHeroVideoSource(next) && next.hero?.type === "page-minimal") {
      next = {
        ...next,
        hero: {
          ...next.hero,
          heroVideo: { ...DEFAULT_ONLINE_HUB_HERO_VIDEO },
        },
      };
      changed = true;
    }

    if (!hasOverviewVideo(next)) {
      const defaults = createDefaultOnlineHubModules().overview;
      next = {
        ...next,
        overview: {
          ...next.overview,
          media: {
            mode: "video",
            items: [
              {
                type: "video",
                url: DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL,
                poster: DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
                title: "Online yoga teacher training at Nirvana Yoga School",
              },
              ...next.overview.media.items.filter(
                (item) => item.type !== "video",
              ),
            ],
          },
          vision: next.overview.vision ?? defaults.vision,
          promise: next.overview.promise ?? defaults.promise,
          highlights: next.overview.highlights?.length
            ? next.overview.highlights
            : defaults.highlights,
          rotatingStats: next.overview.rotatingStats?.length
            ? next.overview.rotatingStats
            : defaults.rotatingStats,
          ctaLabel: next.overview.ctaLabel?.trim() || defaults.ctaLabel,
          ctaHref: next.overview.ctaHref?.trim() || defaults.ctaHref,
        },
      };
      changed = true;
    }

    if (needsAboutNavBackfill(next)) {
      next = {
        ...next,
        stickyNav: {
          ...next.stickyNav,
          items: next.stickyNav.items.map((item) =>
            item.id === "#overview"
              ? { ...item, id: "#about" as const }
              : item,
          ),
        },
      };
      if (!next.stickyNav.items.some((item) => item.id === "#about")) {
        next = {
          ...next,
          stickyNav: {
            ...next.stickyNav,
            items: [...DEFAULT_ONLINE_HUB_NAV],
          },
        };
      }
      changed = true;
    }

    if (!changed) {
      return { created: false, updated: false };
    }

    await upsertPageModules(ONLINE_HUB_SLUG, next);
    invalidateContentCache(ONLINE_HUB_SLUG, "site");
    return { created: false, updated: true };
  }

  const modules = createDefaultOnlineHubModules();
  await upsertPageModules(ONLINE_HUB_SLUG, modules);
  await db.page.update({
    where: { slug: ONLINE_HUB_SLUG },
    data: {
      published: true,
      eyebrow: "Online · Yoga Alliance certified",
      title: "Nirvana online yoga teacher training",
      description:
        "Self-paced Yoga Alliance online courses from Rishikesh teachers — lifetime access and live Q&A.",
      image: ONLINE_HUB_HERO_IMAGE,
      ctaLabel: "Enquire now",
      ctaHref: "/enquire-now",
      type: "site",
    },
  });
  invalidateContentCache(ONLINE_HUB_SLUG, "site");

  return { created: true, updated: false };
}
