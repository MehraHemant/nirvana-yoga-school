"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { type ComponentType, useEffect, useState } from "react";
import { Button, Container } from "@/components/ui";
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
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import { scorePercent } from "@/lib/quiz/scoring";
import { QuizCenteredMessage } from "./QuizImmersiveLayout";
import { QUIZ_CARD_CLASS } from "./quiz-panel";

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
 * End-of-quiz summary: score and stats beside the ashram gift card.
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
        <h1 className="type-h3 mt-8 text-ink">
          {attempt.state === "saving"
            ? "Checking your answers…"
            : "Something went wrong"}
        </h1>
        {attempt.state === "saving" ? (
          <p className="type-body mt-2 text-ink/55">Take a slow breath.</p>
        ) : (
          <>
            <p className="type-body mt-2 text-ink/60">{attempt.message}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
    <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
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
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lotus size={28} strokeWidth={1.4} />
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
  const stats = [
    {
      label: "Correct",
      value: result.correct,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Incorrect",
      value: result.incorrect,
      tone: "bg-primary/6 text-primary",
    },
    {
      label: "Skipped",
      value: result.skipped,
      tone: "bg-ink/4 text-ink/70",
    },
  ];

  /** Staggered rise for each block. */
  const rise = (step: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reducedTransition(reduced, {
      duration: 0.6,
      delay: 0.08 * step,
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
    <Container
      size="xl"
      className="grid flex-1 content-center gap-5 py-8 sm:py-12 lg:grid-cols-12 lg:gap-6"
    >
      {/* Score */}
      <motion.div
        {...rise(0)}
        className={`${QUIZ_CARD_CLASS} p-6 sm:p-8 lg:col-span-7 lg:p-10`}
        aria-live="polite"
      >
        <p className="type-eyebrow text-primary">
          {firstName ? `${firstName}, your result` : "Your result"}
        </p>

        <div className="mt-6 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center sm:h-44 sm:w-44">
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
                strokeWidth="6"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="6"
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
              <span className="text-4xl font-semibold tabular-nums text-ink sm:text-5xl">
                {shownPercent}
                <span className="text-2xl text-ink/35">%</span>
              </span>
              <span className="mt-1 text-xs font-medium tabular-nums text-ink/50">
                {result.score} / {result.maxScore} pts
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <span className="type-eyebrow inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-primary">
              {tier.title}
            </span>
            <h1 className="type-h2 mt-3 text-balance text-ink">
              {tier.headline}
            </h1>
            <p className="type-body mt-3 max-w-md text-pretty text-ink/60">
              {tier.message}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col rounded-2xl px-4 py-3.5 ${stat.tone}`}
            >
              <dt className="order-last text-xs font-medium opacity-80">
                {stat.label}
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {stat.value}
                <span className="text-sm font-medium opacity-50">
                  /{totalQuestions}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          <Button href="/yoga-teacher-training-in-rishikesh-india" variant="outline" size="md">
            Explore courses
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-ink/6 pt-5 text-sm text-ink/55">
          <span className="flex items-center gap-2.5">
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: settings.monthlyLimit }, (_, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: chance dots
                  key={index}
                  className={`h-2 w-2 rounded-full ${
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
            className="inline-flex items-center gap-1.5 font-medium text-ink/70 transition hover:text-primary"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Share score"}
          </button>
        </div>
      </motion.div>

      {/* Gift */}
      <motion.div
        {...rise(1)}
        className="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-primary p-6 text-white shadow-[0_24px_60px_-36px_rgb(163_36_50/0.8)] sm:p-8 lg:col-span-5 lg:p-10"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgb(255_255_255/0.14),transparent_60%)]"
          aria-hidden="true"
        />
        <Lotus
          size={320}
          strokeWidth={0.3}
          className="pointer-events-none absolute -right-20 -bottom-24 text-white/10"
        />

        <div className="relative flex flex-1 flex-col">
          <p className="type-eyebrow text-white/75">{settings.giftEyebrow}</p>
          <h2 className="type-h3 mt-3 text-balance">
            {fillQuizName(settings.giftTitle, firstName)}
          </h2>
          {settings.giftBody ? (
            <p className="type-body mt-3 text-white/80">{settings.giftBody}</p>
          ) : null}

          <ul className="mt-6 space-y-2.5">
            {GIFT_PERKS.map(({ icon: PerkIcon, title, desc }) => (
              <li
                key={title}
                className="flex items-center gap-3.5 rounded-2xl bg-white/10 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <PerkIcon size={17} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-white/70">{desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            {settings.giftCtaLabel && settings.giftCtaHref ? (
              <Button
                href={settings.giftCtaHref}
                variant="outline-light"
                size="md"
                className="group w-full sm:w-auto"
              >
                {settings.giftCtaLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            ) : null}
            <p className="mt-4 text-xs leading-relaxed text-white/70">
              Show this result or your registered email at our reception in
              Tapovan, Rishikesh.
            </p>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
