import type { BlogPostDocument } from "@/content/types/blog-post";
import type {
  OnlineCourseDocument,
  ResidentialCourseDocument,
} from "@/content/types/course";
import type { SitePageDocument } from "@/content/types/site-page";

/** Discriminated union for `[slug]` route resolution. */
export type PageKind = "online" | "residential" | "site";

export type OnlinePage = {
  kind: "online";
  slug: string;
  course: OnlineCourseDocument;
};

export type ResidentialPage = {
  kind: "residential";
  slug: string;
  course: ResidentialCourseDocument;
};

export type SitePage = {
  kind: "site";
  slug: string;
  page: SitePageDocument;
};

export type PageDocument = OnlinePage | ResidentialPage | SitePage;

export type BlogPage = {
  kind: "blog";
  slug: string;
  post: BlogPostDocument;
};
