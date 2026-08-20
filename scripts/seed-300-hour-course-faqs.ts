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

const COURSE_SLUG = "300-hour-yoga-teacher-training-in-rishikesh-india";
const ADMIN_TAG = "course";

type CourseFaqSeed = {
  question: string;
  answer: string;
  category: FaqCategoryId;
};

/** FAQs for the 300-hour yoga teacher training course page. */
const THREE_HUNDRED_HOUR_COURSE_FAQS: CourseFaqSeed[] = [
  {
    category: "general",
    question: "Do I need a 200-hour certificate to join this course?",
    answer:
      "Yes. This 300 Hour Yoga Teacher Training in Rishikesh builds on the foundation of a 200-hour program, so a Yoga Alliance recognized RYT-200 certificate is required before you apply.",
  },
  {
    category: "general",
    question: "Will this course make me eligible for RYT-500?",
    answer:
      "Yes, completing this 300 Hour Hatha, Ashtanga, Vinyasa & Ayurveda Teacher Training alongside your existing RYT-200 makes you eligible for RYT-500 registration with Yoga Alliance.",
  },
  {
    category: "general",
    question: "What styles of yoga are covered?",
    answer:
      "This program focuses on advanced Hatha and Ashtanga Vinyasa (Intermediate Series), along with pranayama, meditation, Ayurveda, and yoga therapy for a well-rounded 300 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training.",
  },
  {
    category: "general",
    question: "Is prior teaching experience required?",
    answer:
      "No prior teaching experience is needed. Many of our students come straight from their 200-hour training ready to deepen their practice and skills.",
  },
  {
    category: "general",
    question: "How physically demanding is this training?",
    answer:
      "This course is intended for intermediate to advanced practitioners, so expect longer practice sessions and more advanced postures than a 200-hour course. Come prepared for a program that challenges you both physically and mentally.",
  },
  {
    category: "general",
    question: "What is the class size like?",
    answer:
      "We keep our batches intimate so every trainee gets real attention from our teachers, which matters a great deal in a hands-on program like this.",
  },
  {
    category: "certification",
    question: "What certificate will I receive?",
    answer:
      "You will receive an official RYT-300 certificate recognized by Yoga Alliance, which combines with your existing RYT-200 to make you eligible for RYT-500.",
  },
  {
    category: "certification",
    question: "How is my progress assessed?",
    answer:
      "Through a mix of practical exams, written assessments, daily classroom participation, a final teaching assessment, and consistent attendance throughout the course.",
  },
  {
    category: "certification",
    question: "Is the teaching practicum mandatory?",
    answer:
      "Yes, the teaching seat assessment is a required part of your final evaluation and gives you real practice leading a class before you graduate.",
  },
  {
    category: "certification",
    question: "Can I fail the course?",
    answer:
      "Certification depends on sincere participation and consistent attendance rather than perfection. As long as you show up, engage, and put in genuine effort, you are well placed to complete the program successfully.",
  },
  {
    category: "certification",
    question: "Is this certification recognized worldwide?",
    answer:
      "Yes, Yoga Alliance certification through this Ayurveda Teacher Training in Rishikesh is recognized internationally, allowing you to teach and register your credentials globally.",
  },
  {
    category: "certification",
    question: "Do I get study materials as part of the course?",
    answer:
      "Yes, comprehensive manuals, textbooks, and Sanskrit guides are included in your fee, so you leave with resources you can keep referring back to.",
  },
  {
    category: "lodging-meals",
    question: "What are the room options?",
    answer:
      "We offer private rooms, 2-shared rooms, and 4-shared rooms, each designed for comfort during your stay in Rishikesh.",
  },
  {
    category: "lodging-meals",
    question: "What is included in my meals?",
    answer:
      "Three freshly cooked organic vegetarian meals are served daily, except Sundays, prepared with sattvic, Ayurveda-informed principles to support your energy through training.",
  },
  {
    category: "lodging-meals",
    question: "Can you accommodate dietary restrictions?",
    answer:
      "Yes, we happily accommodate vegan, gluten-free, allergy-related, and other dietary needs. Just let us know in advance or when you arrive.",
  },
  {
    category: "lodging-meals",
    question: "Is Wi-Fi available at the ashram?",
    answer:
      "Yes, high-speed Wi-Fi is available across the campus, included in your course fee at no extra cost.",
  },
  {
    category: "lodging-meals",
    question: "Do rooms have private bathrooms?",
    answer:
      "Most room types include an attached bathroom, and specific details for each room category are listed in our accommodation section.",
  },
  {
    category: "lodging-meals",
    question: "Is laundry service available?",
    answer:
      "Yes, paid laundry service is available on campus, along with amenities like hot water, purified drinking water, and heating or air conditioning as optional add-ons.",
  },
  {
    category: "travel-health",
    question: "Do I need a visa to attend this course?",
    answer:
      "Yes, a tourist visa or e-Visa is required for all international students. We recommend applying at least 15 to 30 days before your departure.",
  },
  {
    category: "travel-health",
    question: "How do I get to the school from the airport?",
    answer:
      "We offer complimentary pickup from Dehradun Airport (DED) or Haridwar Station once you share your arrival details with us in advance.",
  },
  {
    category: "travel-health",
    question: "What vaccinations or health precautions should I take?",
    answer:
      "We recommend checking with your doctor or a travel health clinic before your trip, since specific recommendations vary depending on where you are traveling from.",
  },
  {
    category: "travel-health",
    question: "Is Rishikesh safe for solo travelers?",
    answer:
      "Rishikesh is well used to welcoming international students and solo travelers, and our campus and staff are here to support you throughout your stay.",
  },
  {
    category: "travel-health",
    question: "Will I have access to medical support if needed?",
    answer:
      "Yes, local clinics and pharmacies are easily accessible near our campus, and our team is glad to help you find care if you ever need it during your stay.",
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
 * Removes prior 300-hour FAQ assignments and orphaned catalog rows.
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
 * Inserts catalog rows + page assignments for the 300-hour course FAQs.
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
 * Replaces 300-hour FAQs across catalog assignments, page modules, and course document.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const faqs = sortByCategoryOrder(THREE_HUNDRED_HOUR_COURSE_FAQS);
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
        `300-hour FAQ seed complete for "${COURSE_SLUG}" (page id=${row.id}).`,
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
