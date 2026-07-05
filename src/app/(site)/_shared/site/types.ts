import type { TeacherProfile } from "@/components/home/TeachersSection";
import type { MappedSitePage } from "@/content/mappers/site-page";
import type { SitePageDocument } from "@/content/types";

export type SitePageVariant = "teacher" | "hub" | "editorial";

export type SitePageData = {
  page: SitePageDocument;
  mapped: MappedSitePage;
  teachers: TeacherProfile[];
  variant: SitePageVariant;
};

export type SiteClientProps = Pick<
  SitePageData,
  "page" | "mapped" | "teachers"
>;
