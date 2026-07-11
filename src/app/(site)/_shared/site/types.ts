import type { TeacherProfile } from "@/components/home/TeachersSection";
import type { MappedSitePage } from "@/content/mappers/site-page";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";

export type SitePageVariant = "teacher" | "hub" | "editorial";

export type SitePageData = {
  page: SitePageDocument;
  mapped: MappedSitePage;
  teachers: TeacherProfile[];
  variant: SitePageVariant;
  modules: PageModulesDocument | null;
};

export type SiteClientProps = Pick<
  SitePageData,
  "page" | "mapped" | "teachers" | "modules"
> & {
  modules?: PageModulesDocument | null;
};
