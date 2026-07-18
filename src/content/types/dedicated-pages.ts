/**
 * Typed `pages.content_data` documents for dedicated public routes
 * (home, contact, enquire-now). Defaults mirror today’s hardcoded copy.
 */

import type {
  PageSeoMeta,
  SectionIdFields,
} from "@/content/types/page-seo";
import type { SharedFaq, SharedReview } from "@/content/types/shared-sections";

/**
 * Optional CMS section id + live flag stored on each home section object.
 * @deprecated Prefer {@link SectionIdFields} — kept as an alias for home types.
 */
export type HomeSectionIdFields = SectionIdFields;

/** Hero background video sources (responsive). */
export type HomeHeroVideoContent = {
  mobileSrc: string;
  mobilePoster: string;
  desktopSrc: string;
  desktopPoster: string;
};

export type HomeHeroContent = HomeSectionIdFields & {
  badge: string;
  /** First line before accent phrase */
  titleLead: string;
  /** Accent phrase (e.g. “Himalayas”) */
  titleAccent: string;
  ctaLabel: string;
  ctaHref: string;
  marqueeItems: string[];
  mobileTrust: Array<{ value: string; label: string }>;
  /** Full-bleed background video + posters */
  video: HomeHeroVideoContent;
};

/** Welcome band image tile. */
export type HomeWelcomeImage = {
  src: string;
  alt: string;
};

/** Labeled body block (vision / promise). */
export type HomeWelcomeLabeledBlock = {
  label: string;
  body: string;
};

export type HomeWelcomeContent = HomeSectionIdFields & {
  eyebrow: string;
  title: string;
  lead: string;
  highlights: string[];
  rotatingStats: Array<{ value: string; label: string }>;
  ctaLabel: string;
  ctaHref: string;
  /** Three gallery tiles beside the rotating stats */
  images: HomeWelcomeImage[];
  vision: HomeWelcomeLabeledBlock;
  promise: HomeWelcomeLabeledBlock;
};

export type HomeSectionHeaderContent = HomeSectionIdFields & {
  eyebrow?: string;
  title: string;
  description?: string;
};

/** Homepage video playlist section. */
export type HomeVideoSectionContent = HomeSectionHeaderContent & {
  youtubeUrls: string[];
};

/** Gallery item category keys used by the filter UI. */
export type HomeGalleryCategoryId = "practice" | "campus" | "life";

export type HomeGalleryItem = {
  src: string;
  alt: string;
  title: string;
  category: HomeGalleryCategoryId;
};

export type HomeGalleryCategory = {
  id: string;
  label: string;
};

/** Homepage campus gallery section. */
export type HomeGallerySectionContent = HomeSectionHeaderContent & {
  items: HomeGalleryItem[];
  categories?: HomeGalleryCategory[];
  lightboxTitle?: string;
};

export type HomeWhyRishikeshTrustLogo = {
  src: string;
  alt: string;
};

export type HomeWhyRishikeshSutra = {
  title: string;
  body: string;
};

export type HomeWhyRishikeshVideoCard = {
  eyebrow: string;
  title: string;
  speakerTag: string;
  speakerSubtitle: string;
};

/** Homepage “Why Rishikesh” band. */
export type HomeWhyRishikeshContent = HomeSectionIdFields & {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  youtubeUrl: string;
  trustLogos: HomeWhyRishikeshTrustLogo[];
  sutras: HomeWhyRishikeshSutra[];
  closingInvitation: string;
  videoCard: HomeWhyRishikeshVideoCard;
};

/** Homepage course card stored in CMS. */
export type HomeCourseCard = {
  title: string;
  duration: string;
  level: string;
  certification: string;
  fee: string;
  image: string;
  certBadge: string;
  href: string;
  highlights: string[];
};

/** Homepage courses grid section. */
export type HomeCoursesSectionContent = HomeSectionHeaderContent & {
  cards: HomeCourseCard[];
};

export type HomeYogaAllianceCertIconKey = "leaf" | "compass" | "certificate";

export type HomeYogaAllianceCertification = {
  hours: string;
  title: string;
  level: string;
  description: string;
  href: string;
  iconKey: HomeYogaAllianceCertIconKey;
};

/** Homepage Yoga Alliance certification band. */
export type HomeYogaAllianceContent = HomeSectionIdFields & {
  eyebrow?: string;
  title: string;
  description?: string;
  badgeLabel: string;
  sealEyebrow: string;
  sealTitle: string;
  lead: string;
  body: string;
  certifications: HomeYogaAllianceCertification[];
};

export type HomeFinalCtaContent = HomeSectionIdFields & {
  pill: string;
  title: string;
  titleAccent: string;
  lead: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
  imageAlt?: string;
};

