"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui";
import type { QuizSettings } from "@/content/types/quiz";
import { ArrowRight } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import {
  QUIZ_EYEBROW_CLASS,
  QUIZ_GUTTER_CLASS,
  QUIZ_SERIF_CLASS,
} from "./quiz-panel";

type QuizIntroProps = {
  /** Copy, points, and allowance from the CMS. */
  settings: QuizSettings;
  /** Questions in this attempt. */
  questionCount: number;
  /** Signed-in name for the greeting. */
  userName?: string | null;
  /** Attempts left this month, including the one about to start. */
  remainingChances: number;
  /** Starts the question flow. */
  onStart: () => void;
};

/**
 * Opening screen: copy and start on the left, a full-height photo on the right.
 *
 * @param props - Question count, chances left, and start handler
 */
export function QuizIntro({
  settings,
  questionCount,
  userName = null,
  remainingChances,
  onStart,
}: QuizIntroProps) {
  const reduced = useReducedMotion() ?? false;
  const first = userName?.trim().split(/\s+/)[0];
  const monthlyLimit = settings.monthlyLimit;
  const facts = [
    { value: String(questionCount), label: "Questions" },
    { value: `~${settings.estimatedMinutes}`, label: "Minutes" },
    { value: String(settings.pointsPerCorrect), label: "Points each" },
  ];

  /** Staggered rise for each block of copy. */
  const rise = (step: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: reducedTransition(reduced, {
      duration: 0.7,
      delay: 0.08 * step,
      ease: EASE_OUT,
    }),
  });

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative h-48 sm:h-72 lg:order-2 lg:h-auto">
        <Image
          src="/images/yoga-auth-bg.jpg"
          alt="Yoga practice at sunrise above the Himalayan foothills"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[center_62%]"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent"
          aria-hidden="true"
        />
        <p
          className={`${QUIZ_SERIF_CLASS} absolute bottom-6 left-6 text-lg italic text-white/90 lg:bottom-10 lg:left-10`}
        >
          Tapovan, Rishikesh
        </p>
      </div>

      <div
        className={`${QUIZ_GUTTER_CLASS} flex flex-col justify-center py-12 lg:py-16`}
      >
        <motion.p
          {...rise(0)}
          className={`${QUIZ_EYEBROW_CLASS} flex items-center gap-3 text-primary`}
        >
          <span className="h-px w-10 bg-primary/40" aria-hidden="true" />
          {first ? `Namaste, ${first}` : settings.introEyebrow}
        </motion.p>

        <motion.h1
          {...rise(1)}
          className={`${QUIZ_SERIF_CLASS} mt-6 max-w-xl text-balance text-[2.75rem] leading-[1.05] text-ink sm:text-6xl xl:text-7xl`}
        >
          {settings.introTitle}{" "}
          <em className="text-primary">{settings.introHighlight}</em>
        </motion.h1>

        <motion.p
          {...rise(2)}
          className="mt-6 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-ink/55 sm:text-base"
        >
          {settings.introBody}
        </motion.p>

        <motion.dl
          {...rise(3)}
          className="mt-10 grid max-w-md grid-cols-3 border-y border-ink/8"
        >
          {facts.map(({ value, label }, index) => (
            <div
              key={label}
              className={`flex flex-col-reverse py-5 ${index ? "border-l border-ink/8 pl-5" : ""}`}
            >
              <dt className="mt-1 whitespace-nowrap text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/45 sm:text-[0.6875rem] sm:tracking-[0.22em]">
                {label}
              </dt>
              <dd className={`${QUIZ_SERIF_CLASS} text-3xl text-ink`}>
                {value}
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          {...rise(4)}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
        >
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="group shadow-[0_18px_40px_-18px_rgb(163_36_50/0.7)]"
            onClick={onStart}
          >
            Begin the quiz
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
          <p className="flex items-center gap-3 text-xs text-ink/45">
            <span className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: monthlyLimit }, (_, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index < monthlyLimit - remainingChances
                      ? "bg-ink/15"
                      : "bg-primary"
                  }`}
                />
              ))}
            </span>
            {remainingChances} of {monthlyLimit} attempts left this month
          </p>
        </motion.div>
      </div>
    </div>
  );
}
