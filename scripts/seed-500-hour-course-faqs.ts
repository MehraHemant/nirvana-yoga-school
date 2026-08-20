import {
  FAQ_CATEGORY_IDS,
  normalizeFaqCategory,
  type FaqCategoryId,
} from "../src/content/types/faq-categories";
import { createEmptyPageModules } from "../src/content/page-modules-defaults";
import type { PageModulesDocument } from "../src/content/types/page-modules";
import type { FAQ } from "../src/content/types/shared";
import { createId } from "../src/lib/db/ids";
import { parseJson, stringifyJson } from "../src/lib/db/json";
import { getPool } from "../src/lib/db/node";

const COURSE_SLUG = "500-hour-yoga-teacher-training-in-rishikesh-india";
const ADMIN_TAG = "course";

type CourseFaqSeed = {
  question: string;
  answer: string;
  category: FaqCategoryId;
};

/** FAQs for the 500-hour yoga teacher training course page. */
const FIVE_HUNDRED_HOUR_COURSE_FAQS: CourseFaqSeed[] = [
  {
    category: "general",
    question: "Do I need to be advanced to join the 500 Hour training?",
    answer:
      "Not at all. This program is designed to take you from the basics through to advanced study, so a steady personal practice is enough to begin. Many of our students join with just a year or two of regular yoga behind them.",
  },
  {
    category: "general",
    question: "Can I join if I have never taught before?",
    answer:
      "Yes. No prior teaching experience is required for this 500 Hour Yoga Teacher Training in Rishikesh. The teaching methodology and practicum modules are built specifically to take you from student to confident teacher.",
  },
  {
    category: "general",
    question:
      "How is the 500 Hour training different from doing the 200 and 300 Hour separately?",
    answer:
      "This program merges both curricula into one continuous 59-day residency, so there is no gap between your foundational and advanced study. You save time, and the learning flows in one connected arc rather than two separate trips.",
  },
  {
    category: "general",
    question: "Do I need any prior certification to enroll?",
    answer:
      "No previous certification is required. This 500 Hour Yoga Course in Rishikesh is structured to build you up from the ground level, though if you already hold a 200 Hour certificate, you are equally welcome.",
  },
  {
    category: "general",
    question: "What language are classes conducted in?",
    answer:
      "All classes, lectures, and practicums are conducted in English. A working understanding of the language will help you follow philosophy discussions and complete your teaching assessments comfortably.",
  },
  {
    category: "general",
    question: "Is there an age requirement to join?",
    answer:
      "Yes, applicants must be at least 15 years of age to join, given the physical and mental demands of two months of intensive ashram living and training.",
  },
  {
    category: "certification",
    question: "What certification will I receive?",
    answer:
      "On successful completion you will receive your RYT 500 Yoga Teacher Training certificate, recognized by Yoga Alliance and honored by studios and schools internationally.",
  },
  {
    category: "certification",
    question: "How is my progress assessed during the course?",
    answer:
      "Your growth is measured through a practical exam, written examinations, day-to-day classroom participation, a final teaching assessment, and consistent attendance throughout the program.",
  },
  {
    category: "certification",
    question: "Can I register with Yoga Alliance after completing this course?",
    answer:
      "Yes. Once you complete your Yoga Alliance RYT 500 Training and receive your certificate, you can register directly with Yoga Alliance as a 500 hour certified teacher.",
  },
  {
    category: "certification",
    question: "What happens if I fail an exam or assessment?",
    answer:
      "We look at your overall growth across the full 59 days rather than a single test. If any area needs more attention, our teachers work with you directly so you leave fully prepared and certified.",
  },
  {
    category: "certification",
    question: "Do I need to complete a final teaching demonstration?",
    answer:
      "Yes, the Teaching Seat Assessment is your final practice run before certification. You lead an actual class and receive supportive, constructive feedback to sharpen your teaching before you graduate.",
  },
  {
    category: "certification",
    question: "Is this certification enough to start teaching professionally?",
    answer:
      "Yes, an RYT 500 credential is one of the highest standard certifications in the yoga world and prepares you to teach general classes, specialized workshops, and even therapeutic sessions with confidence.",
  },
  {
    category: "lodging-meals",
    question: "What kind of rooms are available?",
    answer:
      "We offer triple sharing, double sharing, private standard, and private deluxe rooms with balcony, so you can choose the level of privacy and comfort that suits your budget and preference.",
  },
  {
    category: "lodging-meals",
    question: "Are meals included in the course fee?",
    answer:
      "Yes, three freshly cooked organic vegetarian meals are included daily, except Sundays, which are kept free for rest, laundry, and personal time.",
  },
  {
    category: "lodging-meals",
    question: "Can you accommodate dietary restrictions?",
    answer:
      "Absolutely. If you follow a vegan, gluten-free, or allergy-conscious diet, just tell us when you book or when you arrive and our kitchen will adjust your meals accordingly.",
  },
  {
    category: "lodging-meals",
    question: "Is Wi-Fi available on campus?",
    answer:
      "Yes, high-speed Wi-Fi is included across the campus, so you can stay connected with home during your stay.",
  },
  {
    category: "lodging-meals",
    question: "Do rooms have air conditioning or heating?",
    answer:
      "Air conditioning and heating are available as optional add-ons for an extra cost, useful depending on which season you are training in.",
  },
  {
    category: "lodging-meals",
    question: "Is laundry service available?",
    answer:
      "Yes, paid laundry service is available on campus, so you do not need to worry about washing your training clothes by hand.",
  },
  {
    category: "travel-health",
    question: "What happens if I get sick during the training?",
    answer:
      "Your wellbeing comes first. Our team helps arrange local medical care if needed, and our teachers are understanding about adjusting your practice schedule while you recover.",
  },
  {
    category: "travel-health",
    question: "Do I need travel insurance?",
    answer:
      "We strongly recommend it. Comprehensive travel insurance covering medical care and trip interruptions gives you peace of mind for the full 59 days of your stay.",
  },
  {
    category: "travel-health",
    question: "Can I take a break between the two months?",
    answer:
      "The program runs as one continuous 59-day residency without a break built in, so we ask students to plan for the full duration when booking their travel.",
  },
  {
    category: "travel-health",
    question: "Do I need any vaccinations before traveling to India?",
    answer:
      "Requirements vary by country of origin, so we recommend checking with a travel clinic or your doctor a few weeks before departure for personalized guidance.",
  },
  {
    category: "travel-health",
    question: "How do I get from the airport to the school?",
    answer:
      "We arrange complimentary pickup from Dehradun Airport (DED), and transfers from Haridwar station are available on request at cost price. Just reach out to us on WhatsApp once your travel dates are confirmed.",
  },
];

