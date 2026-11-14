import { normalizeHomeCourseRefs } from "@/content/mappers/home-courses";
import { requireDb } from "@/content/repositories/db-fallback";
import { resolveGlobalFaqs } from "@/content/repositories/faqs";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type {
  AffiliatePageContent,
  BookingPageContent,
  ContactPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import {
  isAffiliatePageContent,
  isBookingPageContent,
  isContactPageContent,
  isEnquirePageContent,
  isHomePageContent,
} from "@/content/types/dedicated-pages";
import type {
  HomeFaqsContent,
  ReviewsContent,
} from "@/content/types/shared-sections";
import {
  createEmptyAffiliatePageContent,
  createEmptyBookingPageContent,
  createEmptyContactPageContent,
  createEmptyEnquirePageContent,
  createEmptyHomePageContent,
} from "@/lib/cms/structural-defaults";
import { db } from "@/lib/db";

/**
 * Merges partial home content with defaults so public UI never regresses.
 *
 * @param value - Raw content_data
 */
export function normalizeHomeContent(value: unknown): HomePageContent {
  const base = structuredClone(createEmptyHomePageContent());
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
    authenticYoga: {
      ...base.authenticYoga,
      ...value.authenticYoga,
      paragraphs: value.authenticYoga?.paragraphs?.length
        ? value.authenticYoga.paragraphs
        : base.authenticYoga.paragraphs,
      videos: value.authenticYoga?.videos?.length
        ? value.authenticYoga.videos
        : base.authenticYoga.videos,
    },
    courses: {
      ...base.courses,
      ...value.courses,
      placements:
        value.courses?.placements?.length || value.courses?.cards?.length
          ? normalizeHomeCourseRefs({
              ...base.courses,
              ...value.courses,
              placements: value.courses?.placements,
              cards: value.courses?.cards,
            })
          : base.courses.placements,
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
    return structuredClone(createEmptyContactPageContent());
  }
  const base = createEmptyContactPageContent();
  return {
    ...base,
    ...value,
    meta:
      value.meta != null
        ? { ...base.meta, ...value.meta }
        : (value.meta ?? base.meta),
    hero: { ...base.hero, ...value.hero },
    form: { ...base.form, ...value.form },
    map: { ...base.map, ...value.map },
    detailsSection: {
      ...base.detailsSection,
      ...value.detailsSection,
    },
    details: value.details?.length > 0 ? value.details : base.details,
  };
}

/**
 * Merges partial affiliate content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeAffiliateContent(
  value: unknown,
): AffiliatePageContent {
  const base = createEmptyAffiliatePageContent();
  if (!isAffiliatePageContent(value)) return structuredClone(base);
  const rate = Number(value.commissionRate);
  return {
    ...base,
    ...value,
    commissionRate: Number.isFinite(rate) && rate > 0 ? rate : 10,
    hero: {
      ...base.hero,
      ...value.hero,
      chips: value.hero?.chips ?? base.hero.chips,
    },
    stats: value.stats ?? base.stats,
    tracksSection: { ...base.tracksSection, ...value.tracksSection },
    tracks: (value.tracks ?? []).map((track) => ({
      ...track,
      steps: track.steps ?? [],
    })),
    calculator: {
      ...base.calculator,
      ...value.calculator,
      programs: (value.calculator?.programs ?? []).filter(
        (program) => program.label && Number(program.feeUsd) > 0,
      ),
    },
    benefitsSection: { ...base.benefitsSection, ...value.benefitsSection },
    benefits: value.benefits ?? base.benefits,
    reviews: { ...base.reviews, ...value.reviews },
    faqsSection: { ...base.faqsSection, ...value.faqsSection },
    faqs: value.faqs ?? base.faqs,
    form: {
      ...base.form,
      ...value.form,
      platforms: value.form?.platforms ?? base.form.platforms,
    },
  };
}

/**
 * Loads become-an-affiliate CMS content.
 *
 * @param options - Optional repository options
 */
export async function getAffiliatePageContent(
  options?: RepositoryOptions,
): Promise<ContentResult<AffiliatePageContent>> {
  return requireDb(async () => {
    const page = await db.page.findUnique({
      where: { slug: AFFILIATE_SLUG },
      select: { contentData: true },
    });
    return normalizeAffiliateContent(page?.contentData);
  }, options);
}

/** Public slug of the affiliate programme page. */
export const AFFILIATE_SLUG = "become-an-affiliate";

/**
 * Merges partial enquire content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeEnquireContent(value: unknown): EnquirePageContent {
  if (!isEnquirePageContent(value)) {
    return structuredClone(createEmptyEnquirePageContent());
  }
  const base = createEmptyEnquirePageContent();
  return {
    ...base,
    ...value,
    meta:
      value.meta != null
        ? { ...base.meta, ...value.meta }
        : (value.meta ?? base.meta),
    hero: { ...base.hero, ...value.hero },
    form: { ...base.form, ...value.form },
    map: { ...base.map, ...value.map },
    stepsSection: {
      ...base.stepsSection,
      ...value.stepsSection,
    },
    steps: value.steps?.length > 0 ? value.steps : base.steps,
  };
}

/**
 * Merges partial booking content with defaults.
 *
 * @param value - Raw content_data
 */
export function normalizeBookingContent(value: unknown): BookingPageContent {
  if (!isBookingPageContent(value)) {
    return structuredClone(createEmptyBookingPageContent());
  }
  const base = createEmptyBookingPageContent();
  return {
    ...base,
    ...value,
    meta:
      value.meta != null
        ? { ...base.meta, ...value.meta }
        : (value.meta ?? base.meta),
    hero: { ...base.hero, ...value.hero },
    stepsSection: {
      ...base.stepsSection,
      ...value.stepsSection,
    },
    steps: value.steps?.length > 0 ? value.steps : base.steps,
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
  const needsReviews = !content.testimonials?.reviews?.length;

  const next = structuredClone(content);
  const faqResult = await resolveGlobalFaqs("homeFaqs", next.faqs?.faqs ?? []);
  next.faqs = {
    ...next.faqs,
    faqs: faqResult.data,
  };

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
