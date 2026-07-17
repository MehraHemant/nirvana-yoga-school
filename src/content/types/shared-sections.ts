/**
 * Serializable shared site sections stored in `global_settings` and served via
 * `/api/content/*`.
 */

/** Optional live flag on shared section documents (default true). */
export type SharedSectionLiveFields = {
  /** When false, section is hidden wherever it is included. Default true. */
  live?: boolean;
};

export type SharedGalleryImage = {
  url: string;
  title: string;
  alt?: string;
  clickAction?: "fullscreen" | "redirect" | "none";
  redirectUrl?: string;
};

export type SharedAccommodationGallery = {
  id: string;
  label: string;
  description: string;
  images: SharedGalleryImage[];
};

export type SharedFacility = {
  label: string;
  /** Icon registry key (see facility icon map in Accommodation) */
  iconKey: string;
  note?: string;
};

export type ResidentialLifeContent = SharedSectionLiveFields & {
  accommodation: SharedSectionLiveFields & {
    stay: { title: string; description: string };
    galleries: SharedAccommodationGallery[];
  };
  food: SharedSectionLiveFields & {
    content: {
      title: string;
      description: string;
      points: string[];
      dietaryNote: string;
    };
    gallery: SharedGalleryImage[];
  };
  facilities: SharedFacility[];
};

export type SharedReview = {
  name: string;
  image: string;
  title: string;
  message: string;
  source: "Google" | "Tripadvisor" | "Trustpilot";
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
  category?: string;
  /** Display order (0, 10, 20…); array order is authoritative when omitted */
  sort?: number;
};

export type HomeFaqsContent = SharedSectionLiveFields & {
  faqs: SharedFaq[];
};

export type WhyNirvanaContent = SharedSectionLiveFields & {
  highlights: Array<{ title: string; body: string }>;
  closing: string;
  banner?: string;
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

export type YttHubCourse = {
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
    stickyNav?: string;
    overview?: string;
    whyRishikesh?: string;
    courses?: string;
    eligibility?: string;
    faq?: string;
  };
  heroImage: string;
  overviewImage: string;
  overviewInsetImage: string;
  intro: {
    pill: string;
    title: string;
    lead: string;
    overviewPoints: string[];
    stats: Array<{ value: string; label: string }>;
  };
  whyRishikesh: {
    title: string;
    paragraphs: string[];
    images: string[];
  };
  coursesIntro: {
    title: string;
    paragraphs: string[];
  };
  courses: YttHubCourse[];
  eligibility: {
    title: string;
    paragraphs: string[];
  };
  nav: YttHubNavItem[];
  faqs: SharedFaq[];
};
