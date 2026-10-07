import { createDefaultQuizSettings } from "../src/content/types/quiz";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

type QuizSeed = {
  prompt: string;
  options: string[];
  /** Index of the right answer in `options` as written here. */
  correctIndex: number;
};

/** Starter questions that shipped with the first version of the quiz. */
const QUIZ_QUESTIONS: QuizSeed[] = [
  {
    prompt:
      "In which Indian city is Nirvana Yoga School traditionally located?",
    options: ["Rishikesh", "Goa", "Jaipur", "Varanasi"],
    correctIndex: 0,
  },
  {
    prompt: "What does “Hatha” yoga primarily emphasize?",
    options: [
      "Physical postures and breath",
      "Devotional chanting only",
      "Strict silence retreats",
      "Competitive gymnastics",
    ],
    correctIndex: 0,
  },
  {
    prompt:
      "Which limb of Patanjali’s eight-fold path focuses on ethical conduct toward others?",
    options: ["Yama", "Niyama", "Pranayama", "Samadhi"],
    correctIndex: 0,
  },
  {
    prompt: "“Pranayama” is best described as:",
    options: [
      "Regulation of breath and life force",
      "A type of headstand",
      "A vegetarian diet plan",
      "Temple pilgrimage",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Surya Namaskar is commonly known in English as:",
    options: ["Sun Salutation", "Moon Rest", "Warrior Flow", "Lotus Seal"],
    correctIndex: 0,
  },
  {
    prompt: "Which chakra is associated with the heart center?",
    options: ["Anahata", "Muladhara", "Vishuddha", "Manipura"],
    correctIndex: 0,
  },
  {
    prompt: "A typical 200-hour YTT curriculum often includes:",
    options: [
      "Anatomy, philosophy, and teaching methodology",
      "Only advanced arm balances",
      "Surf lessons and nightlife tours",
      "Certification without practice hours",
    ],
    correctIndex: 0,
  },
  {
    prompt: "“Namaste” is generally understood to mean:",
    options: [
      "The light in me honors the light in you",
      "See you tomorrow",
      "Begin the warm-up",
      "Final relaxation pose",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Shavasana at the end of class is:",
    options: [
      "Corpse pose for deep rest",
      "A standing balance",
      "A breathing retention drill",
      "A partner inversion",
    ],
    correctIndex: 0,
  },
  {
    prompt:
      "The Ganges (Ganga) river is spiritually significant to many yogis visiting Rishikesh because it is seen as:",
    options: [
      "A sacred river for purification and devotion",
      "The source of all yoga props",
      "A modern spa district",
      "An ancient Olympic site",
    ],
    correctIndex: 0,
  },
];

/**
 * Rotates options so the right answer is not always in the same position.
 *
 * @param seed - Question as written
 * @param shift - Positions to rotate by
 */
function rotate(seed: QuizSeed, shift: number) {
  const count = seed.options.length;
  const options = seed.options.map(
    (_, index) => seed.options[(index - shift + count * 2) % count],
  );
  return { options, correctIndex: (seed.correctIndex + shift) % count };
}

/**
 * Creates the quiz tables, saves default quiz settings, and adds the starter
 * questions. Existing settings and questions are left untouched.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "quiz_questions" (
        "id" TEXT PRIMARY KEY,
        "prompt" TEXT NOT NULL,
        "prompt_image_url" TEXT NOT NULL DEFAULT '',
        "option_type" TEXT NOT NULL DEFAULT 'text',
        "options" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "correct_index" INTEGER NOT NULL,
        "explanation" TEXT NOT NULL DEFAULT '',
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const settings = await client.query(
      `INSERT INTO "global_settings" ("id", "key", "value", "updated_at")
       VALUES ($1, 'quiz', $2::jsonb, NOW())
       ON CONFLICT ("key") DO NOTHING
       RETURNING "key"`,
      [createId(), JSON.stringify(createDefaultQuizSettings())],
    );

    const existing = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS "count" FROM "quiz_questions"`,
    );
    let inserted = 0;
    if (Number(existing.rows[0]?.count ?? 0) === 0) {
      for (const [index, seed] of QUIZ_QUESTIONS.entries()) {
        const { options, correctIndex } = rotate(seed, index % 4);
        await client.query(
          `INSERT INTO "quiz_questions"
             ("id", "prompt", "option_type", "options", "correct_index", "sort_order")
           VALUES ($1, $2, 'text', $3::jsonb, $4, $5)`,
          [
            createId(),
            seed.prompt,
            JSON.stringify(options.map((label) => ({ label, imageUrl: "" }))),
            correctIndex,
            index * 10,
          ],
        );
        inserted += 1;
      }
    }

    console.log(
      `Quiz seed complete: settings=${settings.rowCount ? "created" : "kept"}, questions inserted=${inserted}.`,
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
