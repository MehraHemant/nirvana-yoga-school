"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
import type { QuizSettings } from "@/content/types/quiz";
import { ArrowRight, BookOpen, Clock, Star } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import { QUIZ_TILE_CLASS } from "./quiz-panel";

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
 * Opening screen: copy, quiz facts, and start beside a rounded photo.
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
    { icon: BookOpen, value: String(questionCount), label: "Questions" },
    {
      icon: Clock,
      value: `~${settings.estimatedMinutes} min`,
      label: "To finish",
    },
    {
      icon: Star,
      value: String(settings.pointsPerCorrect),
      label: "Points each",
    },
  ];

  /** Staggered rise for each block of copy. */
  const rise = (step: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reducedTransition(reduced, {
      duration: 0.6,
      delay: 0.07 * step,
      ease: EASE_OUT,
    }),
  });

  return (
    <Container
      size="xl"
      className="grid flex-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:gap-16"
    >
      <div>
        <motion.p {...rise(0)} className="type-eyebrow text-primary">
          {first ? `Namaste, ${first}` : settings.introEyebrow}
        </motion.p>

        <motion.h1
          {...rise(1)}
          className="type-h1 mt-4 max-w-xl text-balance text-ink"
        >
          {settings.introTitle}{" "}
          <span className="text-primary">{settings.introHighlight}</span>
        </motion.h1>

        <motion.p
          {...rise(2)}
          className="type-body-lg mt-5 max-w-lg text-pretty text-ink/60"
        >
          {settings.introBody}
        </motion.p>

        <motion.dl
          {...rise(3)}
          className="mt-8 grid max-w-lg grid-cols-3 gap-3"
        >
          {facts.map(({ icon: FactIcon, value, label }) => (
            <div key={label} className={`${QUIZ_TILE_CLASS} flex flex-col`}>
              <FactIcon size={16} className="text-primary" />
              <dt className="order-last text-xs text-ink/50">{label}</dt>
              <dd className="mt-2 text-lg font-semibold text-ink sm:text-xl">
                {value}
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          {...rise(4)}
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="group w-full sm:w-auto"
            onClick={onStart}
          >
            Start the quiz
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
          <p className="flex items-center justify-center gap-2.5 text-sm text-ink/55 sm:justify-start">
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: monthlyLimit }, (_, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
                  key={index}
                  className={`h-2 w-2 rounded-full ${
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

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedTransition(reduced, {
          duration: 0.8,
          delay: 0.1,
          ease: EASE_OUT,
        })}
        className="relative order-first aspect-16/10 overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_-36px_rgb(26_20_16/0.45)] lg:order-none lg:aspect-4/5 lg:max-h-[calc(100svh-var(--site-header-height)-7rem)] lg:w-full"
      >
        <Image
          src="/images/yoga-auth-bg.jpg"
          alt="Yoga practice at sunrise above the Himalayan foothills"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover object-[center_62%]"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"
          aria-hidden="true"
        />
        <p className="type-eyebrow absolute bottom-5 left-5 text-white/90 sm:bottom-7 sm:left-7">
          Tapovan · Rishikesh
        </p>
      </motion.div>
    </Container>
  );
}
