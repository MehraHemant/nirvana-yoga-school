import type { QuizCategoryId } from "../src/content/types/quiz-categories";
import { getPool, isDbEnabled } from "../src/lib/db/node";
import { QUIZ_QUESTION_BANK } from "../src/lib/quiz/question-bank";

/** Existing questions mapped to the closest category. Skips rows already set. */
const EXISTING_QUIZ_CATEGORIES: Record<string, QuizCategoryId> = {
  "test-img-options": "meditation",
  uml5vu7ftbj3yrbfqgf0xnlk: "yoga-philosophy",
  lgqf6skesou15mzjv96ev1m0: "yoga-poses",
  d8c3u6f648hjmgmagd4jtciy: "chakras",
  rt5qe6sq718vp6n90g7vhov1: "200-hour-ttc",
  e3ompcasvrh5l8ahmcusgebo: "yoga-poses",
  fblkbs4c4ztxbntbur5ihg2l: "yoga-retreats",
};

/**
 * Adds the category column, labels older questions, and inserts any missing
 * bank questions. Does not delete or overwrite questions already stored.
 */
async function seedQuiz() {
  if (!isDbEnabled()) {
    throw new Error("Database not configured. Set NEON_DB_POSTGRES_URL.");
  }

  const pool = getPool();
  await pool.query(`
    ALTER TABLE "quiz_questions"
      ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'yoga-basics'
  `);

  let categorized = 0;
  for (const [id, category] of Object.entries(EXISTING_QUIZ_CATEGORIES)) {
    const result = await pool.query(
      `UPDATE "quiz_questions"
          SET "category" = $1, "updated_at" = NOW()
        WHERE "id" = $2 AND "category" = 'yoga-basics'`,
      [category, id],
    );
    categorized += result.rowCount ?? 0;
  }

  let inserted = 0;
  for (const question of QUIZ_QUESTION_BANK) {
    const options = question.options.map((label) => ({
      label,
      imageUrl: "",
    }));
    const result = await pool.query(
      `INSERT INTO "quiz_questions"
         ("id", "category", "prompt", "prompt_image_url", "option_type", "options",
          "correct_index", "explanation", "active", "sort_order")
       VALUES (
         $1, $2, $3, '', 'text', $4::jsonb, $5, '', TRUE,
         (SELECT COALESCE(MAX("sort_order"), -10) + 10 FROM "quiz_questions")
       )
       ON CONFLICT ("id") DO NOTHING`,
      [
        question.id,
        question.category,
        question.prompt,
        JSON.stringify(options),
        question.correctIndex,
      ],
    );
    inserted += result.rowCount ?? 0;
  }

  const total = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "quiz_questions"`,
  );
  console.log(
    `Quiz seed: ${inserted} inserted, ${categorized} existing categorized, ${total.rows[0]?.count ?? "0"} in the bank.`,
  );
  await pool.end();
}

seedQuiz().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
