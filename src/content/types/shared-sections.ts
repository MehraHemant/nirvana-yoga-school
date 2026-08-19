/**
 * Serializable shared site sections stored in `global_settings` and served via
 * `/api/content/*`.
 */

import type { SectionIdFields } from "@/content/types/page-seo";

/** Optional live flag on shared section documents (default true). */
export type SharedSectionLiveFields = {
  /** When false, section is hidden wherever it is included. Default true. */
  live?: boolean;
};

export type SharedGalleryImage = {
  url: string;
  title: string;
  alt?: string;
  /** Linked `media_assets.id` when picked from the CMS media library */
  mediaAssetId?: string;
  /** Linked `media_images.id` when sourced from the lodging media library */
  mediaImageId?: string;
  clickAction?: "fullscreen" | "redirect" | "none";
  redirectUrl?: string;
};

export type SharedAccommodationGallery = {
  id: string;
  label: string;
  description: string;
  images: SharedGalleryImage[];
  live: boolean;
  /** Small label above the room selector or gallery (e.g. "Choose your room"). */
  eyebrow?: string;
};

export type SharedFacility = {
  label: string;
  /** Icon registry key (see facility icon map in Accommodation) */
  iconKey: string;
  note?: string;
};

/** Shared room catalog scope — course vs retreat rooms tables. */
export type RoomCatalog = "course" | "retreat";

/** Optional video attached to a room row. */
export type RoomVideo = {
  url: string;
  title?: string;
  poster?: string;
};

/** Room row stored in the `rooms` table (shared accommodation catalogs). */
export type RoomRecord = {
  id: string;
  catalog: RoomCatalog;
  slug: string;
  /** Internal / admin identifier; public labels use {@link title} when set. */
  name: string;
  /** Public-facing room label on accommodation and lodging UI. */
  title?: string;
  /** Small label above the room selector when this room is active. */
  eyebrow?: string;
  description: string;
  /** Bullet features shown on public pricing / room cards. */
  features: string[];
  images: SharedGalleryImage[];
  videos: RoomVideo[];
  sort: number;
  live: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

/** Shared sattvic food section (`courseFood` / `retreatFood` global settings). */
export type SharedFoodContent = SharedSectionLiveFields & {
  content: {
    title: string;
    description: string;
    points: string[];
    dietaryNote: string;
  };
  gallery: SharedGalleryImage[];
};

/**
 * Per-page lodging overrides. Shared rooms/food come from Shared sections;
 * pages gate Live and may optionally append extras.
 */
export type ResidentialLifeContent = SharedSectionLiveFields & {
  accommodation: SectionIdFields & {
    /** Section H2 from shared accommodation settings (e.g. Ashram Accommodation). */
    title?: string;
    /** Section eyebrow from shared accommodation settings (e.g. Residential Life). */
    eyebrow?: string;
    /** Catalog used when resolving shared rooms (defaults by page type). */
    catalog?: RoomCatalog;
    stay: { title: string; description: string };
    /**
     * Legacy per-page room galleries — used only when the shared rooms
     * catalog is empty.
     */
    galleries: SharedAccommodationGallery[];
    /** Optional page-only rooms appended after the shared catalog. */
    extraRooms?: SharedAccommodationGallery[];
    /**
     * Shared room ids Live on this page (accommodation + linked pricing).
     * Omit = all catalog rooms Live (legacy). Empty array = none Live.
     */
    roomIds?: string[];
  };
  food: SectionIdFields & {
    content: {
      title: string;
      description: string;
      points: string[];
      dietaryNote: string;
    };
    gallery: SharedGalleryImage[];
    /** Page-only food points appended after shared food. */
    extraPoints?: string[];
    /** Page-only food images appended after shared food. */
    extraGallery?: SharedGalleryImage[];
  };
  facilities: SharedFacility[];
};

/** Allowed review platforms for CMS source dropdowns. */
export const REVIEW_SOURCE_OPTIONS = [
  { value: "Google", label: "Google" },
  { value: "Tripadvisor", label: "Tripadvisor" },
  { value: "Trustpilot", label: "Trustpilot" },
] as const;

/** Review platform stored on testimonials / shared reviews. */
export type ReviewSource = (typeof REVIEW_SOURCE_OPTIONS)[number]["value"];

export type SharedReview = {
  name: string;
  image: string;
  title: string;
  message: string;
  source: ReviewSource;
  /** Display order (0, 10, 20…); array order is authoritative when omitted */
  sort?: number;
};

export type ReviewsContent = SharedSectionLiveFields & {
  reviews: SharedReview[];
};

export type SharedFaq = {
  question: string;
  answer: string;
  image?: string;
  tag?: string;
  /** One of the four fixed FAQ categories (defaults to General when omitted). */
  category?: import("@/content/types/faq-categories").FaqCategoryId;
  /** Display order (0, 10, 20…); array order is authoritative when omitted */
  sort?: number;
};

export type HomeFaqsContent = SharedSectionLiveFields & {
  faqs: SharedFaq[];
};

export type WhyNirvanaContent = SharedSectionLiveFields & {
  /** Optional subheading above the highlights grid */
  heading?: string;
  highlights: Array<{ title: string; body: string }>;
  closing: string;
  banner?: string;
};

/** Global exam and certificate details shared across product pages. */
export type ExamCertificationContent = SharedSectionLiveFields & {
  eyebrow: string;
  title: string;
  description: string;
  steps: Array<{
    title: string;
    tag: string;
    description: string;
    /** @deprecated Unused on public site; kept for stored CMS JSON compatibility */
    image?: string;
  }>;
  certificates: Array<{
    title: string;
    subtitle: string;
    image: string;
  }>;
};

export type VenueFaqsContent = SharedSectionLiveFields & {
  faqs: SharedFaq[];
};

/**
 * Global map embed shared across product pages.
 * Page modules only toggle visibility via `flags.showMap` (or home `map.live`).
 */
export type SiteMapContent = SharedSectionLiveFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  embedUrl: string;
  iframeTitle: string;
};

