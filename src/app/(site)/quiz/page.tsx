import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuizClosed } from "@/components/quiz/QuizClosed";
import { QuizMonthLimit } from "@/components/quiz/QuizMonthLimit";
import { getSiteServerSession } from "@/lib/auth/site-session";
import { getQuizEligibility } from "@/lib/quiz/attempts";
import {
  listQuizQuestions,
  pickQuestionsForAttempt,
  toPublicQuestion,
} from "@/lib/quiz/questions";
import { getQuizSettings } from "@/lib/quiz/settings";
import { metadataForSlug } from "../_shared/metadata";
import QuizPageClient from "./QuizPageClient";

/**
 * Yoga quiz page SEO (CMS meta when available).
 */
export async function generateMetadata(): Promise<Metadata> {
  return metadataForSlug("quiz");
}

/**
 * Quiz with questions and settings from the CMS. Signed-in accounts get the
 * CMS monthly allowance of attempts, counted per Asia/Kolkata month.
 */
export default async function QuizPage() {
  const session = await getSiteServerSession().catch(() => null);
  if (!session) redirect("/login?next=/quiz");

  const [settings, questions] = await Promise.all([
    getQuizSettings(),
    listQuizQuestions({ activeOnly: true }).catch(() => []),
  ]);
  if (!settings.live || questions.length === 0) return <QuizClosed />;

  const { remaining, nextAvailableAt } = await getQuizEligibility(
    session.userId,
    settings.monthlyLimit,
  ).catch(() => ({ remaining: settings.monthlyLimit, nextAvailableAt: null }));

  if (remaining === 0) {
    return (
      <QuizMonthLimit
        userName={session.name}
        nextAvailableAt={nextAvailableAt}
        monthlyLimit={settings.monthlyLimit}
      />
    );
  }

  return (
    <QuizPageClient
      userName={session.name}
      remainingChances={remaining}
      settings={settings}
      questions={pickQuestionsForAttempt(questions, settings).map(
        toPublicQuestion,
      )}
    />
  );
}