/** Homepage teachers teaser band (faculty list still comes from Teachers page). */
export type HomeTeachersTeaserContent = HomeSectionIdFields & {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Homepage FAQ section (stored on home, not shared global_settings). */
export type HomeFaqsSectionContent = HomeSectionIdFields & {
  eyebrow: string;
  title: string;
  faqs: SharedFaq[];
};

/** Homepage testimonials section. */
export type HomeReviewsSectionContent = HomeSectionIdFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  reviews: SharedReview[];
};

/** Homepage map embed section. */
export type HomeMapSectionContent = HomeSectionIdFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  embedUrl: string;
  iframeTitle: string;
  /** @deprecated Prefer `live`. Kept for older saved documents. */
  show?: boolean;
};

/**
 * Page-level SEO metadata for dedicated documents (home, contact, enquire).
 * @deprecated Prefer {@link PageSeoMeta} — kept as an alias for existing imports.
 */
export type HomePageMeta = PageSeoMeta;

/** Optional SEO / JSON-LD extras stored with home content. */
export type HomeSeoContent = {
  organization?: {
    sameAs?: string[];
  };
  localBusiness?: {
    priceRange?: string;
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
    ratingValue?: string;
    reviewCount?: string;
  };
};

/** Full homepage CMS document stored in `pages.content_data` for slug `home`. */
export type HomePageContent = {
  kind: "home";
  /** Optional page-level SEO (admin-editable; used by public `generateMetadata`) */
  meta?: HomePageMeta;
  hero: HomeHeroContent;
  welcome: HomeWelcomeContent;
  video: HomeVideoSectionContent;
  gallery: HomeGallerySectionContent;
  whyRishikesh: HomeWhyRishikeshContent;
  courses: HomeCoursesSectionContent;
  yogaAlliance: HomeYogaAllianceContent;
  teachersTeaser: HomeTeachersTeaserContent;
  testimonials: HomeReviewsSectionContent;
  map: HomeMapSectionContent;
  faqs: HomeFaqsSectionContent;
  finalCta: HomeFinalCtaContent;
  seo?: HomeSeoContent;
};

export type ContactDetailItem = {
  title: string;
  value: string;
  href: string;
  actionText: string;
  /** Icon key: maps | whatsapp | email */
  iconKey: "maps" | "whatsapp" | "email";
};

/** Contact page CMS document (`slug=contact`). */
export type ContactPageContent = {
  kind: "contact";
  /** Optional page-level SEO (admin-editable; used by public `generateMetadata`) */
  meta?: PageSeoMeta;
  hero: SectionIdFields & {
    image: string;
    eyebrow: string;
    title: string;
    lead: string;
  };
  /** Optional `_id` / live for the details cards band (items stay a plain array) */
  detailsSection?: SectionIdFields;
  details: ContactDetailItem[];
  form: SectionIdFields & {
    eyebrow: string;
    title: string;
    lead: string;
    submitLabel: string;
  };
  map: SectionIdFields & {
    show: boolean;
  };
};

export type EnquireStep = {
  step: string;
  title: string;
  body: string;
};

export type BookingStep = EnquireStep;

/** Enquire-now CMS document (`slug=enquire-now`). */
export type EnquirePageContent = {
  kind: "enquire";
  /** Optional page-level SEO (admin-editable; used by public `generateMetadata`) */
  meta?: PageSeoMeta;
  hero: SectionIdFields & {
    image: string;
    eyebrow: string;
    title: string;
    lead: string;
  };
  /** Optional `_id` / live for the steps band (items stay a plain array) */
  stepsSection?: SectionIdFields;
  steps: EnquireStep[];
  form: SectionIdFields & {
    eyebrow: string;
    title: string;
    lead: string;
    submitLabel: string;
  };
  map: SectionIdFields & {
    show: boolean;
  };
};

/** Booking page CMS document (`slug=booking`). */
export type BookingPageContent = Omit<EnquirePageContent, "kind"> & {
  kind: "booking";
  steps: BookingStep[];
};

export type DedicatedPageContent =
  | HomePageContent
  | ContactPageContent
  | EnquirePageContent
  | BookingPageContent;

/**
 * Type guard for home content documents.
 *
 * @param value - Unknown content_data payload
 */
export function isHomePageContent(value: unknown): value is HomePageContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as HomePageContent).kind === "home"
  );
}

/**
 * Type guard for contact content documents.
 *
 * @param value - Unknown content_data payload
 */
export function isContactPageContent(
  value: unknown,
): value is ContactPageContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ContactPageContent).kind === "contact"
  );
}

/**
 * Type guard for enquire content documents.
 *
 * @param value - Unknown content_data payload
 */
export function isEnquirePageContent(
  value: unknown,
): value is EnquirePageContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as EnquirePageContent).kind === "enquire"
  );
}

/**
 * Type guard for booking content documents.
 *
 * @param value - Unknown content_data payload
 */
export function isBookingPageContent(
  value: unknown,
): value is BookingPageContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as BookingPageContent).kind === "booking"
  );
}
