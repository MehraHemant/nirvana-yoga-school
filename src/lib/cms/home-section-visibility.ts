import type { HomePageContent } from "@/content/types/dedicated-pages";
import { isHomeCoursePlacementLive } from "@/content/mappers/home-courses";
import { shouldRenderSection } from "@/lib/cms/section-visibility";

type HomeSectionKey = Exclude<keyof HomePageContent, "kind" | "meta" | "seo">;

/**
 * Whether a homepage section has enough CMS content to render.
 *
 * @param key - Home section key
 * @param home - Normalized home document
 */
export function homeSectionHasData(
  key: HomeSectionKey,
  home: HomePageContent,
): boolean {
  switch (key) {
    case "hero":
      return Boolean(
        home.hero.titleLead.trim() || home.hero.titleAccent.trim(),
      );
    case "welcome":
      return Boolean(home.welcome.title.trim() || home.welcome.lead.trim());
    case "video":
      return home.video.youtubeUrls.length > 0;
    case "gallery":
      return home.gallery.items.length > 0;
    case "whyRishikesh":
      return Boolean(home.whyRishikesh.title.trim());
    case "courses":
      return (
        (home.courses.placements?.some(isHomeCoursePlacementLive) ?? false) ||
        (home.courses.cards?.length ?? 0) > 0
      );
    case "yogaAlliance":
      return Boolean(home.yogaAlliance.title.trim());
    case "teachersTeaser":
      return Boolean(home.teachersTeaser.title.trim());
    case "testimonials":
      return (home.testimonials.reviews?.length ?? 0) > 0;
    case "map":
      // Embed URL is shared via `global_settings.siteMap`; home only gates live/_id.
      return true;
    case "faqs":
      return home.faqs.faqs.length > 0;
    case "finalCta":
      return Boolean(home.finalCta.title.trim() || home.finalCta.pill.trim());
    default:
      return true;
  }
}

/**
 * Live + data gate for a homepage section.
 *
 * @param key - Home section key
 * @param home - Normalized home document
 */
export function shouldRenderHomeSection(
  key: HomeSectionKey,
  home: HomePageContent,
): boolean {
  return shouldRenderSection(home[key], homeSectionHasData(key, home));
}
