"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import type { PublicQuizQuestion, QuizOption } from "@/content/types/quiz";
import { ArrowRight, Check } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import {
  QUIZ_EYEBROW_CLASS,
  QUIZ_GUTTER_CLASS,
  QUIZ_SERIF_CLASS,
} from "./quiz-panel";

type QuizQuestionCardProps = {
  question: PublicQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
  onSkip: () => void;
  isLastQuestion: boolean;
};

const KBD_CLASS =
  "rounded border border-ink/12 bg-white px-1.5 py-0.5 font-sans text-[0.625rem] text-ink/55";

/**
 * Question step: a fixed header with progress, the prompt beside its answers,
 * and a footer with the next button. Only the prompt and answers slide between
 * questions. Letter keys pick an option and Enter moves on.
 *
 * @param props - Question data, selection state, and navigation handlers
 */
export function QuizQuestionCard({
  question,
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
  const number = String(questionNumber).padStart(2, "0");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      const index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (event.key.length === 1 && index >= 0 && index < optionCount) {
        onSelect(index);
        return;
      }
      if (event.key === "Enter" && canAdvance && target?.tagName !== "BUTTON") {
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [optionCount, canAdvance, onSelect, onNext]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-ink/8" />
        <motion.div
          className="absolute left-0 top-0 h-0.5 w-full origin-left bg-primary"
          initial={false}
          animate={{ scaleX: questionNumber / totalQuestions }}
          transition={reducedTransition(reduced, {
            duration: 0.6,
            ease: EASE_OUT,
          })}
          aria-hidden="true"
        />
        <div
          className={`${QUIZ_GUTTER_CLASS} flex items-center justify-between py-5`}
        >
          <p className={`${QUIZ_EYEBROW_CLASS} text-ink/45`}>
            <span className="sr-only">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span aria-hidden="true">
              <span className="text-primary">Question {number}</span>
              <span className="mx-2 text-ink/20">/</span>
              {String(totalQuestions).padStart(2, "0")}
            </span>
          </p>
          <button
            type="button"
            onClick={onSkip}
            className={`${QUIZ_EYEBROW_CLASS} text-ink/45 underline-offset-4 transition hover:text-ink hover:underline`}
          >
            Skip
          </button>
        </div>
      </div>

      {/* Prompt + answers */}
      <div className="flex flex-1 items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            className={`${QUIZ_GUTTER_CLASS} grid w-full items-center gap-10 py-8 lg:grid-cols-12 lg:gap-12 lg:py-12`}
            initial={reduced ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28 }}
            transition={reducedTransition(reduced, {
              duration: 0.4,
              ease: EASE_OUT,
            })}
          >
            <div className="lg:col-span-5">
              <p className={`${QUIZ_SERIF_CLASS} text-lg italic text-primary`}>
                No. {number}
              </p>
              <h2
                className={`${QUIZ_SERIF_CLASS} mt-4 text-pretty text-3xl leading-[1.15] text-ink sm:text-4xl xl:text-5xl`}
              >
                {question.prompt}
              </h2>
              {question.promptImageUrl ? (
                <div className="relative mt-8 aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={question.promptImageUrl}
                    alt={question.prompt}
                    fill
                    sizes="(min-width: 1024px) 420px, 90vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}
            </div>

            <fieldset
              className={`grid gap-3 border-0 p-0 lg:col-span-6 lg:col-start-7 ${
                imageOptions
                  ? optionCount === 3
                    ? "grid-cols-3"
                    : optionCount === 4
                      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                      : "grid-cols-2"
                  : "grid-cols-1"
              }`}
              aria-label="Answer options"
            >
              {question.options.map((option, index) => (
                <QuizOptionButton
                  key={`${question.id}-${index}`}
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
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 border-t border-ink/8 bg-[#fbf8f4]/90 backdrop-blur-sm">
        <div
          className={`${QUIZ_GUTTER_CLASS} flex items-center justify-between gap-4 py-4`}
        >
          <p className="hidden items-center gap-1.5 text-xs text-ink/40 md:flex">
            <kbd className={KBD_CLASS}>A</kbd>–
            <kbd className={KBD_CLASS}>
              {String.fromCharCode(64 + optionCount)}
            </kbd>
            <span className="mr-3">to choose</span>
            <kbd className={KBD_CLASS}>Enter</kbd>
            <span>to continue</span>
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="group ml-auto h-12 w-full px-8 sm:w-auto"
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
      </div>
    </div>
  );
}

type QuizOptionButtonProps = {
  option: QuizOption;
  index: number;
  /** Image tile instead of a text row. */
  image: boolean;
  selected: boolean;
  reduced: boolean;
  onSelect: (index: number) => void;
};

/**
 * One answer: a lettered row, or an image tile with a caption.
 *
 * @param props - Option data, position, and selection state
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
    whileTap: reduced ? undefined : { scale: 0.99 },
    transition: reducedTransition(reduced, {
      duration: 0.45,
      delay: 0.12 + 0.05 * index,
      ease: EASE_OUT,
    }),
  };

  if (image) {
    return (
      <motion.button
        type="button"
        aria-pressed={selected}
        aria-label={option.label || `Option ${letter}`}
        onClick={() => onSelect(index)}
        {...motionProps}
        className="group text-left focus-visible:outline-none"
      >
        <span
          className={`relative block aspect-square overflow-hidden sm:aspect-4/5 rounded-2xl bg-white ring-offset-4 ring-offset-[#fbf8f4] transition duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary/40 ${
            selected ? "ring-2 ring-primary" : "ring-1 ring-ink/8"
          }`}
        >
          <Image
            src={option.imageUrl}
            alt={option.label || `Option ${letter}`}
            fill
            sizes="(min-width: 1280px) 200px, (min-width: 1024px) 260px, 45vw"
            className={`object-cover transition duration-500 ${
              selected ? "scale-[1.03]" : "group-hover:scale-[1.04]"
            }`}
          />
          <span
            className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-sm transition ${
              selected
                ? "bg-primary text-white"
                : `${QUIZ_SERIF_CLASS} bg-white/90 italic text-ink/70 backdrop-blur-sm`
            }`}
            aria-hidden="true"
          >
            {selected ? <Check size={12} /> : letter}
          </span>
        </span>
        {option.label ? (
          <span
            className={`mt-3 block truncate text-sm transition ${
              selected ? "font-medium text-primary" : "text-ink/70"
            }`}
          >
            {option.label}
          </span>
        ) : null}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(index)}
      {...motionProps}
      className={`group flex w-full items-center gap-5 rounded-2xl border px-5 py-4 text-left transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-6 sm:py-5 ${
        selected
          ? "border-primary/50 bg-white shadow-[0_20px_40px_-28px_rgb(163_36_50/0.55)]"
          : "border-ink/8 bg-white/50 hover:border-ink/15 hover:bg-white"
      }`}
    >
      <span
        className={`${QUIZ_SERIF_CLASS} flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base italic transition duration-300 ${
          selected
            ? "border-primary bg-primary text-white"
            : "border-ink/12 text-ink/55 group-hover:border-primary/40 group-hover:text-primary"
        }`}
        aria-hidden="true"
      >
        {letter}
      </span>
      <span
        className={`flex-1 text-[0.9375rem] leading-snug transition sm:text-base ${
          selected ? "text-ink" : "text-ink/75"
        }`}
      >
        {option.label}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition duration-300 ${
          selected
            ? "border-primary bg-primary text-white"
            : "border-ink/15 text-transparent"
        }`}
        aria-hidden="true"
      >
        <Check size={11} strokeWidth={3} />
      </span>
    </motion.button>
  );
}
