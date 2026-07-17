/**
 * Upserts content_data for home, contact, and enquire-now.
 * Home FAQs/reviews are copied from global_settings when present.
 *
 * Run: `npx tsx scripts/seed-dedicated-pages.ts`
 * Also called from `prisma/seed.ts`.
 */
import {
  DEFAULT_CONTACT_PAGE_CONTENT,
  DEFAULT_ENQUIRE_PAGE_CONTENT,
  DEFAULT_HOME_PAGE_CONTENT,
} from "../src/content/data/dedicated-page-defaults";
import type { HomePageContent } from "../src/content/types/dedicated-pages";
import type {
  HomeFaqsContent,
  ReviewsContent,
} from "../src/content/types/shared-sections";
import { prisma } from "../src/lib/db/client";

type DedicatedSeed = {
  slug: string;
  title: string;
  content: object;
};

/**
 * Builds home content_data, preferring live GS FAQs/reviews when available.
 */
async function buildHomeContent(): Promise<HomePageContent> {
  const home = structuredClone(DEFAULT_HOME_PAGE_CONTENT);

  const [faqsRow, reviewsRow, teacherPage] = await Promise.all([
    prisma.globalSettings.findUnique({
      where: { key: "homeFaqs" },
      select: { value: true },
    }),
    prisma.globalSettings.findUnique({
      where: { key: "reviews" },
      select: { value: true },
    }),
    prisma.page.findUnique({
      where: { slug: "teacher" },
      select: { contentData: true },
    }),
  ]);

  const faqs = (faqsRow?.value as HomeFaqsContent | null)?.faqs;
  if (faqs?.length) {
    home.faqs = { ...home.faqs, faqs };
  }

  const reviews = (reviewsRow?.value as ReviewsContent | null)?.reviews;
  if (reviews?.length) {
    home.testimonials = { ...home.testimonials, reviews };
  }

  const presentation = teacherPage?.contentData as
    | {
        homeEyebrow?: string;
        homeTitle?: string;
        homeDescription?: string;
      }
    | null
    | undefined;
  if (presentation?.homeTitle?.trim()) {
    home.teachersTeaser = {
      ...home.teachersTeaser,
      eyebrow: presentation.homeEyebrow?.trim() || home.teachersTeaser.eyebrow,
      title: presentation.homeTitle.trim(),
      description:
        presentation.homeDescription?.trim() ||
        home.teachersTeaser.description,
    };
  }

  return home;
}

/**
 * Seeds dedicated page content_data documents.
 */
export async function seedDedicatedPages() {
  const homeContent = await buildHomeContent();

  const seeds: DedicatedSeed[] = [
    { slug: "home", title: "Home", content: homeContent },
    {
      slug: "contact",
      title: "Contact",
      content: DEFAULT_CONTACT_PAGE_CONTENT,
    },
    {
      slug: "enquire-now",
      title: "Enquire Now",
      content: DEFAULT_ENQUIRE_PAGE_CONTENT,
    },
  ];

  for (const seed of seeds) {
    await prisma.page.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        type: "site",
        title: seed.title,
        eyebrow: "Nirvana Yoga School",
        description: "",
        image: "",
        published: true,
        contentData: seed.content,
      },
      update: {
        type: "site",
        title: seed.title,
        published: true,
        contentData: seed.content,
      },
    });
    console.log(
      `seeded dedicated: ${seed.slug}`,
      seed.slug === "home"
        ? `(faqs=${homeContent.faqs.faqs.length}, reviews=${homeContent.testimonials.reviews.length}, gallery=${homeContent.gallery.items.length}, courses=${homeContent.courses.cards.length}, videos=${homeContent.video.youtubeUrls.length})`
        : "",
    );
  }
}

const isDirectRun = process.argv[1]?.includes("seed-dedicated-pages");

if (isDirectRun) {
  seedDedicatedPages()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
