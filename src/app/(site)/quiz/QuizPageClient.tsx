"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuizImmersiveLayout } from "@/components/quiz/QuizImmersiveLayout";
import { QuizIntro } from "@/components/quiz/QuizIntro";
import { QuizQuestionCard } from "@/components/quiz/QuizQuestionCard";
import {
  type QuizAttemptStatus,
  QuizResults,
} from "@/components/quiz/QuizResults";
import type {
  PublicQuizQuestion,
  QuizAttemptResult,
  QuizSettings,
} from "@/content/types/quiz";
import {
  QUIZ_CATEGORIES,
  type QuizCategoryFilter,
} from "@/content/types/quiz-categories";
import {
  filterQuizQuestions,
  pickQuestionsForAttempt,
  questionsPerAttempt,
} from "@/lib/quiz/pick-questions";

type QuizPhase = "intro" | "questions" | "results";

type RecordedAnswer = {
  questionId: string;
  selectedIndex: number | null;
  timeMs: number;
};

type QuizPageClientProps = {
  /** Signed-in name shown on the intro and gift note. */
  userName?: string | null;
  /** Attempts left this month when the page loaded. */
  remainingChances: number;
  /** Quiz settings from the CMS. */
  settings: QuizSettings;
  /** Questions for this attempt, without answers. */
  questions: PublicQuizQuestion[];
};

/**
 * Sends the answers for server-side grading. Call once per finish.
 *
 * @param answers - Answers in the order they were shown
 * @param category - Category this attempt was limited to, or `all`
 */
async function submitAttempt(
  answers: RecordedAnswer[],
  category: QuizCategoryFilter,
): Promise<QuizAttemptStatus> {
  try {
    const response = await fetch("/api/quiz/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, category }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      result?: QuizAttemptResult;
      error?: string;
    };
    if (!response.ok || !data.result) {
      return {
        state: "error",
        message: data.error || "We could not save this attempt.",
        retryable: response.status >= 500 || response.status === 0,
      };
    }
    return { state: "saved", result: data.result };
  } catch {
    return {
      state: "error",
      message: "We could not reach the server.",
      retryable: true,
    };
  }
}

/**
 * Client quiz flow: intro, questions, server grading, and results.
 *
 * @param props - Visitor name, remaining chances, CMS settings, and questions
 */
export default function QuizPageClient({
  userName = null,
  remainingChances,
  settings,
  questions,
}: QuizPageClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [category, setCategory] = useState<QuizCategoryFilter>("all");
  const [attemptQuestions, setAttemptQuestions] = useState<
    PublicQuizQuestion[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [attempt, setAttempt] = useState<QuizAttemptStatus>({
    state: "saving",
  });
  const [attemptNumber, setAttemptNumber] = useState(0);
  const questionShownAtRef = useRef(Date.now());
  const recordedCountRef = useRef(0);
  const submittingRef = useRef(false);
  const categoryRef = useRef<QuizCategoryFilter>("all");

  const categories = QUIZ_CATEGORIES.filter((item) =>
    questions.some((question) => question.category === item.id),
  ).map((item) => item.id);
  const introCount = questionsPerAttempt(
    settings,
    filterQuizQuestions(questions, category).length,
  );
  const total = attemptQuestions.length;
  const question = attemptQuestions[currentIndex];

  // Leaving mid-quiz loses the answers, so ask first.
  useEffect(() => {
    if (phase !== "questions") return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const submit = useCallback(async (finalAnswers: RecordedAnswer[]) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setAttempt({ state: "saving" });
    const status = await submitAttempt(finalAnswers, categoryRef.current);
    setAttempt(status);
    submittingRef.current = false;
  }, []);

  function handleStart() {
    const picked = pickQuestionsForAttempt(
      filterQuizQuestions(questions, category),
      settings,
    );
    if (picked.length === 0) return;
    categoryRef.current = category;
    setAttemptQuestions(picked);
    setPhase("questions");
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswers([]);
    setAttempt({ state: "saving" });
    setAttemptNumber((value) => value + 1);
    recordedCountRef.current = 0;
    questionShownAtRef.current = Date.now();
  }

  function recordAndAdvance(selection: number | null) {
    // Ignore a second click or Enter for a question already recorded.
    if (!question || recordedCountRef.current > currentIndex) return;
    recordedCountRef.current = currentIndex + 1;

    const nextAnswers = [
      ...answers,
      {
        questionId: question.id,
        selectedIndex: selection,
        timeMs: Date.now() - questionShownAtRef.current,
      },
    ];
    setAnswers(nextAnswers);
    setSelectedIndex(null);
    questionShownAtRef.current = Date.now();

    if (currentIndex >= total - 1) {
      setPhase("results");
      void submit(nextAnswers);
      return;
    }
    setCurrentIndex((index) => index + 1);
  }

  function handleRetake() {
    // Fetch a fresh question set for the new attempt.
    router.refresh();
    setPhase("intro");
  }

  const remaining =
    attempt.state === "saved" ? attempt.result.remaining : remainingChances;
  // Questions share one screen; the card slides between them itself.
  const stepKey = `${phase}-${attemptNumber}`;

  return (
    <QuizImmersiveLayout stepKey={stepKey}>
      {phase === "intro" ? (
        <QuizIntro
          settings={settings}
          questionCount={introCount}
          categories={categories}
          category={category}
          userName={userName}
          remainingChances={remaining}
          onCategoryChange={setCategory}
          onStart={handleStart}
        />
      ) : null}

      {phase === "questions" && question ? (
        <QuizQuestionCard
          key={`${attemptNumber}-${question.id}`}
          question={question}
          history={answers.map((answer) =>
            answer.selectedIndex === null ? "skipped" : "answered",
          )}
          questionNumber={currentIndex + 1}
          totalQuestions={total}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onNext={() => {
            if (selectedIndex !== null) recordAndAdvance(selectedIndex);
          }}
          onSkip={() => recordAndAdvance(null)}
          isLastQuestion={currentIndex === total - 1}
        />
      ) : null}

      {phase === "results" ? (
        <QuizResults
          attempt={attempt}
          questions={attemptQuestions}
          settings={settings}
          userName={userName}
          onRetake={handleRetake}
          onRetrySave={() => void submit(answers)}
        />
      ) : null}
    </QuizImmersiveLayout>
  );
}
