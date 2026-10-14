import type { BlogPostDocument } from "@/content/types/blog-post";
import type {
  OnlineCourseDocument,
  ResidentialCourseDocument,
} from "@/content/types/course";
import type { SitePageDocument } from "@/content/types/site-page";

export type { PageRef, PageType } from "@/content/types/page-ref";

/** Discriminated union aligned with `PageType` in the pages registry. */
export type PageKind = "course" | "online" | "retreat" | "venue" | "site";

export type CoursePage = {
  kind: "course";
  slug: string;
  course: ResidentialCourseDocument;
};

export type OnlinePage = {
  kind: "online";
  slug: string;
  course: OnlineCourseDocument;
};

export type RetreatPage = {
  kind: "retreat";
  slug: string;
  page: SitePageDocument;
};

export type VenuePage = {
  kind: "venue";
  slug: string;
  page: SitePageDocument;
};

export type SitePage = {
  kind: "site";
  slug: string;
  page: SitePageDocument;
};

export type PageDocument =
  | CoursePage
  | OnlinePage
  | RetreatPage
  | VenuePage
  | SitePage;

export type BlogPage = {
  kind: "blog";
  slug: string;
  post: BlogPostDocument;
};
