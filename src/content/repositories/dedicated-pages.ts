import {
  DEFAULT_BOOKING_PAGE_CONTENT,
  DEFAULT_CONTACT_PAGE_CONTENT,
  DEFAULT_ENQUIRE_PAGE_CONTENT,
  DEFAULT_HOME_PAGE_CONTENT,
} from "@/content/data/dedicated-page-defaults";
import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type {
  BookingPageContent,
  ContactPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import {
  isBookingPageContent,
  isContactPageContent,
  isEnquirePageContent,
  isHomePageContent,
} from "@/content/types/dedicated-pages";
import type {
  HomeFaqsContent,
  ReviewsContent,
} from "@/content/types/shared-sections";
import { db } from "@/lib/db";

/**
 * Merges partial home content with defaults so public UI never regresses.
 *
 * @param value - Raw content_data
 */
export function normalizeHomeContent(value: unknown): HomePageContent {
  const base = structuredClone(DEFAULT_HOME_PAGE_CONTENT);
  if (!isHomePageContent(value)) return base;

  const heroVideo = {
    ...base.hero.video,
    ...(value.hero?.video ?? {}),
  };

  const welcomeVision = {
    ...base.welcome.vision,
    ...(value.welcome?.vision ?? {}),
  };
  const welcomePromise = {
    ...base.welcome.promise,
    ...(value.welcome?.promise ?? {}),
  };

  const whyVideoCard = {
    ...base.whyRishikesh.videoCard,
    ...(value.whyRishikesh?.videoCard ?? {}),
  };

  return {
    ...base,
    ...value,
    kind: "home",
    meta:
      value.meta != null || base.meta != null
        ? { ...base.meta, ...value.meta }
        : undefined,
    hero: {
      ...base.hero,
      ...value.hero,
      video: heroVideo,
      marqueeItems: value.hero?.marqueeItems?.length
        ? value.hero.marqueeItems
        : base.hero.marqueeItems,
      mobileTrust: value.hero?.mobileTrust?.length
        ? value.hero.mobileTrust
        : base.hero.mobileTrust,
    },
    welcome: {
      ...base.welcome,
      ...value.welcome,
      vision: welcomeVision,
      promise: welcomePromise,
      highlights: value.welcome?.highlights?.length
        ? value.welcome.highlights
        : base.welcome.highlights,
      rotatingStats: value.welcome?.rotatingStats?.length
        ? value.welcome.rotatingStats
        : base.welcome.rotatingStats,
      images: value.welcome?.images?.length
        ? value.welcome.images
        : base.welcome.images,
    },
    video: {
      ...base.video,
      ...value.video,
      youtubeUrls: value.video?.youtubeUrls?.length
        ? value.video.youtubeUrls
        : base.video.youtubeUrls,
    },
    gallery: {
      ...base.gallery,
      ...value.gallery,
      items: value.gallery?.items?.length
        ? value.gallery.items
        : base.gallery.items,
      categories: value.gallery?.categories?.length
        ? value.gallery.categories
        : base.gallery.categories,
    },
    whyRishikesh: {
      ...base.whyRishikesh,
      ...value.whyRishikesh,
      videoCard: whyVideoCard,
      trustLogos: value.whyRishikesh?.trustLogos?.length
        ? value.whyRishikesh.trustLogos
        : base.whyRishikesh.trustLogos,
      sutras: value.whyRishikesh?.sutras?.length
        ? value.whyRishikesh.sutras
        : base.whyRishikesh.sutras,
    },
    courses: {
      ...base.courses,
      ...value.courses,
      cards: value.courses?.cards?.length
        ? value.courses.cards
        : base.courses.cards,
    },
    yogaAlliance: {
      ...base.yogaAlliance,
      ...value.yogaAlliance,
      certifications: value.yogaAlliance?.certifications?.length
        ? value.yogaAlliance.certifications
        : base.yogaAlliance.certifications,
    },
    teachersTeaser: {
      ...base.teachersTeaser,
      ...(value.teachersTeaser ?? {}),
    },
    testimonials: {
      ...base.testimonials,
      ...(value.testimonials ?? {}),
      reviews: value.testimonials?.reviews?.length
        ? value.testimonials.reviews
        : base.testimonials.reviews,
    },
    map: { ...base.map, ...value.map },
    faqs: {
      ...base.faqs,
      ...(value.faqs ?? {}),
      faqs: value.faqs?.faqs?.length ? value.faqs.faqs : base.faqs.faqs,
    },
    finalCta: { ...base.finalCta, ...value.finalCta },
    seo: {
      ...base.seo,
      ...(value.seo ?? {}),
      organization: {
        ...base.seo?.organization,
        ...value.seo?.organization,
        sameAs: value.seo?.organization?.sameAs?.length
          ? value.seo.organization.sameAs
          : base.seo?.organization?.sameAs,
      },
      localBusiness: {
        ...base.seo?.localBusiness,
        ...value.seo?.localBusiness,
      },
    },
  };
}

/**
 * Merges partial contact content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeContactContent(value: unknown): ContactPageContent {
  if (!isContactPageContent(value)) {
    return structuredClone(DEFAULT_CONTACT_PAGE_CONTENT);
  }
  return {
    ...DEFAULT_CONTACT_PAGE_CONTENT,
    ...value,
    meta:
      value.meta != null
        ? { ...DEFAULT_CONTACT_PAGE_CONTENT.meta, ...value.meta }
        : (value.meta ?? DEFAULT_CONTACT_PAGE_CONTENT.meta),
    hero: { ...DEFAULT_CONTACT_PAGE_CONTENT.hero, ...value.hero },
    form: { ...DEFAULT_CONTACT_PAGE_CONTENT.form, ...value.form },
    map: { ...DEFAULT_CONTACT_PAGE_CONTENT.map, ...value.map },
    detailsSection: {
      ...DEFAULT_CONTACT_PAGE_CONTENT.detailsSection,
      ...value.detailsSection,
    },
    details:
      value.details?.length > 0
        ? value.details
        : DEFAULT_CONTACT_PAGE_CONTENT.details,
  };
}

/**
 * Merges partial enquire content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeEnquireContent(value: unknown): EnquirePageContent {
  if (!isEnquirePageContent(value)) {
    return structuredClone(DEFAULT_ENQUIRE_PAGE_CONTENT);
  }
  return {
    ...DEFAULT_ENQUIRE_PAGE_CONTENT,
    ...value,
    meta:
      value.meta != null
        ? { ...DEFAULT_ENQUIRE_PAGE_CONTENT.meta, ...value.meta }
        : (value.meta ?? DEFAULT_ENQUIRE_PAGE_CONTENT.meta),
    hero: { ...DEFAULT_ENQUIRE_PAGE_CONTENT.hero, ...value.hero },
    form: { ...DEFAULT_ENQUIRE_PAGE_CONTENT.form, ...value.form },
    map: { ...DEFAULT_ENQUIRE_PAGE_CONTENT.map, ...value.map },
    stepsSection: {
      ...DEFAULT_ENQUIRE_PAGE_CONTENT.stepsSection,
      ...value.stepsSection,
    },
    steps:
      value.steps?.length > 0
        ? value.steps
        : DEFAULT_ENQUIRE_PAGE_CONTENT.steps,
  };
}

/**
 * Merges partial booking content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeBookingContent(value: unknown): BookingPageContent {
  if (!isBookingPageContent(value)) {
    return structuredClone(DEFAULT_BOOKING_PAGE_CONTENT);
  }
  return {
    ...DEFAULT_BOOKING_PAGE_CONTENT,
    ...value,
    meta:
      value.meta != null
        ? { ...DEFAULT_BOOKING_PAGE_CONTENT.meta, ...value.meta }
        : (value.meta ?? DEFAULT_BOOKING_PAGE_CONTENT.meta),
    hero: { ...DEFAULT_BOOKING_PAGE_CONTENT.hero, ...value.hero },
    stepsSection: {
      ...DEFAULT_BOOKING_PAGE_CONTENT.stepsSection,
      ...value.stepsSection,
    },
    steps:
      value.steps?.length > 0
        ? value.steps
        : DEFAULT_BOOKING_PAGE_CONTENT.steps,
  };
}

/**
 * Hydrates home FAQs/reviews from legacy global_settings when missing on the page.
 *
 * @param content - Normalized home document
 */
async function hydrateHomeFromLegacySettings(
  content: HomePageContent,
): Promise<HomePageContent> {
  const needsFaqs = !content.faqs?.faqs?.length;
  const needsReviews = !content.testimonials?.reviews?.length;
  if (!needsFaqs && !needsReviews) return content;

  const next = structuredClone(content);

  if (needsFaqs) {
    const row = await db.globalSettings.findUnique({
      where: { key: "homeFaqs" },
      select: { value: true },
    });
    const faqs = (row?.value as HomeFaqsContent | null)?.faqs;
    if (faqs?.length) {
      next.faqs = {
        ...next.faqs,
        faqs,
      };
    }
  }

  if (needsReviews) {
    const row = await db.globalSettings.findUnique({
      where: { key: "reviews" },
      select: { value: true },
    });
    const reviews = (row?.value as ReviewsContent | null)?.reviews;
    if (reviews?.length) {
      next.testimonials = {
        ...next.testimonials,
        reviews,
      };
    }
  }

  // Teachers teaser from teacher page presentation when still default-empty title
  const teacherPage = await db.page.findUnique({
    where: { slug: "teacher" },
    select: { contentData: true },
  });
  const presentation = teacherPage?.contentData as
    | {
        homeEyebrow?: string;
        homeTitle?: string;
        homeDescription?: string;
      }
    | null
    | undefined;
  if (presentation?.homeTitle?.trim()) {
    next.teachersTeaser = {
      ...next.teachersTeaser,
      eyebrow: presentation.homeEyebrow?.trim() || next.teachersTeaser.eyebrow,
      title: presentation.homeTitle.trim(),
      description:
        presentation.homeDescription?.trim() || next.teachersTeaser.description,
    };
  }

  return next;
}

/**
 * Loads homepage CMS content from MySQL (with defaults + legacy GS hydrate).
 *
 * @param options - Optional repository options
 */
export async function getHomePageContent(
  options?: RepositoryOptions,
): Promise<ContentResult<HomePageContent>> {
  return requireDb(async () => {
    const page = await db.page.findUnique({
      where: { slug: "home" },
      select: { contentData: true },
    });
    const normalized = normalizeHomeContent(page?.contentData);
    return hydrateHomeFromLegacySettings(normalized);
  }, options);
}

/**
 * Loads contact page CMS content.
 *
 * @param options - Optional repository options
 */
export async function getContactPageContent(
  options?: RepositoryOptions,
): Promise<ContentResult<ContactPageContent>> {
  return requireDb(async () => {
    const page = await db.page.findUnique({
      where: { slug: "contact" },
      select: { contentData: true },
    });
    return normalizeContactContent(page?.contentData);
  }, options);
}

/**
 * Loads enquire-now CMS content.
 *
 * @param options - Optional repository options
 */
export async function getEnquirePageContent(
  options?: RepositoryOptions,
): Promise<ContentResult<EnquirePageContent>> {
  return requireDb(async () => {
    const page = await db.page.findUnique({
      where: { slug: "enquire-now" },
      select: { contentData: true },
    });
    return normalizeEnquireContent(page?.contentData);
  }, options);
}

/**
 * Loads booking page CMS content.
 *
 * @param options - Optional repository options
 */
export async function getBookingPageContent(
  options?: RepositoryOptions,
): Promise<ContentResult<BookingPageContent>> {
  return requireDb(async () => {
    const page = await db.page.findUnique({
      where: { slug: "booking" },
      select: { contentData: true },
    });
    return normalizeBookingContent(page?.contentData);
  }, options);
}
