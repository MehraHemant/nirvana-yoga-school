import "server-only";
import type {
  QuizAttemptResult,
  QuizQuestion,
  QuizReviewItem,
  QuizSettings,
} from "@/content/types/quiz";
import { db, isDbEnabled } from "@/lib/db";
import { createId } from "@/lib/db/ids";
import { getAnswerStatus } from "./scoring";

const KOLKATA_TIME_ZONE = "Asia/Kolkata";

let quizAttemptsReady: Promise<void> | null = null;

/**
 * Creates the finished-attempt table when it is missing, and adds the detail
 * columns to tables created before answers were stored.
 */
export function ensureQuizAttemptsTable(): Promise<void> {
  if (!quizAttemptsReady) {
    quizAttemptsReady = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "quiz_attempts" (
          "id" TEXT PRIMARY KEY,
          "user_id" TEXT NOT NULL,
          "completed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "score" INTEGER NOT NULL
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "quiz_attempts_user_completed_idx"
        ON "quiz_attempts" ("user_id", "completed_at")
      `);
      // Earlier attempts came from the fixed 10-question, 10-point demo quiz.
      await db.$executeRawUnsafe(`
        ALTER TABLE "quiz_attempts"
          ADD COLUMN IF NOT EXISTS "max_score" INTEGER NOT NULL DEFAULT 100,
          ADD COLUMN IF NOT EXISTS "total_questions" INTEGER NOT NULL DEFAULT 10,
          ADD COLUMN IF NOT EXISTS "correct_count" INTEGER,
          ADD COLUMN IF NOT EXISTS "incorrect_count" INTEGER,
          ADD COLUMN IF NOT EXISTS "skipped_count" INTEGER,
          ADD COLUMN IF NOT EXISTS "duration_ms" INTEGER,
          ADD COLUMN IF NOT EXISTS "answers" JSONB
      `);
    })().catch((error: unknown) => {
      quizAttemptsReady = null;
      throw error;
    });
  }
  return quizAttemptsReady;
}

/**
 * Start of the current calendar month in Asia/Kolkata.
 *
 * @param now - Instant used to resolve the month
 */
export function startOfKolkataMonth(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KOLKATA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return new Date(`${year}-${month}-01T00:00:00+05:30`);
}

/**
 * Start of the next calendar month in Asia/Kolkata, when quiz chances reset.
 *
 * @param now - Instant used to resolve the month
 */
export function startOfNextKolkataMonth(now = new Date()): Date {
  const start = startOfKolkataMonth(now);
  // The 1st plus 31 days always lands inside the following month.
  return startOfKolkataMonth(
    new Date(start.getTime() + 31 * 24 * 60 * 60 * 1000),
  );
}

export type QuizEligibility = {
  /** Chances left in the current Asia/Kolkata month. */
  remaining: number;
  /** ISO instant the next chance opens. Null while chances remain. */
  nextAvailableAt: string | null;
};

/**
 * Eligibility for a given number of attempts already used.
 *
 * @param used - Finished attempts this month
 * @param monthlyLimit - Allowance from the CMS
 */
function eligibilityFor(used: number, monthlyLimit: number): QuizEligibility {
  const remaining = Math.max(0, monthlyLimit - used);
  return {
    remaining,
    nextAvailableAt:
      remaining > 0 ? null : startOfNextKolkataMonth().toISOString(),
  };
}

/**
 * Finished quiz attempts for an account since the start of this month.
 *
 * @param userId - Site account id
 */
export async function countQuizAttemptsThisMonth(
  userId: string,
): Promise<number> {
  if (!isDbEnabled()) return 0;
  await ensureQuizAttemptsTable();
  return db.quizAttempt.count({
    where: {
      userId,
      completedAt: { gte: startOfKolkataMonth() },
    },
  });
}

/**
 * Chances left this month and, once all are used, when the next one opens.
 *
 * @param userId - Site account id
 * @param monthlyLimit - Allowance from the CMS
 */
export async function getQuizEligibility(
  userId: string,
  monthlyLimit: number,
): Promise<QuizEligibility> {
  return eligibilityFor(await countQuizAttemptsThisMonth(userId), monthlyLimit);
}

/** One answer as submitted by the browser. */
export type SubmittedAnswer = {
  questionId: string;
  selectedIndex: number | null;
  timeMs: number;
};

type GradedAttempt = Omit<QuizAttemptResult, "remaining" | "nextAvailableAt">;

/**
 * Scores submitted answers against the active question bank.
 *
 * @param answers - Answers in the order they were shown
 * @param questions - Active questions
 * @param settings - Quiz settings (points and question count)
 * @param expectedCount - Questions an attempt must contain
 */
export function gradeQuizAttempt(
  answers: SubmittedAnswer[],
  questions: QuizQuestion[],
  settings: QuizSettings,
  expectedCount: number,
): { ok: true; graded: GradedAttempt } | { ok: false; error: string } {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const seen = new Set<string>();

  if (answers.length !== expectedCount || expectedCount === 0) {
    return {
      ok: false,
      error: "The quiz has changed. Please reload and try again.",
    };
  }

  const review: QuizReviewItem[] = [];
  let totalTimeMs = 0;
  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question || seen.has(answer.questionId)) {
      return {
        ok: false,
        error: "The quiz has changed. Please reload and try again.",
      };
    }
    seen.add(answer.questionId);
    const selectedIndex =
      answer.selectedIndex !== null &&
      answer.selectedIndex >= 0 &&
      answer.selectedIndex < question.options.length
        ? answer.selectedIndex
        : null;
    totalTimeMs += Math.max(0, Math.min(answer.timeMs, 30 * 60 * 1000));
    review.push({
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      status: getAnswerStatus(question.correctIndex, selectedIndex),
      explanation: question.explanation,
    });
  }

  const correct = review.filter((item) => item.status === "correct").length;
  const skipped = review.filter((item) => item.status === "skipped").length;
  return {
    ok: true,
    graded: {
      score: correct * settings.pointsPerCorrect,
      maxScore: review.length * settings.pointsPerCorrect,
      correct,
      incorrect: review.length - correct - skipped,
      skipped,
      totalTimeMs: Math.round(totalTimeMs),
      review,
    },
  };
}

/**
 * Saves one graded attempt when the monthly limit still allows it.
 *
 * @param userId - Site account id
 * @param graded - Server-graded attempt
 * @param monthlyLimit - Allowance from the CMS
 */
export async function recordQuizAttempt(
  userId: string,
  graded: GradedAttempt,
  monthlyLimit: number,
): Promise<
  { ok: true; eligibility: QuizEligibility } | { ok: false; error: string }
> {
  if (!isDbEnabled()) {
    return { ok: false, error: "Database not configured" };
  }

  await ensureQuizAttemptsTable();
  const monthStart = startOfKolkataMonth();

  const used = await db.$transaction(async () => {
    await db.$executeRawUnsafe(
      `SELECT pg_advisory_xact_lock(hashtext(?)::bigint)`,
      `quiz-attempts:${userId}`,
    );
    const count = await db.quizAttempt.count({
      where: { userId, completedAt: { gte: monthStart } },
    });
    if (count >= monthlyLimit) return null;
    await db.$executeRawUnsafe(
      `INSERT INTO "quiz_attempts"
         ("id", "user_id", "completed_at", "score", "max_score", "total_questions",
          "correct_count", "incorrect_count", "skipped_count", "duration_ms", "answers")
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?::jsonb)`,
      createId(),
      userId,
      graded.score,
      graded.maxScore,
      graded.review.length,
      graded.correct,
      graded.incorrect,
      graded.skipped,
      graded.totalTimeMs,
      JSON.stringify(
        graded.review.map(({ questionId, selectedIndex, status }) => ({
          questionId,
          selectedIndex,
          status,
        })),
      ),
    );
    return count + 1;
  });

  if (used === null) {
    return { ok: false, error: "All attempts used this month" };
  }
  return { ok: true, eligibility: eligibilityFor(used, monthlyLimit) };
}

export type QuizAttemptSummary = {
  id: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correct: number | null;
  durationMs: number | null;
  completedAt: string;
};

type AttemptRow = {
  id: string;
  score: number;
  max_score: number;
  total_questions: number;
  correct_count: number | null;
  duration_ms: number | null;
  completed_at: Date;
};

/**
 * Maps an attempt row to its summary.
 *
 * @param row - Raw `quiz_attempts` row
 */
function toSummary(row: AttemptRow): QuizAttemptSummary {
  return {
    id: row.id,
    score: Number(row.score),
    maxScore: Number(row.max_score),
    totalQuestions: Number(row.total_questions),
    correct: row.correct_count === null ? null : Number(row.correct_count),
    durationMs: row.duration_ms === null ? null : Number(row.duration_ms),
    completedAt: new Date(row.completed_at).toISOString(),
  };
}

/**
 * Most recent finished attempts for an account, newest first.
 *
 * @param userId - Site account id
 * @param limit - Maximum rows
 */
export async function listQuizAttempts(
  userId: string,
  limit = 24,
): Promise<QuizAttemptSummary[]> {
  if (!isDbEnabled()) return [];
  await ensureQuizAttemptsTable();
  const rows = await db.$queryRawUnsafe<AttemptRow[]>(
    `SELECT "id", "score", "max_score", "total_questions", "correct_count",
            "duration_ms", "completed_at"
       FROM "quiz_attempts"
      WHERE "user_id" = ?
      ORDER BY "completed_at" DESC
      LIMIT ?`,
    userId,
    limit,
  );
  return rows.map(toSummary);
}

export type AdminQuizAttempt = QuizAttemptSummary & {
  userName: string | null;
  userEmail: string | null;
};

/**
 * Recent attempts across all accounts, for the CMS results page.
 *
 * @param limit - Maximum rows
 */
export async function listAllQuizAttempts(
  limit = 200,
): Promise<AdminQuizAttempt[]> {
  if (!isDbEnabled()) return [];
  await ensureQuizAttemptsTable();
  const rows = await db.$queryRawUnsafe<
    (AttemptRow & { user_name: string | null; user_email: string | null })[]
  >(
    `SELECT a."id", a."score", a."max_score", a."total_questions", a."correct_count",
            a."duration_ms", a."completed_at",
            u."name" AS "user_name", u."email" AS "user_email"
       FROM "quiz_attempts" a
       LEFT JOIN "site_users" u ON u."id" = a."user_id"
      ORDER BY a."completed_at" DESC
      LIMIT ?`,
    limit,
  );
  return rows.map((row) => ({
    ...toSummary(row),
    userName: row.user_name,
    userEmail: row.user_email,
  }));
}