/** Icon keys for travel guide topics (mapped to `@/icons` on the client). */
export type TravelTopicIconKey =
  | "shield"
  | "plane"
  | "leaf"
  | "compass"
  | "wallet"
  | "wifi";

/**
 * Global travel guide — shared across product pages.
 * Pages only toggle visibility via `flags.showTravel`.
 */
export type TravelGuideContent = SharedSectionLiveFields & {
  intro: string;
  quickFacts: Array<{ label: string; value: string }>;
  topics: Array<{
    id: string;
    title: string;
    /** @deprecated Unused in UI; kept for stored CMS JSON compatibility */
    tag?: string;
    content: string;
    image: string;
    imageAlt: string;
    iconKey: TravelTopicIconKey;
  }>;
};

/**
 * Global Instagram feed snapshot — shared across product pages.
 * Pages only toggle visibility via `flags.showInstagram`.
 */
export type InstagramFeedContent = SharedSectionLiveFields & {
  username: string | null;
  displayName?: string;
  bio?: string;
  website?: string;
  profileUrl: string;
  postsCount: number;
  followersCount?: number;
  followingCount?: number;
  media: Array<{
    id: string;
    caption: string;
    image: string;
    images: string[];
    videoUrl?: string | null;
    mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    isVideo: boolean;
    isMultipleImages: boolean;
    mediaCount: number;
    likesCount: number;
    commentsCount: number;
    permalink: string;
    timestamp: string;
    username: string | null;
  }>;
};

/** Global shared section keys editable in Shared sections CMS. */
export const GLOBAL_SHARED_SECTION_KEYS = [
  "whyNirvana",
  "siteMap",
  "instagram",
  "travel",
  "examCertification",
  "residentialLife",
  "retreatAccommodation",
  "courseFood",
  "retreatFood",
] as const;

/** @see GLOBAL_SHARED_SECTION_KEYS */
export type GlobalSharedSectionKey =
  (typeof GLOBAL_SHARED_SECTION_KEYS)[number];

export type RetreatAccommodationContent = SharedSectionLiveFields & {
  /**
   * Lodging subsection live flag. Prefer nested `accommodation.live`.
   * @deprecated Use `accommodation.live`
   */
  lodgingLive?: boolean;
  /**
   * Food subsection live flag. Prefer nested `food.live`.
   * @deprecated Use `food.live`
   */
  foodLive?: boolean;
  /** Lodging visibility (room galleries). Default live. */
  accommodation?: SharedSectionLiveFields;
  /** Food visibility (gallery + meal highlights). Default live. */
  food?: SharedSectionLiveFields;
  roomGalleries: SharedAccommodationGallery[];
  foodGallery: SharedGalleryImage[];
  mealHighlights: string[];
  /** Default facility labels when a retreat doc omits its own list */
  defaultFacilities: string[];
};

/**
 * Ordered course placement on the YTT hub — references a course page entity.
 * Card fields (title, fee, image, …) resolve from `course_documents` at read time.
 */
export type YttHubCourseRef = {
  /** `pages.slug` for a published `course` or `online` page */
  courseSlug: string;
  /** Optional short description for this placement only */
  description?: string;
};

/**
 * @deprecated Legacy embedded course card. Still accepted on read for DB compat;
 * prefer {@link YttHubCourseRef}. New admin saves write refs only.
 */
export type YttHubCourseEmbedded = {
  title: string;
  description: string;
  overview: string;
  focusAreas: string[];
  level: string;
  certification: string;
  duration: string;
  fee: string;
  image: string;
  certBadge: string;
  href: string;
  /** Present when dual-written during migration */
  courseSlug?: string;
};

