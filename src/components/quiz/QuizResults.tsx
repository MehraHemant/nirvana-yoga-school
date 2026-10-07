"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { type ComponentType, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import {
  fillQuizName,
  type PublicQuizQuestion,
  type QuizAttemptResult,
  type QuizSettings,
} from "@/content/types/quiz";
import {
  ArrowRight,
  Check,
  Copy,
  type IconProps,
  Leaf,
  Lotus,
  Users,
} from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import { formatDurationMs } from "@/lib/quiz/format-duration";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import { scorePercent } from "@/lib/quiz/scoring";
import { QuizCenteredMessage } from "./QuizImmersiveLayout";
import {
  QUIZ_EYEBROW_CLASS,
  QUIZ_GUTTER_CLASS,
  QUIZ_SERIF_CLASS,
} from "./quiz-panel";

/** Grading state after the answers are submitted. */
export type QuizAttemptStatus =
  | { state: "saving" }
  | { state: "saved"; result: QuizAttemptResult }
  | { state: "error"; message: string; retryable: boolean };

type QuizResultsProps = {
  attempt: QuizAttemptStatus;
  /** Questions in this attempt (for length calculation). */
  questions: PublicQuizQuestion[];
  /** Gift copy and allowance from the CMS. */
  settings: QuizSettings;
  /** Signed-in name for the greeting. */
  userName?: string | null;
  /** Starts a new attempt when one is left. */
  onRetake: () => void;
  /** Resends the answers after a network or server error. */
  onRetrySave: () => void;
};

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type Icon = ComponentType<IconProps & { strokeWidth?: number }>;

type ScoreTier = {
  title: string;
  headline: string;
  message: string;
};

/** In-person perks listed on the gift panel. */
const GIFT_PERKS: { icon: Icon; title: string; desc: string }[] = [
  {
    icon: Lotus,
    title: "Welcome gift pack",
    desc: "Ready for you when you arrive at the ashram",
  },
  {
    icon: Users,
    title: "Course guidance",
    desc: "A one-to-one talk with a senior teacher",
  },
  {
    icon: Leaf,
    title: "Ayurvedic welcome",
    desc: "Herbal infusion in our gardens",
  },
];

/**
 * Returns the rank title and encouragement for a final percent.
 *
 * @param percent - Final score as percentage 0-100
 */
function getScoreTier(percent: number): ScoreTier {
  if (percent >= 90) {
    return {
      title: "Yogic Sage",
      headline: "Exceptional yoga wisdom",
      message:
        "Your understanding of yoga philosophy, asanas, and its heritage shines through.",
    };
  }
  if (percent >= 70) {
    return {
      title: "Dedicated Sadhaka",
      headline: "A wonderful result",
      message:
        "You have a solid, grounded foundation in yogic tradition and mindful practice.",
    };
  }
  if (percent >= 40) {
    return {
      title: "Curious Seeker",
      headline: "Great effort",
      message:
        "Every step on the path widens your insight. Keep exploring and keep practising.",
    };
  }
  return {
    title: "Beginner’s Mind",
    headline: "A beautiful beginning",
    message:
      "In the beginner’s mind there are endless possibilities. The ashram warmly welcomes you on your path.",
  };
}

/**
 * End-of-quiz summary: score and stats beside the ashram gift panel.
 *
 * @param props - Grading state, questions, CMS settings, and handlers
 */
export function QuizResults({
  attempt,
  questions,
  settings,
  userName = null,
  onRetake,
  onRetrySave,
}: QuizResultsProps) {
  const first = userName?.trim().split(/\s+/)[0];

  if (attempt.state === "saved") {
    return (
      <SavedResults
        result={attempt.result}
        questions={questions}
        settings={settings}
        firstName={first}
        onRetake={onRetake}
      />
    );
  }

  return (
    <QuizCenteredMessage>
      <div aria-live="polite">
        <BreathingMark active={attempt.state === "saving"} />
        <h1 className={`${QUIZ_SERIF_CLASS} mt-10 text-3xl text-ink`}>
          {attempt.state === "saving"
            ? "Evaluating your answers…"
            : "Something went wrong"}
        </h1>
        {attempt.state === "saving" ? (
          <p className="mt-3 text-sm text-ink/45">Take a slow breath.</p>
        ) : (
          <>
            <p className="mt-3 text-[0.9375rem] text-ink/55">
              {attempt.message}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              {attempt.retryable ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onRetrySave}
                >
                  Try again
                </Button>
              ) : null}
              <Button href="/" variant="outline" size="md">
                Back to the school
              </Button>
            </div>
          </>
        )}
      </div>
    </QuizCenteredMessage>
  );
}

