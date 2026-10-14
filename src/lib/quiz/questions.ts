import "server-only";
import type {
  PublicQuizQuestion,
  QuizOption,
  QuizOptionType,
  QuizQuestion,
  QuizSettings,
} from "@/content/types/quiz";
import { db, isDbEnabled } from "@/lib/db";
import { createId } from "@/lib/db/ids";

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
    `SELECT "id", "prompt", "prompt_image_url", "option_type", "options",
            "correct_index", "explanation", "active"
       FROM "quiz_questions"
      ${options.activeOnly ? `WHERE "active" = TRUE` : ""}
      ORDER BY "sort_order" ASC, "created_at" ASC`,
  );
  return rows.map(toQuestion);
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
           ("id", "prompt", "prompt_image_url", "option_type", "options",
            "correct_index", "explanation", "active", "sort_order")
         VALUES (?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?)
         ON CONFLICT ("id") DO UPDATE SET
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
    prompt: question.prompt,
    promptImageUrl: question.promptImageUrl,
    optionType: question.optionType,
    options: question.options,
  };
}

/**
 * Number of questions one attempt contains.
 *
 * @param settings - Quiz settings
 * @param available - Active questions in the bank
 */
export function questionsPerAttempt(
  settings: QuizSettings,
  available: number,
): number {
  return settings.questionsPerAttempt > 0
    ? Math.min(settings.questionsPerAttempt, available)
    : available;
}

/**
 * Picks the questions for a new attempt: a random subset when the CMS caps the
 * count, shuffled when the CMS asks for it.
 *
 * @param questions - Active questions in CMS order
 * @param settings - Quiz settings
 */
export function pickQuestionsForAttempt(
  questions: QuizQuestion[],
  settings: QuizSettings,
): QuizQuestion[] {
  const count = questionsPerAttempt(settings, questions.length);
  const pool = [...questions];
  if (settings.shuffleQuestions || count < questions.length) {
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
  }
  const picked = pool.slice(0, count);
  if (settings.shuffleQuestions) return picked;
  // Keep CMS order for a capped, unshuffled quiz.
  const order = new Map(
    questions.map((question, index) => [question.id, index]),
  );
  return picked.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