/** Stored YTT hub course entry (entity ref or legacy embedded card). */
export type YttHubCourse = YttHubCourseRef | YttHubCourseEmbedded;

/**
 * Resolved course card for public YTT hub UI (entity fields + placement override).
 */
export type ResolvedYttHubCourse = {
  courseSlug?: string;
  title: string;
  description: string;
  overview: string;
  focusAreas: string[];
  level: string;
  certification: string;
  duration: string;
  fee: string;
  image: string;
  certBadge: string;
  href: string;
};

export type YttHubNavItem = {
  id: `#${string}`;
  label: string;
  shortLabel: string;
};

export type YttHubContent = SharedSectionLiveFields & {
  /** Optional page-level SEO for the YTT hub route */
  meta?: import("@/content/types/page-seo").PageSeoMeta;
  /**
   * Optional HTML ids per hub section (admin `_id` fields).
   * Used as public section `id` when set.
   */
  sectionIds?: {
    hero?: string;
    /** @deprecated Unused — sticky nav is not rendered on the YTT hub */
    stickyNav?: string;
    overview?: string;
    /** Public HTML id override for the homepage Why Rishikesh band on this hub */
    whyRishikesh?: string;
    courses?: string;
    /**
     * @deprecated Unused on public hub — certification uses shared `ExamCertification` (`#exam`)
     */
    eligibility?: string;
    faq?: string;
  };
  /**
   * Per-section inclusion flags for hub / shared bands.
   * Omit or `true` shows the section when content has data.
   */
  flags?: {
    showVideos?: boolean;
    showGallery?: boolean;
    /** When true, render homepage Why Rishikesh (`pages.home.whyRishikesh`) */
    showWhyRishikesh?: boolean;
    /** When true, render shared `ExamCertification` (same as course pages) */
    showEligibility?: boolean;
    showTeachers?: boolean;
    showReviews?: boolean;
    showMap?: boolean;
    /** @deprecated Unused on hub — kept for stored CMS JSON compatibility */
    showExam?: boolean;
    /** @deprecated Unused on hub — kept for stored CMS JSON compatibility */
    showWhyNirvana?: boolean;
  };
  /** Still / poster fallback when hero video posters are unset */
  heroImage: string;
  /**
   * Hub-only hero background video (responsive).
   * Do not reuse homepage video files unless intentionally set in CMS.
   */
  heroVideo?: import("@/content/types/dedicated-pages").HomeHeroVideoContent;
  overviewImage: string;
  overviewInsetImage: string;
  /** Optional third collage tile for the homepage-style overview band */
  overviewThirdImage?: string;
  intro: {
    pill: string;
    title: string;
    lead: string;
    overviewPoints: string[];
    stats: Array<{ value: string; label: string }>;
    /** Homepage-style hero first line (falls back to `title`) */
    titleLead?: string;
    /** Homepage-style hero accent phrase */
    titleAccent?: string;
    /** Hero marquee strip items */
    marqueeItems?: string[];
    /** Overview section eyebrow */
    overviewEyebrow?: string;
    /** Overview section heading */
    overviewTitle?: string;
    /** Overview supporting description under the heading */
    overviewDescription?: string;
    /** Body copy above the overview points list */
    overviewBody?: string;
    /** Small badge over the overview image (legacy collage) */
    imageBadge?: string;
    /** Vision labeled block (homepage welcome pattern) */
    vision?: { label: string; body: string };
    /** Promise labeled block (homepage welcome pattern) */
    promise?: { label: string; body: string };
    /** Primary hero CTA label */
    primaryCtaLabel?: string;
    /** Primary hero CTA href */
    primaryCtaHref?: string;
    /** Secondary hero CTA label */
    secondaryCtaLabel?: string;
    /** Secondary hero CTA href */
    secondaryCtaHref?: string;
  };
  /**
   * @deprecated Unused on public hub — Why Rishikesh reuses `pages.home.whyRishikesh`
   * Kept for stored CMS JSON compatibility.
   */
  whyRishikesh: {
    eyebrow?: string;
    title: string;
    paragraphs: string[];
    images: string[];
  };
  coursesIntro: {
    eyebrow?: string;
    title: string;
    paragraphs: string[];
  };
  courses: YttHubCourse[];
  /**
   * @deprecated Unused on public hub — certification uses shared `examCertification`
   * Kept for stored CMS JSON compatibility.
   */
  eligibility: {
    eyebrow?: string;
    title: string;
    paragraphs: string[];
  };
  /** @deprecated Unused — sticky nav is not rendered on the YTT hub */
  nav: YttHubNavItem[];
  faqs: SharedFaq[];
};
