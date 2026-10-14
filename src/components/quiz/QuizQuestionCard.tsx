"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button, Container } from "@/components/ui";
import type { PublicQuizQuestion, QuizOption } from "@/content/types/quiz";
import { ArrowRight, Check } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import { QUIZ_CARD_CLASS } from "./quiz-panel";

/** How an earlier question was left. */
export type QuizStepOutcome = "answered" | "skipped";

type QuizQuestionCardProps = {
  question: PublicQuizQuestion;
  /** Outcome of each earlier question, in order. */
  history: QuizStepOutcome[];
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
  onSkip: () => void;
  isLastQuestion: boolean;
};

const KBD_CLASS =
  "rounded-md border border-ink/10 bg-white px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-ink/55";

/** Above this many questions the progress is one bar instead of segments. */
const MAX_PROGRESS_SEGMENTS = 20;

/** Text answers this short sit two to a row on wider screens. */
const SHORT_OPTION_CHARS = 32;

/**
 * One segment per question: answered, skipped, current, or still to come.
 * Long quizzes fall back to a single filling bar.
 *
 * @param props - Earlier outcomes, current position, and question count
 */
function QuizProgress({
  history,
  current,
  total,
  reduced,
}: {
  history: QuizStepOutcome[];
  current: number;
  total: number;
  reduced: boolean;
}) {
  if (total > MAX_PROGRESS_SEGMENTS) {
    return (
      <div
        className="h-1.5 overflow-hidden rounded-full bg-ink/6"
        aria-hidden="true"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-primary"
          initial={false}
          animate={{ scaleX: current / total }}
          transition={reducedTransition(reduced, {
            duration: 0.6,
            ease: EASE_OUT,
          })}
        />
      </div>
    );
  }

  return (
    <ol className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => {
        const outcome = history[index];
        const tone =
          outcome === "answered"
            ? "bg-primary"
            : outcome === "skipped"
              ? "bg-ink/20"
              : index === current
                ? "bg-primary/30"
                : "bg-ink/6";
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: one segment per position
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${tone}`}
          />
        );
      })}
    </ol>
  );
}

/**
 * Question step: progress above a white question card, and a sticky footer
 * with skip and continue. Letter or number keys pick an option and Enter
 * moves on.
 *
 * @param props - Question data, selection state, and navigation handlers
 */
export function QuizQuestionCard({
  question,
  history,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelect,
  onNext,
  onSkip,
  isLastQuestion,
}: QuizQuestionCardProps) {
  const reduced = useReducedMotion() ?? false;
  const canAdvance = selectedIndex !== null;
  const optionCount = question.options.length;
  const imageOptions = question.optionType === "image";
  const shortOptions =
    !imageOptions &&
    question.options.every(
      (option) => option.label.length <= SHORT_OPTION_CHARS,
    );
  const percentDone = Math.round(((questionNumber - 1) / totalQuestions) * 100);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // New question: scroll the step back to the top and move focus to the prompt.
  useEffect(() => {
    rootRef.current?.parentElement?.scrollTo({ top: 0 });
    if (questionNumber > 1) headingRef.current?.focus({ preventScroll: true });
  }, [questionNumber]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      // A–F or 1–6 pick an answer.
      const key = event.key.toUpperCase();
      let index = -1;
      if (/^[A-Z]$/.test(key)) index = key.charCodeAt(0) - 65;
      else if (/^[1-9]$/.test(key)) index = Number(key) - 1;
      if (index >= 0 && index < optionCount) {
        onSelect(index);
        return;
      }
      if (event.key === "Enter" && canAdvance && target?.tagName !== "BUTTON") {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [optionCount, canAdvance, onSelect, onNext]);

  return (
    <div ref={rootRef} className="flex flex-1 flex-col">
      <Container size="md" className="flex-1 py-6 sm:py-10">
        {/* Progress */}
        <div className="flex items-center justify-between gap-4">
          <p className="type-eyebrow text-primary">
            Question {questionNumber}
            <span className="text-ink/35"> of {totalQuestions}</span>
          </p>
          <p className="text-xs font-medium tabular-nums text-ink/45">
            {percentDone}% done
          </p>
        </div>
        <div className="mt-3">
          <QuizProgress
            history={history}
            current={questionNumber - 1}
            total={totalQuestions}
            reduced={reduced}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            className={`${QUIZ_CARD_CLASS} mt-6 p-5 sm:mt-8 sm:p-8 lg:p-10`}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={reducedTransition(reduced, {
              duration: 0.35,
              ease: EASE_OUT,
            })}
          >
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="type-h3 text-pretty text-ink outline-none"
            >
              {question.prompt}
            </h2>
            <p className="mt-2 text-sm text-ink/50">
              {imageOptions ? "Pick the image that fits." : "Pick one answer."}{" "}
              Not sure? Skipping just scores zero.
            </p>

            {question.promptImageUrl ? (
              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-ink/3">
                <Image
                  src={question.promptImageUrl}
                  alt={question.prompt}
                  fill
                  sizes="(min-width: 1024px) 860px, 92vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            <fieldset
              className={`mt-6 grid gap-3 border-0 p-0 sm:mt-8 ${
                imageOptions
                  ? optionCount === 3
                    ? "grid-cols-3"
                    : optionCount === 4
                      ? "grid-cols-2 sm:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3"
                  : shortOptions
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              <legend className="sr-only">Answer options</legend>
              {question.options.map((option, index) => (
                <QuizOptionButton
                  // biome-ignore lint/suspicious/noArrayIndexKey: options are positional
                  key={index}
                  option={option}
                  index={index}
                  image={imageOptions}
                  selected={selectedIndex === index}
                  reduced={reduced}
                  onSelect={onSelect}
                />
              ))}
            </fieldset>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 border-t border-ink/6 bg-white/90 backdrop-blur-md">
        <Container
          size="md"
          className="flex items-center justify-between gap-3 py-3.5 sm:py-4"
        >
          <div className="hidden items-center gap-1.5 text-xs text-ink/45 md:flex">
            <kbd className={KBD_CLASS}>A</kbd>
            <span>–</span>
            <kbd className={KBD_CLASS}>
              {String.fromCharCode(64 + optionCount)}
            </kbd>
            <span className="mr-2">to choose</span>
            <kbd className={KBD_CLASS}>Enter</kbd>
            <span>to continue</span>
          </div>
          <div className="flex w-full items-center gap-2 sm:gap-3 md:ml-auto md:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="text-ink/55 hover:text-ink"
              onClick={onSkip}
            >
              {isLastQuestion ? "Skip & finish" : "Skip"}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="group flex-1 md:flex-none md:px-8"
              disabled={!canAdvance}
              onClick={onNext}
            >
              {isLastQuestion ? "See my results" : "Continue"}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
}

type QuizOptionButtonProps = {
  option: QuizOption;
  index: number;
  image: boolean;
  selected: boolean;
  reduced: boolean;
  onSelect: (index: number) => void;
};

/**
 * One answer: a lettered row for text answers or a captioned tile for images.
 *
 * @param props - Option data, position, selection state, and select handler
 */
function QuizOptionButton({
  option,
  index,
  image,
  selected,
  reduced,
  onSelect,
}: QuizOptionButtonProps) {
  const letter = String.fromCharCode(65 + index);
  const motionProps = {
    initial: reduced ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    whileTap: reduced ? undefined : { scale: 0.985 },
    transition: reducedTransition(reduced, {
      duration: 0.35,
      delay: 0.06 + 0.04 * index,
      ease: EASE_OUT,
    }),
  };
  const badge = (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
        selected
          ? "bg-primary text-white"
          : "bg-ink/4 text-ink/55 group-hover:bg-primary/10 group-hover:text-primary"
      }`}
      aria-hidden="true"
    >
      {selected ? <Check size={14} strokeWidth={3} /> : letter}
    </span>
  );

  if (image) {
    return (
      <motion.button
        type="button"
        aria-pressed={selected}
        aria-label={option.label || `Option ${letter}`}
        onClick={() => onSelect(index)}
        {...motionProps}
        className={`group overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          selected
            ? "border-primary ring-1 ring-primary"
            : "border-ink/8 hover:border-primary/30 hover:shadow-md"
        }`}
      >
        <span className="relative block aspect-square overflow-hidden bg-ink/3">
          <Image
            src={option.imageUrl}
            alt={option.label || `Option ${letter}`}
            fill
            sizes="(min-width: 640px) 220px, 45vw"
            className={`object-cover transition-transform duration-500 ${
              selected ? "scale-[1.03]" : "group-hover:scale-[1.04]"
            }`}
          />
        </span>
        <span className="flex items-center gap-2.5 px-3 py-2.5">
          {badge}
          {option.label ? (
            <span
              className={`min-w-0 truncate text-sm ${
                selected ? "font-medium text-primary" : "text-ink/75"
              }`}
            >
              {option.label}
            </span>
          ) : null}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(index)}
      {...motionProps}
      className={`group flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-5 sm:py-4 ${
        selected
          ? "border-primary bg-primary/4 ring-1 ring-primary"
          : "border-ink/8 bg-white hover:border-primary/30 hover:bg-primary/2"
      }`}
    >
      {badge}
      <span
        className={`type-body flex-1 leading-snug ${
          selected ? "font-medium text-ink" : "text-ink/80"
        }`}
      >
        {option.label}
      </span>
    </motion.button>
  );
}
