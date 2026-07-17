import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeMapSectionContent } from "@/content/types/dedicated-pages";
import type { SiteMapContent } from "@/content/types/shared-sections";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";

type MapSectionProps = {
  className?: string;
  /**
   * CMS map embed + header. Prefer shared `siteMap` from MySQL.
   * Falls back to homepage defaults only when omitted (empty-CMS safety).
   */
  content?: SiteMapContent | HomeMapSectionContent | null;
  /** Optional HTML id override from the hosting page (e.g. home `map._id`) */
  htmlId?: string;
};

/**
 * Shared Google Maps embed band used on home and product pages.
 *
 * @param props - Optional CMS map fields and section class
 */
export default function MapSection({
  className = "bg-paper",
  content,
  htmlId,
}: MapSectionProps) {
  const map = content ?? DEFAULT_HOME_PAGE_CONTENT.map;
  if (!shouldRenderSection(map, Boolean(map.embedUrl?.trim()))) {
    return null;
  }

  const sectionId =
    htmlId ??
    resolveSectionHtmlId(
      "location",
      "_id" in map && typeof map._id === "string" ? map._id : undefined,
    );

  return (
    <section id={sectionId} className={`w-full ${className}`}>
      <iframe
        title={map.iframeTitle}
        src={map.embedUrl}
        className="w-full border-0"
        style={{ minHeight: 500, height: "50vh" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </section>
  );
}
