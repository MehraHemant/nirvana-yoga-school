import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import type {
  PublicQuizQuestion,
  QuizOption,
  QuizOptionType,
  QuizQuestion,
} from "@/content/types/quiz";
import { normalizeQuizCategory } from "@/content/types/quiz-categories";
import { db, isDbEnabled } from "@/lib/db";
import { createId } from "@/lib/db/ids";

export {
  pickQuestionsForAttempt,
  questionsPerAttempt,
} from "./pick-questions";

let questionsReady: Promise<void> | null = null;

/**
 * Creates the quiz question table when it is missing.
 */
export function ensureQuizQuestionsTable(): Promise<void> {
  if (!questionsReady) {
    questionsReady = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "quiz_questions" (
          "id" TEXT PRIMARY KEY,
          "category" TEXT NOT NULL DEFAULT 'yoga-basics',
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
      await db.$executeRawUnsafe(`
        ALTER TABLE "quiz_questions"
          ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'yoga-basics'
      `);
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "quiz_questions_sort_idx"
        ON "quiz_questions" ("sort_order")
      `);
    })().catch((error: unknown) => {
      questionsReady = null;
      throw error;
    });
  }
  return questionsReady;
}

type QuestionRow = {
  id: string;
  category: string | null;
  prompt: string;
  prompt_image_url: string;
  option_type: string;
  options: unknown;
  correct_index: number;
  explanation: string;
  active: boolean;
};

/**
 * Maps a database row to a question.
 *
 * @param row - Raw `quiz_questions` row
 */
function toQuestion(row: QuestionRow): QuizQuestion {
  const rawOptions =
    typeof row.options === "string" ? JSON.parse(row.options) : row.options;
  const options: QuizOption[] = (Array.isArray(rawOptions) ? rawOptions : [])
    .filter((option) => option && typeof option === "object")
    .map((option) => ({
      label: String(option.label ?? ""),
      imageUrl: String(option.imageUrl ?? ""),
    }));
  return {
    id: row.id,
    category: normalizeQuizCategory(row.category),
    prompt: row.prompt,
    promptImageUrl: row.prompt_image_url ?? "",
    optionType: (row.option_type === "image"
      ? "image"
      : "text") as QuizOptionType,
    options,
    correctIndex: Number(row.correct_index),
    explanation: row.explanation ?? "",
    active: row.active !== false,
  };
}

/**
 * Questions in CMS order.
 *
 * @param options - `activeOnly` skips questions switched off in the CMS
 */
export async function listQuizQuestions(
  options: { activeOnly?: boolean } = {},
): Promise<QuizQuestion[]> {
  if (!isDbEnabled()) return [];
  await ensureQuizQuestionsTable();
  const rows = await db.$queryRawUnsafe<QuestionRow[]>(
    `SELECT "id", "category", "prompt", "prompt_image_url", "option_type", "options",
            "correct_index", "explanation", "active"
       FROM "quiz_questions"
      ${options.activeOnly ? `WHERE "active" = TRUE` : ""}
      ORDER BY "sort_order" ASC, "created_at" ASC`,
  );
  return rows.map(toQuestion);
}

/** Cache tag for the public "is the quiz open" check. */
const QUIZ_QUESTIONS_TAG = "quiz-questions";

/**
 * Whether at least one active question exists — cached for the site shell so
 * public pages stay static. Busted by {@link invalidateQuizQuestionsCache}.
 */
export const hasActiveQuizQuestions = unstable_cache(
  async (): Promise<boolean> => {
    const questions = await listQuizQuestions({ activeOnly: true });
    return questions.length > 0;
  },
  ["quiz-has-active-questions"],
  { tags: [QUIZ_QUESTIONS_TAG], revalidate: 3600 },
);

/**
 * Invalidates cached quiz-question lookups after admin edits.
 */
export function invalidateQuizQuestionsCache(): void {
  revalidateTag(QUIZ_QUESTIONS_TAG, "max");
}

/**
 * Replaces the whole question bank with the edited list, in order.
 * Rows missing from the list are deleted.
 *
 * @param questions - Validated questions in display order
 */
export async function replaceQuizQuestions(
  questions: QuizQuestion[],
): Promise<QuizQuestion[]> {
  await ensureQuizQuestionsTable();
  const withIds = questions.map((question) => ({
    ...question,
    id: question.id || createId(),
  }));

  await db.$transaction(async () => {
    const keep = withIds.map((question) => question.id);
    if (keep.length > 0) {
      await db.$executeRawUnsafe(
        `DELETE FROM "quiz_questions" WHERE NOT ("id" = ANY(?::text[]))`,
        keep,
      );
    } else {
      await db.$executeRawUnsafe(`DELETE FROM "quiz_questions"`);
    }
    for (const [index, question] of withIds.entries()) {
      await db.$executeRawUnsafe(
        `INSERT INTO "quiz_questions"
           ("id", "category", "prompt", "prompt_image_url", "option_type", "options",
            "correct_index", "explanation", "active", "sort_order")
         VALUES (?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?)
         ON CONFLICT ("id") DO UPDATE SET
           "category" = EXCLUDED."category",
           "prompt" = EXCLUDED."prompt",
           "prompt_image_url" = EXCLUDED."prompt_image_url",
           "option_type" = EXCLUDED."option_type",
           "options" = EXCLUDED."options",
           "correct_index" = EXCLUDED."correct_index",
           "explanation" = EXCLUDED."explanation",
           "active" = EXCLUDED."active",
           "sort_order" = EXCLUDED."sort_order",
           "updated_at" = NOW()`,
        question.id,
        question.category,
        question.prompt,
        question.promptImageUrl,
        question.optionType,
        JSON.stringify(question.options),
        question.correctIndex,
        question.explanation,
        question.active,
        index * 10,
      );
    }
  });

  return withIds;
}

/**
 * Strips the answer and explanation before a question reaches the browser.
 *
 * @param question - Full question
 */
export function toPublicQuestion(question: QuizQuestion): PublicQuizQuestion {
  return {
    id: question.id,
    category: question.category,
    prompt: question.prompt,
    promptImageUrl: question.promptImageUrl,
    optionType: question.optionType,
    options: question.options,
  };
}