/**
 * Lotus inside soft rings that slowly breathe while `active`.
 *
 * @param props - Whether the rings animate
 */
function BreathingMark({ active }: { active: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const breathe = active && !reduced;

  return (
    <span className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="absolute inset-0 rounded-full border border-primary/20"
          animate={breathe ? { scale: [1, 1.5], opacity: [0.8, 0] } : {}}
          transition={{
            duration: 3,
            delay: ring * 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
          aria-hidden="true"
        />
      ))}
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-[0_20px_40px_-24px_rgb(163_36_50/0.5)]">
        <Lotus size={30} strokeWidth={1.4} />
      </span>
    </span>
  );
}

type SavedResultsProps = {
  result: QuizAttemptResult;
  questions: PublicQuizQuestion[];
  settings: QuizSettings;
  firstName?: string;
  onRetake: () => void;
};

/**
 * Results once the server has graded and saved the attempt. Answers are not
 * revealed.
 *
 * @param props - Graded result, questions, settings, and retake handler
 */
function SavedResults({
  result,
  questions,
  settings,
  firstName,
  onRetake,
}: SavedResultsProps) {
  const reduced = useReducedMotion() ?? false;
  const percent = scorePercent(result.score, result.maxScore);
  const [shownPercent, setShownPercent] = useState(reduced ? percent : 0);
  const [copied, setCopied] = useState(false);
  const canRetake = result.remaining > 0;
  const tier = getScoreTier(percent);

  useEffect(() => {
    if (reduced) {
      setShownPercent(percent);
      return;
    }
    const controls = animate(0, percent, {
      duration: 1.4,
      delay: 0.3,
      ease: EASE_OUT,
      onUpdate: (value) => setShownPercent(Math.round(value)),
    });
    return () => controls.stop();
  }, [percent, reduced]);

  const totalQuestions = questions.length || 1;
  const avgSeconds = Math.max(
    1,
    Math.round(result.totalTimeMs / 1000 / totalQuestions),
  );

  const stats = [
    {
      label: "Correct",
      value: result.correct,
      note: `${Math.round((result.correct / totalQuestions) * 100)}% accuracy`,
    },
    {
      label: "Incorrect",
      value: result.incorrect,
      note: result.incorrect === 0 ? "Flawless" : `${result.incorrect} missed`,
    },
    {
      label: "Skipped",
      value: result.skipped,
      note: result.skipped === 0 ? "None skipped" : `${result.skipped} passed`,
    },
    {
      label: "Time",
      value: formatDurationMs(result.totalTimeMs),
      note: `~${avgSeconds}s per question`,
    },
  ];

  /** Staggered rise for each block. */
  const rise = (step: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: reducedTransition(reduced, {
      duration: 0.7,
      delay: 0.1 * step,
      ease: EASE_OUT,
    }),
  });

  const handleShare = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://nirvanayogaschool.com";
    const shareText = `🧘 I scored ${percent}% (${result.score}/${result.maxScore} pts) on the Nirvana Yoga School Quiz! Test your knowledge of yoga & Rishikesh: ${origin}/quiz`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Nirvana Yoga School Quiz",
          text: shareText,
          url: `${origin}/quiz`,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div className="grid flex-1 lg:grid-cols-12" aria-live="polite">
      {/* Score */}
      <div
        className={`${QUIZ_GUTTER_CLASS} flex flex-col justify-center py-12 lg:col-span-7 lg:py-14`}
      >
        <motion.p
          {...rise(0)}
          className={`${QUIZ_EYEBROW_CLASS} flex items-center gap-3 text-primary`}
        >
          <span className="h-px w-10 bg-primary/40" aria-hidden="true" />
          {firstName ? `${firstName}, your result` : "Your result"}
        </motion.p>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <motion.div
            {...rise(1)}
            className="relative flex h-48 w-48 shrink-0 items-center justify-center xl:h-56 xl:w-56"
          >
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="rgb(0 0 0 / 0.06)"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{
                  strokeDashoffset: reduced
                    ? RING_CIRCUMFERENCE * (1 - percent / 100)
                    : RING_CIRCUMFERENCE,
                }}
                animate={{
                  strokeDashoffset: RING_CIRCUMFERENCE * (1 - percent / 100),
                }}
                transition={reducedTransition(reduced, {
                  duration: 1.4,
                  delay: 0.3,
                  ease: EASE_OUT,
                })}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span
                className={`${QUIZ_SERIF_CLASS} text-6xl text-ink xl:text-7xl`}
              >
                {shownPercent}
                <span className="text-3xl text-ink/30">%</span>
              </span>
              <span
                className={`${QUIZ_EYEBROW_CLASS} mt-2 tabular-nums text-ink/45`}
              >
                {result.score} / {result.maxScore} pts
              </span>
            </div>
          </motion.div>

          <motion.div {...rise(2)} className="min-w-0">
            <p className={`${QUIZ_SERIF_CLASS} text-xl italic text-primary`}>
              {tier.title}
            </p>
            <h1
              className={`${QUIZ_SERIF_CLASS} mt-2 text-balance text-4xl leading-[1.08] text-ink sm:text-5xl`}
            >
              {tier.headline}
            </h1>
            <p className="mt-4 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-ink/55">
              {tier.message}
            </p>
          </motion.div>
        </div>

        <motion.dl
          {...rise(3)}
          className="mt-12 grid grid-cols-2 border-y border-ink/8 sm:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col-reverse py-5 ${index % 2 ? "border-l border-ink/8 pl-5" : ""} ${index === 2 ? "border-t border-ink/8 sm:border-t-0 sm:border-l sm:pl-5" : ""} ${index === 3 ? "border-t border-ink/8 sm:border-t-0" : ""}`}
            >
              <dt className="mt-1">
                <span className={`${QUIZ_EYEBROW_CLASS} block text-ink/45`}>
                  {stat.label}
                </span>
                <span className="mt-1 block text-xs text-ink/35">
                  {stat.note}
                </span>
              </dt>
              <dd className={`${QUIZ_SERIF_CLASS} text-3xl text-ink`}>
                {stat.value}
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          {...rise(4)}
          className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/45">
            <span className="flex items-center gap-3">
              <span className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: settings.monthlyLimit }, (_, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: chance dots
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index < settings.monthlyLimit - result.remaining
                        ? "bg-ink/15"
                        : "bg-primary"
                    }`}
                  />
                ))}
              </span>
              {canRetake
                ? `${result.remaining} of ${settings.monthlyLimit} attempts left this month`
                : result.nextAvailableAt
                  ? `Next attempt opens ${formatQuizNextDate(result.nextAvailableAt)}`
                  : "Next attempt opens next month"}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-ink/55 underline-offset-4 transition hover:text-primary hover:underline"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Share score"}
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/courses" variant="outline" size="md">
              Explore courses
            </Button>
            {canRetake ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onRetake}
              >
                Take it again
              </Button>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Gift */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedTransition(reduced, {
          duration: 0.9,
          delay: 0.2,
          ease: EASE_OUT,
        })}
        className="relative flex flex-col overflow-hidden bg-[#6e1621] px-6 py-12 text-white sm:px-10 lg:col-span-5 lg:px-14 lg:py-14 xl:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgb(163_36_50/0.9),transparent_60%)]"
          aria-hidden="true"
        />
        <Lotus
          size={420}
          strokeWidth={0.25}
          className="pointer-events-none absolute -right-28 -bottom-28 text-white/8"
        />

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <p className={`${QUIZ_EYEBROW_CLASS} text-amber-200/90`}>
              {settings.giftEyebrow}
            </p>
            <p className={`${QUIZ_EYEBROW_CLASS} text-white/45`}>
              Tapovan · Rishikesh
            </p>
          </div>

          <h2
            className={`${QUIZ_SERIF_CLASS} mt-8 text-balance text-3xl leading-[1.15] sm:text-4xl`}
          >
            {fillQuizName(settings.giftTitle, firstName)}
          </h2>
          {settings.giftBody ? (
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
              {settings.giftBody}
            </p>
          ) : null}

          <ul className="mt-10 border-t border-white/12">
            {GIFT_PERKS.map(({ icon: PerkIcon, title, desc }) => (
              <li
                key={title}
                className="flex items-center gap-4 border-b border-white/12 py-4"
              >
                <PerkIcon
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-amber-200/90"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-white/55">{desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {settings.giftCtaLabel && settings.giftCtaHref ? (
              <Button
                href={settings.giftCtaHref}
                variant="outline-light"
                size="md"
                className="group self-start"
              >
                {settings.giftCtaLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            ) : null}
            <p className="max-w-56 text-xs leading-relaxed text-white/50">
              Show this result or your registered email at our reception in
              Tapovan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
