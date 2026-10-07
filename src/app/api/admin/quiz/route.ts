import {
  normalizeQuizSettings,
  type QuizQuestion,
  validateQuizQuestion,
} from "@/content/types/quiz";
import {
  jsonBadRequest,
  jsonError,
  jsonForbidden,
  jsonOk,
} from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { db } from "@/lib/db";
import { listQuizQuestions, replaceQuizQuestions } from "@/lib/quiz/questions";
import { getQuizSettings, QUIZ_SETTINGS_KEY } from "@/lib/quiz/settings";

/**
 * Quiz settings and the full question bank (admin).
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    const [settings, questions] = await Promise.all([
      getQuizSettings(),
      listQuizQuestions(),
    ]);
    return jsonOk({ settings, questions });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load the quiz",
      500,
    );
  }
}

/**
 * Saves quiz settings and replaces the question bank with the edited list.
 */
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const body = (await request.json().catch(() => null)) as {
    settings?: unknown;
    questions?: unknown;
  } | null;
  if (!body || !Array.isArray(body.questions)) {
    return jsonBadRequest("settings and questions are required");
  }

  const questions: QuizQuestion[] = [];
  for (const [index, raw] of body.questions.entries()) {
    const result = validateQuizQuestion(raw, index + 1);
    if (!result.ok) return jsonBadRequest(result.error);
    questions.push(result.question);
  }

  const settings = normalizeQuizSettings(body.settings);
  if (settings.live && !questions.some((question) => question.active)) {
    return jsonBadRequest(
      "Add at least one active question, or switch the quiz off.",
    );
  }

  try {
    const saved = await replaceQuizQuestions(questions);
    await db.globalSettings.upsert({
      where: { key: QUIZ_SETTINGS_KEY },
      update: { value: settings },
      create: { key: QUIZ_SETTINGS_KEY, value: settings },
    });
    invalidateGlobalSettingsCache(QUIZ_SETTINGS_KEY);
    return jsonOk({ settings, questions: saved });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save the quiz",
      500,
    );
  }
}
