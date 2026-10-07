import type { QuizAttemptResult } from "@/content/types/quiz";
import { getSiteServerSession } from "@/lib/auth/site-session";
import {
  jsonBadRequest,
  jsonConflict,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";
import {
  getQuizEligibility,
  gradeQuizAttempt,
  recordQuizAttempt,
  type SubmittedAnswer,
} from "@/lib/quiz/attempts";
import { listQuizQuestions, questionsPerAttempt } from "@/lib/quiz/questions";
import { getQuizSettings } from "@/lib/quiz/settings";

/**
 * Parses the submitted answer list.
 *
 * @param value - Raw JSON `answers`
 */
function parseAnswers(value: unknown): SubmittedAnswer[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const answers: SubmittedAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const { questionId, selectedIndex, timeMs } = item as Record<
      string,
      unknown
    >;
    if (typeof questionId !== "string" || !questionId) return null;
    if (
      selectedIndex !== null &&
      (typeof selectedIndex !== "number" || !Number.isInteger(selectedIndex))
    ) {
      return null;
    }
    answers.push({
      questionId,
      selectedIndex: selectedIndex as number | null,
      timeMs:
        typeof timeMs === "number" && Number.isFinite(timeMs) ? timeMs : 0,
    });
  }
  return answers;
}

/**
 * Chances left this month for the signed-in account, and when the next opens.
 */
export async function GET() {
  const session = await getSiteServerSession();
  if (!session) return jsonUnauthorized();
  const settings = await getQuizSettings();
  if (!isDbEnabled()) {
    return jsonOk({ remaining: settings.monthlyLimit, nextAvailableAt: null });
  }
  return jsonOk(
    await getQuizEligibility(session.userId, settings.monthlyLimit),
  );
}

/**
 * Grades a finished quiz on the server and records it for the signed-in
 * account. Refuses once the month's attempts are used.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const session = await getSiteServerSession();
  if (!session) return jsonUnauthorized();

  const body = (await request.json().catch(() => null)) as {
    answers?: unknown;
  } | null;
  const answers = parseAnswers(body?.answers);
  if (!answers) return jsonBadRequest("Answers are required");

  const [settings, questions] = await Promise.all([
    getQuizSettings(),
    listQuizQuestions({ activeOnly: true }),
  ]);
  if (!settings.live) return jsonConflict("The quiz is not open right now");

  const grading = gradeQuizAttempt(
    answers,
    questions,
    settings,
    questionsPerAttempt(settings, questions.length),
  );
  if (!grading.ok) return jsonConflict(grading.error);

  const saved = await recordQuizAttempt(
    session.userId,
    grading.graded,
    settings.monthlyLimit,
  );
  if (!saved.ok) return jsonConflict(saved.error);

  const result: QuizAttemptResult = {
    ...grading.graded,
    ...saved.eligibility,
    review: settings.showAnswerReview ? grading.graded.review : [],
  };
  return jsonOk({ result });
}
