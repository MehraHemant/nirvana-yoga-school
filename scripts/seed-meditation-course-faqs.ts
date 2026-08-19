import {
  normalizeFaqCategory,
  type FaqCategoryId,
} from "../src/content/types/faq-categories";
import { createEmptyPageModules } from "../src/content/page-modules-defaults";
import type { PageModulesDocument } from "../src/content/types/page-modules";
import type { FAQ } from "../src/content/types/shared";
import { parseJson, stringifyJson } from "../src/lib/db/json";
import { getPool } from "../src/lib/db/node";

const COURSE_SLUG =
  "200-hour-meditation-teacher-training-in-rishikesh-india";

type MeditationFaqSeed = {
  question: string;
  answer: string;
  category: FaqCategoryId;
};

/** FAQs for the 200-hour meditation teacher training course page. */
const MEDITATION_COURSE_FAQS: MeditationFaqSeed[] = [
  {
    category: "general",
    question: "Do I need prior yoga experience to join?",
    answer:
      "No prior teaching experience is needed. This training welcomes beginner to intermediate practitioners who are genuinely ready to learn and grow through daily practice.",
  },
  {
    category: "general",
    question:
      "Is this course only about meditation, or does it include physical yoga too?",
    answer:
      "Both. Alongside meditation, mantra chanting, and Yoga Nidra, you'll build a solid foundation in classical Hatha Yoga asana, so you graduate as a well-rounded teacher.",
  },
  {
    category: "general",
    question:
      "Is it difficult to sit for long meditation sessions if I'm not used to it?",
    answer:
      "It can feel challenging at first, especially if sitting still is new to you. We build up gradually through the course, and our teachers guide you through discomfort with patience rather than pressure.",
  },
  {
    category: "general",
    question: "What should I wear during training?",
    answer:
      "Comfortable, breathable clothing that allows easy movement works best for asana practice. For meditation and philosophy sessions, loose and modest clothing is appreciated, especially since some sessions take place in shared halls.",
  },
  {
    category: "general",
    question:
      "Will I learn how to design and lead a meditation script on my own?",
    answer:
      "Yes. A core part of this training is learning how to structure, write, and confidently guide your own Yoga Nidra and meditation sessions for future students.",
  },
  {
    category: "general",
    question: "How many students are typically in a batch?",
    answer:
      "We intentionally keep our batches small, so every student receives individual attention and correction, which matters even more in a meditation-focused training.",
  },
  {
    category: "certification",
    question: "What certification will I receive after completing the course?",
    answer:
      "You'll graduate with an official RYT-200 certificate from Yoga Alliance, with a specific focus on Meditation and Yoga Nidra, allowing you to teach and register internationally.",
  },
  {
    category: "certification",
    question: "Is the certificate recognized outside India?",
    answer:
      "Yes, Yoga Alliance certification is recognized globally, so you can register and teach in studios and wellness centres anywhere in the world.",
  },
  {
    category: "certification",
    question: "How is my progress actually assessed during the course?",
    answer:
      "Assessment happens gradually through practical exams, written examinations, classroom participation, and a final teaching seat evaluation, so no single test decides your outcome.",
  },
  {
    category: "certification",
    question: "What if I struggle with the written exam portion?",
    answer:
      "Our teachers are there to support you throughout, and written assessments are designed to check understanding, not to catch you out. Extra guidance is always available if you need it.",
  },
  {
    category: "certification",
    question: "Do I need to pass every single evaluation to get certified?",
    answer:
      "Certification depends on genuine engagement across the full program, including attendance, sincere practice, and consistent participation, rather than any one exam alone.",
  },
  {
    category: "certification",
    question: "Can I retake an assessment if I don't do well the first time?",
    answer:
      "Yes, our teachers work with you individually if any part of your evaluation needs more attention before certification is finalized.",
  },
  {
    category: "lodging-meals",
    question: "What are the room options available during the training?",
    answer:
      "You can choose between Triple Sharing, Double Sharing, Private Standard, or Private Deluxe rooms with a balcony, depending on your comfort and budget.",
  },
  {
    category: "lodging-meals",
    question: "Are meals included in the course fee?",
    answer:
      "Yes, three freshly cooked organic vegetarian meals are included daily, except on Sundays when the kitchen takes a rest day.",
  },
  {
    category: "lodging-meals",
    question: "Is the food suitable for common dietary restrictions?",
    answer:
      "Our kitchen prepares sattvic, whole-food vegetarian meals daily. If you have specific allergies or dietary needs, do let us know in advance so we can accommodate you where possible.",
  },
  {
    category: "lodging-meals",
    question: "Do the rooms have private bathrooms?",
    answer:
      "Most of our rooms come with attached bathrooms and hot water, and private balconies are available depending on which room category you choose.",
  },
  {
    category: "lodging-meals",
    question: "Is Wi-Fi available throughout the stay?",
    answer:
      "Yes, high-speed Wi-Fi is available across the campus, so you can stay connected with family while you're here.",
  },
  {
    category: "lodging-meals",
    question: "Is laundry service available on campus?",
    answer:
      "Yes, laundry service is available, with weekly access included depending on your room package.",
  },
  {
    category: "travel-health",
    question: "Do I need a visa to attend this course?",
    answer:
      "Yes, international students typically need a tourist or e-Visa to attend yoga courses in India. Apply at least a few weeks before your travel dates to avoid last-minute stress.",
  },
  {
    category: "travel-health",
    question: "How do I get from the airport to the school?",
    answer:
      "We offer pickup from Dehradun Airport or Haridwar railway station on request, arranged at cost price. Just share your arrival details with us in advance.",
  },
  {
    category: "travel-health",
    question: "Is Rishikesh safe for solo travelers?",
    answer:
      "Rishikesh is generally considered a safe and welcoming town for solo travelers, including women traveling alone, and our campus environment adds an extra layer of community and support.",
  },
  {
    category: "travel-health",
    question:
      "What vaccinations or health precautions should I take before arriving?",
    answer:
      "We recommend checking with a travel health professional in your home country for any recommended vaccinations before traveling to India, as requirements can vary based on your origin country.",
  },
  {
    category: "travel-health",
    question: "Will I have access to medical care if needed during the course?",
    answer:
      "Yes, local clinics and pharmacies are easily accessible from our campus, and our team can help you get to a doctor quickly if the need arises.",
  },
];

