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
      "No. This training welcomes beginners as well as intermediate practitioners. What matters more than experience is your willingness to learn and practice sincerely each day.",
  },
  {
    category: "general",
    question: "Do I need any background in Ayurveda before starting?",
    answer:
      "Not at all. This 200 Hour Ayurveda Yoga Teacher Training is designed to introduce you to Ayurveda from the ground up, alongside your Hatha Yoga training.",
  },
  {
    category: "general",
    question: "How physically demanding is the training?",
    answer:
      "Expect two structured practice sessions a day along with lectures, so a reasonable level of physical readiness helps. That said, the pace is built for a range of practitioners, not just advanced ones.",
  },
  {
    category: "general",
    question: "Can I join if English isn't my first language?",
    answer:
      "Yes, as long as you're comfortable enough to follow classes and take part in discussions. Many of our students study in their second or third language.",
  },
  {
    category: "certification",
    question: "What certification do I receive after completing the course?",
    answer:
      "You'll receive an RYT 200 Yoga Teacher Training in Rishikesh certificate, recognized internationally through Yoga Alliance.",
  },
  {
    category: "certification",
    question: "Will I be certified as an Ayurvedic doctor or practitioner?",
    answer:
      "No, this program teaches Ayurvedic principles as they apply to yoga and wellness. It does not certify you as a clinical Ayurvedic practitioner.",
  },
  {
    category: "certification",
    question: "How is my progress assessed during the course?",
    answer:
      "Through a mix of a practical exam, written examinations, classroom participation, and a final teaching assessment, so no single test decides your outcome.",
  },
  {
    category: "certification",
    question: "What happens if I miss a few classes?",
    answer:
      "Regular attendance matters for certification, so we ask students to keep absences to a minimum and speak with us if something comes up.",
  },
  {
    category: "certification",
    question: "Can I use this certification to teach internationally?",
    answer:
      "Yes, Yoga Alliance certification is recognised in most countries, so you can register as a teacher wherever you plan to teach.",
  },
  {
    category: "certification",
    question:
      "Is the certification only for Hatha Yoga, or does it include Ayurveda too?",
    answer:
      "Your certificate reflects the full 200 Hour Ayurveda Yoga Teacher Training curriculum, covering both Hatha Yoga and Ayurvedic studies.",
  },
  {
    category: "lodging-meals",
    question: "What kind of rooms are available?",
    answer:
      "You can choose from private rooms, 2-shared rooms, or 4-shared rooms depending on your budget and preference for company or privacy.",
  },
  {
    category: "lodging-meals",
    question: "Is the food vegetarian?",
    answer:
      "Yes, all meals served are vegetarian and prepared according to sattvic, Ayurvedic principles.",
  },
  {
    category: "lodging-meals",
    question: "Can you accommodate dietary restrictions?",
    answer:
      "Yes, whether you're vegan, gluten-free, or managing allergies, just let us know in advance and we'll arrange meals that work for you.",
  },
  {
    category: "lodging-meals",
    question: "Is Wi-Fi available on campus?",
    answer:
      "Yes, high-speed Wi-Fi is included and accessible across the ashram.",
  },
  {
    category: "lodging-meals",
    question: "Is air conditioning or heating available in rooms?",
    answer:
      "Heaters and air conditioning are available as optional add-ons for an extra charge, depending on the season you're training in.",
  },
  {
    category: "travel-health",
    question: "Do I need a visa to attend this course?",
    answer:
      "Yes, most international students apply for a tourist or e-Visa, valid for 30 to 180 days depending on nationality.",
  },
  {
    category: "travel-health",
    question: "How do I get from the airport to the school?",
    answer:
      "We arrange pickups from Dehradun Airport or Haridwar station at cost price. Just share your travel details with us on WhatsApp once booked.",
  },
  {
    category: "travel-health",
    question: "Should I get travel insurance?",
    answer:
      "We recommend it, as with any international trip, particularly one that includes a physically active residential program.",
  },
  {
    category: "travel-health",
    question: "What vaccinations or health precautions should I consider?",
    answer:
      "We suggest checking with a travel doctor a few weeks before your trip for any recommended vaccinations based on your home country's guidelines.",
  },
  {
    category: "travel-health",
    question: "Is Rishikesh safe for solo travellers?",
    answer:
      "Yes, Rishikesh is a well-known destination for yoga students and travellers from around the world, and Upper Tapovan in particular has a quiet, welcoming atmosphere.",
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
      category_counts: Record<string, number> | null;
    }>(
      `SELECT
         jsonb_array_length("page_modules"->'faqs'->'items')::text AS faq_count,
         ("page_modules"->'faqs'->>'live')::boolean AS faqs_live,
         "page_modules"->'faqs'->'items'->0->>'question' AS first_question,
         "page_modules"->'faqs'->'items'->-1->>'question' AS last_question,
         (
           SELECT jsonb_object_agg(category, cnt)
           FROM (
             SELECT item->>'category' AS category, COUNT(*)::int AS cnt
             FROM jsonb_array_elements("page_modules"->'faqs'->'items') AS item
             GROUP BY item->>'category'
           ) AS grouped
         ) AS category_counts
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
    console.log(`Category counts: ${JSON.stringify(result.category_counts ?? {})}`);
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
