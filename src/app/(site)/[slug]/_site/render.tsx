import { MapSection } from "@/components/home";
import { isKirtanPage } from "@/content/mappers/kirtan-page";
import type { SitePageDocument } from "@/content/types";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { loadSitePageDataAsync } from "../../_shared/site/data.server";
import HubClient from "./HubClient";
import KirtanClient from "./KirtanClient";
import SiteClient from "./SiteClient";
import TeachersClient from "./TeachersClient";
import YttHubPage from "./YttHubPage";

const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

/**
 * Renders a CMS site page with shared map gated by page + global live flags.
 *
 * @param page - Site page document
 */
export async function renderSitePage(page: SitePageDocument) {
  if (page.slug === YTT_HUB_SLUG) {
    return <YttHubPage />;
  }

  const data = await loadSitePageDataAsync(page);
  const props = {
    page: data.page,
    mapped: data.mapped,
    teachers: data.teachers,
    modules: data.modules,
    residentialLife: data.residentialLife,
    whyNirvana: data.whyNirvana,
    reviews: data.reviews,
    siteMap: data.siteMap,
  };

  let client = <SiteClient {...props} />;
  if (data.variant === "teacher") client = <TeachersClient {...props} />;
  if (data.variant === "hub") client = <HubClient {...props} />;
  if (isKirtanPage(page.slug)) client = <KirtanClient {...props} />;

  const showMap =
    (data.modules?.flags.showMap ?? data.mapped.showMap) &&
    shouldRenderSection(
      data.siteMap,
      Boolean(data.siteMap?.embedUrl?.trim()),
    );

  return (
    <>
      {client}
      {showMap && data.siteMap ? <MapSection content={data.siteMap} /> : null}
    </>
  );
}
