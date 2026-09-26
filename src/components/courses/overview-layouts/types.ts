import type { ReactNode } from "react";
import type { ImageClickAction } from "@/content/types/cms-image";
import type { GlanceItem } from "@/content/types/page-modules";
import type { YouTubeVideo } from "@/lib/youtube";

/** Normalized glance fact used by live chips. */
export type OverviewSpec = {
  index: string;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
};

/** Same public props as `CourseOverview`. */
export type CourseOverviewLayoutProps = {
  /** Lead overview paragraph (legacy prop name — may include merged description) */
  overview: string;
  /** Short intro prepended to the lead body on the public page */
  description?: string;
  /** Focus / experience level */
  level: string;
  /** Program duration */
  duration: string;
  /** Certification line */
  certification?: string;
  /** Fee display string */
  fee?: string;
  /** Optional YouTube playlist */
  videos?: YouTubeVideo[];
  /** Optional image carousel when no videos are provided */
  featureImages?: string[];
  /** Rich overview carousel images (preferred over featureImages) */
  overviewImages?: Array<{
    url: string;
    alt?: string;
    clickAction?: ImageClickAction;
    redirectUrl?: string;
  }>;
  /** Optional still beside glance — CMS `overviewImage` or first media image */
  stillImage?: string | {
    url: string;
    alt?: string;
    clickAction?: ImageClickAction;
    redirectUrl?: string;
  };
  /** Section eyebrow */
  eyebrow?: string;
  /** Section title */
  title?: ReactNode;
  /** Optional subheading above the lead body */
  heading?: string;
  /** Quote with author attribution */
  saying?: { text: string; author: string };
  /** Supporting paragraph under the lead */
  supportingCopy?: string;
  /** CMS glance stats — preferred over legacy level/duration props */
  glance?: GlanceItem[];
  /** Public section HTML id (defaults to `overview`) */
  htmlId?: string;
};

/** Normalized overview fields used by the live layout. */
export type ResolvedOverview = {
  htmlId: string;
  eyebrow: string;
  title: ReactNode;
  heading?: string;
  overviewHtml: string;
  supporting?: string;
  saying?: { text: string; author: string | null };
  videos: YouTubeVideo[];
  specs: OverviewSpec[];
  showVideoPanel: boolean;
  showImagePanel: boolean;
  images: Array<{
    url: string;
    alt?: string;
    clickAction?: ImageClickAction;
    redirectUrl?: string;
  }>;
  /** Optional still for the live layout; omitted when the CMS URL is empty */
  stillImage?: {
    url: string;
    alt?: string;
    clickAction?: ImageClickAction;
    redirectUrl?: string;
  };
};
