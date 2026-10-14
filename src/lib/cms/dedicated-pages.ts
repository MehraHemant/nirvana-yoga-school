import {
  normalizeBookingContent,
  normalizeContactContent,
  normalizeEnquireContent,
  normalizeHomeContent,
} from "@/content/repositories/dedicated-pages";
import { upsertPageSeo } from "@/content/repositories/page-seo";
import type {
  DedicatedPageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import type {
  HomeFaqsContent,
  ReviewsContent,
} from "@/content/types/shared-sections";
import { invalidateAndRevalidatePage } from "@/lib/cms/cache";
import {
  createEmptyBookingPageContent,
  createEmptyContactPageContent,
  createEmptyEnquirePageContent,
  createEmptyHomePageContent,
} from "@/lib/cms/structural-defaults";
import { db } from "@/lib/db";

const DEDICATED_SLUGS = ["home", "contact", "enquire-now", "booking"] as const;
export type DedicatedPageSlug = (typeof DEDICATED_SLUGS)[number];

/**
 * Whether a slug uses a dedicated content_data editor.
 *
 * @param slug - Page slug
 */
export function isDedicatedPageSlug(slug: string): slug is DedicatedPageSlug {
  return (DEDICATED_SLUGS as readonly string[]).includes(slug);
}

/**
 * Default document for a dedicated slug.
 *
 * @param slug - Dedicated page slug
 */
export function defaultDedicatedContent(
  slug: DedicatedPageSlug,
): DedicatedPageContent {
  switch (slug) {
    case "home":
      return structuredClone(createEmptyHomePageContent());
    case "booking":
      return structuredClone(createEmptyBookingPageContent());
    case "contact":
      return structuredClone(createEmptyContactPageContent());
    case "enquire-now":
      return structuredClone(createEmptyEnquirePageContent());
  }
}

/**
 * Parse stored content_data into a typed dedicated document with defaults.
 *
 * @param slug - Dedicated page slug
 * @param raw - Raw JSON from MySQL
 */
export function parseDedicatedContent(
  slug: DedicatedPageSlug,
  raw: unknown,
): DedicatedPageContent {
  if (slug === "home") return normalizeHomeContent(raw);
  if (slug === "contact") return normalizeContactContent(raw);
  if (slug === "booking") return normalizeBookingContent(raw);
  return normalizeEnquireContent(raw);
}

/**
 * Fills home FAQs / reviews / teachers teaser from existing DB rows when absent.
 *
 * @param content - Normalized home document
 */
async function hydrateHomeFromDatabase(
  content: HomePageContent,
): Promise<HomePageContent> {
  const next = structuredClone(content);

  if (!next.faqs?.faqs?.length) {
    const row = await db.globalSettings.findUnique({
      where: { key: "homeFaqs" },
      select: { value: true },
    });
    const faqs = (row?.value as HomeFaqsContent | null)?.faqs;
    if (faqs?.length) next.faqs = { ...next.faqs, faqs };
  }

  if (!next.testimonials?.reviews?.length) {
    const row = await db.globalSettings.findUnique({
      where: { key: "reviews" },
      select: { value: true },
    });
    const reviews = (row?.value as ReviewsContent | null)?.reviews;
    if (reviews?.length) {
      next.testimonials = { ...next.testimonials, reviews };
    }
  }

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
 * Load dedicated page content from MySQL (or defaults if missing).
 * Home also pulls FAQs/reviews/teachers teaser from existing DB rows when needed.
 *
 * @param slug - Dedicated page slug
 */
export async function loadDedicatedPageContent(
  slug: DedicatedPageSlug,
): Promise<DedicatedPageContent> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { contentData: true },
  });
  const parsed = parseDedicatedContent(slug, page?.contentData);
  if (slug === "home") {
    return hydrateHomeFromDatabase(parsed as HomePageContent);
  }
  return parsed;
}

/**
 * Persist dedicated page content_data without wiping relational rows.
 *
 * @param slug - Dedicated page slug
 * @param content - Typed CMS document
 */
export async function saveDedicatedPageContent(
  slug: DedicatedPageSlug,
  content: DedicatedPageContent,
): Promise<string> {
  const title =
    slug === "home"
      ? "Home"
      : slug === "contact"
        ? "Contact"
        : slug === "booking"
          ? "Booking"
          : "Enquire Now";

  const page = await db.page.upsert({
    where: { slug },
    create: {
      slug,
      type: "site",
      title,
      eyebrow: "Nirvana Yoga School",
      description: "",
      image: "",
      published: true,
      contentData: content,
    },
    update: {
      type: "site",
      title,
      published: true,
      contentData: content,
    },
    select: { id: true },
  });

  invalidateAndRevalidatePage(slug, "site");
  if ("meta" in content) {
    await upsertPageSeo(slug, content.meta).catch((error) => {
      console.error("[dedicated-pages] page SEO sync failed", error);
    });
  }
  return page.id;
}
