/** Scraped / CMS site page document (retreats, hubs, about, etc.). */

import type { PageSeoMeta } from "@/content/types/page-seo";

export type SitePageCard = {
  title: string;
  description: string;
  href?: string;
};

export type SitePageSubsection = {
  title: string;
  body?: string;
  items?: string[];
  image?: string;
};

/** Dynamic content block inside a section — preferred CMS format. */
export type SectionContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "lead"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | {
      type: "cta";
      label: string;
      href: string;
      variant?: "primary" | "secondary" | "outline";
      openInNewTab?: boolean;
    }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "gallery"; urls: string[] }
  | {
      type: "subsection";
      title: string;
      paragraph?: string;
      imageUrl?: string;
      bullets?: string[];
    }
  | { type: "video"; url: string; caption?: string };

export type SitePageSection = {
  /** Optional HTML section id for scroll anchors */
  _id?: string;
  title: string;
  eyebrow?: string;
  /** Dynamic blocks — rendered when present (CMS). */
  blocks?: SectionContentBlock[];
  body?: string;
  items?: string[];
  subsections?: SitePageSubsection[];
  layout?: "default" | "timeline" | "split-media" | "faq";
  image?: string;
  images?: string[];
};

export type SitePageHighlight = {
  title: string;
  description: string;
  image?: string;
};

export type SitePagePerson = {
  name: string;
  image?: string;
  summary?: string;
  bio?: string;
  education?: string[];
  experience?: string[];
  expertise?: string[];
};

export type SitePagePackage = {
  title: string;
  price: string;
  image?: string;
};

export type SitePageGalleryImage = {
  url: string;
  category: string;
  /** Optional display title */
  title?: string;
  /** Accessible alt text */
  alt?: string;
  /** Media type — videos use YouTube ids in `url` */
  type?: "image" | "video";
  /** Optional media library asset id */
  mediaAssetId?: string;
};

export type SitePageDocument = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  /** Optional page-level SEO overrides (keywords, noIndex, ogImage, etc.) */
  meta?: PageSeoMeta;
  sections: SitePageSection[];
  highlights?: SitePageHighlight[];
  people?: SitePagePerson[];
  packages?: SitePagePackage[];
  gallery?: SitePageGalleryImage[];
  cards?: SitePageCard[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional CMS blocks from content items / content_data */
  cms?: import("@/content/types/page-cms").SitePageCmsContent;
  /**
   * Teacher-page presentation copy (hero quote, section headers).
   * Persisted in `pages.content_data`.
   */
  presentation?: {
    heroQuote?: string;
    heroLead?: string;
    sectionEyebrow?: string;
    sectionTitle?: string;
    sectionDescription?: string;
    homeEyebrow?: string;
    homeTitle?: string;
    homeDescription?: string;
    /** Optional HTML id for the hero band */
    heroId?: string;
    /** Optional HTML id for the faculty section */
    facultyId?: string;
    /** Optional HTML id for the homepage teachers teaser copy band (admin only) */
    homeTeaserId?: string;
  };
};
