import { MapSection } from "@/components/home";
import type { SitePageDocument } from "@/content/types";
import { loadSitePageData } from "../../_shared/site/data";
import HubClient from "./HubClient";
import SiteClient from "./SiteClient";
import TeachersClient from "./TeachersClient";

export function renderSitePage(page: SitePageDocument) {
  const data = loadSitePageData(page);
  const props = {
    page: data.page,
    mapped: data.mapped,
    teachers: data.teachers,
  };

  let client = <SiteClient {...props} />;
  if (data.variant === "teacher") client = <TeachersClient {...props} />;
  if (data.variant === "hub") client = <HubClient {...props} />;

  return (
    <>
      {client}
      <MapSection />
    </>
  );
}
