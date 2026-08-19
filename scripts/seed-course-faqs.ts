import {
  FAQ_CATEGORY_IDS,
  normalizeFaqCategory,
  type FaqCategoryId,
} from "../src/content/types/faq-categories";
import { normalizeFaqQuestion } from "../src/lib/cms/faq-utils";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

type CourseFaqSeed = {
  question: string;
  answer: string;
  category: FaqCategoryId;
};

const ADMIN_TAG = "course";

/** Standard course FAQ copy for residential YTT pages. */
const COURSE_FAQS: CourseFaqSeed[] = [
  {
    category: "general",
    question: "Do I need to be flexible or experienced to join?",
    answer:
      "Not at all! This course welcomes beginner to intermediate practitioners. Flexibility grows naturally with practice. All you need is an open heart and a sincere will to learn.",
  },
  {
    category: "general",
    question: "Is there a minimum age to join the course?",
    answer:
      "Yes, you must be at least 16 years old. The training asks for a level of maturity and readiness that comes with a bit more life experience.",
  },
  {
    category: "general",
    question: "How many students are in each batch?",
    answer:
      "We keep our groups intimate, usually 15 to 20 students, so every student gets personal attention and a real connection with teachers and classmates.",
  },
  {
    category: "general",
    question: "Do I need to speak fluent English to follow the classes?",
    answer:
      "A basic understanding of English is enough. Classes, discussions, and study material are all in English, so you'll be able to follow along and take part comfortably.",
  },
  {
    category: "general",
    question: "What does a typical day look like during the training?",
    answer:
      "Your day runs from around 6:00 AM to 7:45 PM, with sessions covering asana, pranayama, meditation, philosophy, anatomy, and teaching practice with proper breaks for meals in between.",
  },
  {
    category: "general",
    question: "Will I have any free time during the course?",
    answer:
      "Yes. While the schedule is immersive, you'll have breaks between sessions and evenings free to rest, journal, explore Rishikesh, or simply relax on your room's private balcony.",
  },
  {
    category: "certification",
    question: "Is this course recognized internationally?",
    answer:
      "Yes! Our 200-hour training is Yoga Alliance (USA) certified, so once you complete it, you can register as an RYT-200 and teach yoga anywhere in the world.",
  },
  {
    category: "certification",
    question: "How am I evaluated during the training?",
    answer:
      "Your journey is assessed through a practical exam, a written exam, classroom participation, and a live teaching assessment.",
  },
  {
    category: "certification",
    question: "What do I need to do to pass and get certified?",
    answer:
      "Sincere participation and consistent attendance throughout the training are the main requirements. Yoga is as much about discipline as it is about talent, so showing up matters most.",
  },
  {
    category: "certification",
    question: "Can I really teach yoga after finishing this course?",
    answer:
      "Absolutely. Once you complete the training and pass the assessments, you'll receive your RYT-200 certificate, register with Yoga Alliance, and be ready to teach anywhere.",
  },
  {
    category: "certification",
    question: "Will I receive study materials during the course?",
    answer:
      "Yes, you'll get comprehensive materials covering philosophy, asanas, meditation, anatomy, and teaching methodology to support your learning during and after the training.",
  },
  {
    category: "certification",
    question: "Do I need prior teaching experience to enroll?",
    answer:
      "No prior teaching experience is needed. This course is designed to build your teaching skills and confidence from the ground up.",
  },
  {
    category: "lodging-meals",
    question: "What kind of accommodation is included?",
    answer:
      "You can choose from a private room, or a 2, 3, or 4-shared room - each with a private or shared balcony, attached bathroom, hot water, and a peaceful setting away from city noise.",
  },
  {
    category: "lodging-meals",
    question: "Are meals included in the course fee?",
    answer:
      "Yes, all meals are included. You'll enjoy fresh, clean vegetarian food prepared with wholesome ingredients like whole grains, lentils, vegetables, and healing spices.",
  },
  {
    category: "lodging-meals",
    question: "Can you accommodate special diets like vegan or gluten-free?",
    answer:
      "Of course. Just let us know your dietary needs- vegan, gluten-free, or allergy-related, during booking or upon arrival, and we'll make the right arrangements.",
  },
  {
    category: "lodging-meals",
    question: "Is Wi-Fi available at the school?",
    answer:
      "Yes, free Wi-Fi is available across the property, along with facilities like a dining area, garden, terrace, and yoga hall.",
  },
  {
    category: "lodging-meals",
    question: "Is air conditioning or heating available in the rooms?",
    answer:
      "Yes, both are available as add-ons. Heaters and air conditioning are each available for an additional 100 USD.",
  },
  {
    category: "lodging-meals",
    question: "Is laundry service available?",
    answer:
      "Yes, we offer a paid laundry service so you can keep your yoga wear fresh throughout the training.",
  },
  {
    category: "travel-health",
    question: "What visa do I need to attend the training?",
    answer:
      "You'll need a tourist visa or e-Visa to join the course, available for durations of 30 to 180 days depending on the type you apply for.",
  },
  {
    category: "travel-health",
    question: "How do I get to the school from the airport?",
    answer:
      "Fly into New Delhi (DEL), then take a domestic flight to Dehradun (DED), where we offer free taxi pickup. We can also arrange pickup directly from Delhi for an additional 80 USD.",
  },
  {
    category: "travel-health",
    question: "What's the weather like in Rishikesh?",
    answer:
      "Rishikesh has three seasons: winter (October–February, coldest in December–January), summer (March–June, hottest in May–June), and the rainy season (July–September).",
  },
  {
    category: "travel-health",
    question: "Are shops and daily essentials easy to find near the school?",
    answer:
      "Yes, our school is in a peaceful area just a 10-minute walk from local shops, cafes, restaurants, and currency exchange centers.",
  },
  {
    category: "travel-health",
    question: "What happens if I get sick during the training?",
    answer:
      "Our team is attentive and supportive. From arranging local medical care to staying by your side if needed, your wellbeing is always a priority during your time with us.",
  },
  {
    category: "travel-health",
    question: "Can I get a local SIM card easily?",
    answer:
      "Yes, you can buy an Indian SIM card at the market or airport using your passport and ID for easy connectivity during your stay.",
  },
];

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
 * Inserts course FAQs into the catalog when the question is not already present.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    const existing = await client.query<{ question: string }>(
      `SELECT "question" FROM "faqs" WHERE "admin_tag" = $1`,
      [ADMIN_TAG],
    );
    const existingQuestions = new Set(
      existing.rows.map((row) => normalizeFaqQuestion(row.question)),
    );

    for (const faq of sortByCategoryOrder(COURSE_FAQS)) {
      const question = faq.question.trim();
      if (existingQuestions.has(normalizeFaqQuestion(question))) {
        skipped += 1;
        continue;
      }

      await client.query(
        `INSERT INTO "faqs"
          ("id", "question", "answer", "category", "admin_tag")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          createId(),
          question,
          faq.answer.trim(),
          normalizeFaqCategory(faq.category),
          ADMIN_TAG,
        ],
      );
      existingQuestions.add(normalizeFaqQuestion(question));
      inserted += 1;
    }

    console.log(
      `Course FAQ seed complete: inserted=${inserted}, skipped=${skipped}, total=${COURSE_FAQS.length}.`,
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