/**
 * Whether a value looks like a usable page modules document.
 *
 * @param value - Raw JSON from page_modules
 */
function isPageModulesDocument(
  value: unknown,
): value is PageModulesDocument {
  if (!value || typeof value !== "object") return false;
  const hero = (value as { hero?: unknown }).hero;
  if (!hero || typeof hero !== "object") return false;
  return typeof (hero as { type?: unknown }).type === "string";
}

/**
 * Maps seed rows into page module FAQ items.
 *
 * @param faqs - FAQ seed rows
 */
function toModuleItems(faqs: MeditationFaqSeed[]): FAQ[] {
  return faqs.map((faq) => ({
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    category: normalizeFaqCategory(faq.category),
  }));
}

/**
 * Resolves page modules for update, preserving existing content when valid.
 *
 * @param raw - Raw page_modules JSON from the database
 * @param pageType - CMS page type
 */
function resolveModulesForUpdate(
  raw: unknown,
  pageType: string,
): PageModulesDocument {
  const parsed = parseJson<unknown>(raw, null);
  if (isPageModulesDocument(parsed)) return parsed;

  const heroType =
    pageType === "course" || pageType === "retreat"
      ? "bento-media"
      : "page-minimal";
  return createEmptyPageModules(heroType);
}

/**
 * Writes meditation course FAQs into page_modules.faqs for the target slug.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    const page = await client.query<{
      id: string;
      slug: string;
      type: string;
      title: string;
      page_modules: unknown;
    }>(
      `SELECT "id", "slug", "type", "title", "page_modules"
       FROM "pages"
       WHERE "slug" = $1
       LIMIT 1`,
      [COURSE_SLUG],
    );

    if (!page.rowCount) {
      throw new Error(`Page not found for slug "${COURSE_SLUG}".`);
    }

    const row = page.rows[0];
    const modules = resolveModulesForUpdate(row.page_modules, row.type);
    const items = toModuleItems(MEDITATION_COURSE_FAQS);
    const updatedModules: PageModulesDocument = {
      ...modules,
      faqs: {
        ...modules.faqs,
        live: true,
        items,
      },
    };

    await client.query(
      `UPDATE "pages"
       SET "page_modules" = $1::jsonb, "updated_at" = CURRENT_TIMESTAMP
       WHERE "slug" = $2`,
      [stringifyJson(updatedModules), COURSE_SLUG],
    );

    const verify = await client.query<{
      faq_count: string;
      faqs_live: boolean | null;
      first_question: string | null;
      last_question: string | null;
    }>(
      `SELECT
         jsonb_array_length("page_modules"->'faqs'->'items')::text AS faq_count,
         ("page_modules"->'faqs'->>'live')::boolean AS faqs_live,
         "page_modules"->'faqs'->'items'->0->>'question' AS first_question,
         "page_modules"->'faqs'->'items'->-1->>'question' AS last_question
       FROM "pages"
       WHERE "slug" = $1`,
      [COURSE_SLUG],
    );

    const result = verify.rows[0];
    console.log(
      `Meditation course FAQ seed complete for "${COURSE_SLUG}" (page id=${row.id}).`,
    );
    console.log(
      `Updated page_modules.faqs: count=${result.faq_count}, live=${result.faqs_live}.`,
    );
    console.log(`First FAQ: ${result.first_question ?? "(none)"}`);
    console.log(`Last FAQ: ${result.last_question ?? "(none)"}`);
    console.log(
      "Note: run a deploy or save from admin to trigger Next.js cache revalidation.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