type PgClient = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rowCount: number | null; rows: Array<Record<string, unknown>> }>;
};

/**
 * Sorts seed rows in fixed category order.
 *
 * @param faqs - FAQ seed rows
 */
function sortByCategoryOrder(faqs: CourseFaqSeed[]): CourseFaqSeed[] {
  return [...faqs].sort(
    (a, b) =>
      FAQ_CATEGORY_IDS.indexOf(a.category) -
      FAQ_CATEGORY_IDS.indexOf(b.category),
  );
}

/**
 * Maps seed rows into page module FAQ items.
 *
 * @param faqs - FAQ seed rows
 */
function toModuleItems(faqs: CourseFaqSeed[]): FAQ[] {
  return faqs.map((faq) => ({
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    category: normalizeFaqCategory(faq.category),
  }));
}

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
 * Removes prior page FAQ assignments and orphaned catalog rows.
 *
 * @param client - Postgres client
 * @param slug - Page slug
 */
async function removeLegacyPageFaqs(
  client: PgClient,
  slug: string,
): Promise<number> {
  const orphaned = await client.query(
    `SELECT f."id"
     FROM "faqs" f
     INNER JOIN "page_faq_assignments" a ON a."faq_id" = f."id"
     WHERE a."context_type" = 'page'
       AND a."context_key" = $1
       AND NOT EXISTS (
         SELECT 1
         FROM "page_faq_assignments" a2
         WHERE a2."faq_id" = f."id"
           AND (a2."context_key" <> $1 OR a2."context_type" <> 'page')
       )`,
    [slug],
  );

  await client.query(
    `DELETE FROM "page_faq_assignments"
     WHERE "context_type" = 'page' AND "context_key" = $1`,
    [slug],
  );

  let removed = 0;
  for (const row of orphaned.rows) {
    const result = await client.query(`DELETE FROM "faqs" WHERE "id" = $1`, [
      row.id,
    ]);
    removed += result.rowCount ?? 0;
  }

  return removed;
}

/**
 * Inserts catalog rows + page assignments for course FAQs.
 *
 * @param client - Postgres client
 * @param slug - Page slug
 * @param faqs - FAQ seed rows
 */
async function insertCatalogAndAssignments(
  client: PgClient,
  slug: string,
  faqs: CourseFaqSeed[],
): Promise<number> {
  let created = 0;

  for (const [index, faq] of faqs.entries()) {
    const faqId = createId();
    await client.query(
      `INSERT INTO "faqs"
        ("id", "question", "answer", "category", "admin_tag")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        faqId,
        faq.question.trim(),
        faq.answer.trim(),
        normalizeFaqCategory(faq.category),
        ADMIN_TAG,
      ],
    );

    await client.query(
      `INSERT INTO "page_faq_assignments"
        ("id", "context_type", "context_key", "faq_id", "sort_order", "extras")
       VALUES ($1, 'page', $2, $3, $4, '{}'::jsonb)`,
      [createId(), slug, faqId, index * 10],
    );

    created += 1;
  }

  return created;
}

/**
 * Replaces 500-hour FAQs across catalog assignments, page modules, and course document.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const faqs = sortByCategoryOrder(FIVE_HUNDRED_HOUR_COURSE_FAQS);
  const moduleItems = toModuleItems(faqs);
  const pool = getPool();
  const client = await pool.connect();

  try {
    const page = await client.query(
      `SELECT "id", "slug", "type", "page_modules"
       FROM "pages"
       WHERE "slug" = $1
       LIMIT 1`,
      [COURSE_SLUG],
    );

    if (!page.rowCount) {
      throw new Error(`Page not found for slug "${COURSE_SLUG}".`);
    }

    const row = page.rows[0] as {
      id: string;
      slug: string;
      type: string;
      page_modules: unknown;
    };
    const modules = resolveModulesForUpdate(row.page_modules, row.type);
    const updatedModules: PageModulesDocument = {
      ...modules,
      faqs: {
        ...modules.faqs,
        live: true,
        items: moduleItems,
      },
    };

    await client.query("BEGIN");
    try {
      const removed = await removeLegacyPageFaqs(client, COURSE_SLUG);
      const created = await insertCatalogAndAssignments(client, COURSE_SLUG, faqs);

      await client.query(
        `UPDATE "pages"
         SET "page_modules" = $1::jsonb, "updated_at" = CURRENT_TIMESTAMP
         WHERE "slug" = $2`,
        [stringifyJson(updatedModules), COURSE_SLUG],
      );

      await client.query(
        `UPDATE "course_documents" cd
         SET "document" = jsonb_set(
           cd."document",
           '{faqs}',
           $1::jsonb,
           true
         )
         FROM "pages" p
         WHERE p."id" = cd."page_id"
           AND p."slug" = $2`,
        [stringifyJson(moduleItems), COURSE_SLUG],
      );

      await client.query("COMMIT");

      const verify = await client.query(
        `SELECT
           jsonb_array_length(p."page_modules"->'faqs'->'items')::text AS module_faq_count,
           jsonb_array_length(cd."document"->'faqs')::text AS doc_faq_count,
           (
             SELECT COUNT(*)::text
             FROM "page_faq_assignments" a
             WHERE a."context_type" = 'page' AND a."context_key" = p."slug"
           ) AS assignment_count,
           (p."page_modules"->'faqs'->>'live')::boolean AS faqs_live,
           (
             SELECT jsonb_object_agg(category, cnt)
             FROM (
               SELECT item->>'category' AS category, COUNT(*)::int AS cnt
               FROM jsonb_array_elements(p."page_modules"->'faqs'->'items') AS item
               GROUP BY item->>'category'
             ) AS grouped
           ) AS category_counts
         FROM "pages" p
         LEFT JOIN "course_documents" cd ON cd."page_id" = p."id"
         WHERE p."slug" = $1`,
        [COURSE_SLUG],
      );

      const result = verify.rows[0] as {
        module_faq_count: string;
        doc_faq_count: string;
        assignment_count: string;
        faqs_live: boolean | null;
        category_counts: Record<string, number> | null;
      };
      console.log(
        `500-hour FAQ seed complete for "${COURSE_SLUG}" (page id=${row.id}).`,
      );
      console.log(
        `Removed ${removed} legacy catalog row(s); inserted ${created} new FAQ(s).`,
      );
      console.log(
        `Synced module=${result.module_faq_count}, document=${result.doc_faq_count}, assignments=${result.assignment_count}, live=${result.faqs_live}.`,
      );
      console.log(
        `Category counts: ${JSON.stringify(result.category_counts ?? {})}`,
      );
      console.log(
        "Note: run a deploy or save from admin to trigger Next.js cache revalidation.",
      );
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
