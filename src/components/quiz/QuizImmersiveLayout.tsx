"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import { QUIZ_CARD_CLASS } from "./quiz-panel";

type QuizImmersiveLayoutProps = {
  /** Foreground quiz content; each step fills the area below the header. */
  children: ReactNode;
  /** Changes when the visible step changes so the screens crossfade. */
  stepKey?: string;
};

/**
 * Full-viewport white canvas below the site header. Steps lay themselves out
 * inside it and scroll internally when they outgrow the viewport.
 *
 * @param props - Composed foreground content and the current step key
 */
export function QuizImmersiveLayout({
  children,
  stepKey = "quiz",
}: QuizImmersiveLayoutProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="relative flex h-svh w-full min-w-0 flex-col overflow-hidden bg-white pt-(--site-header-height) text-ink">
      <div
        className="pointer-events-none absolute -left-40 top-24 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-primary/4 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative grid min-h-0 flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={stepKey}
            className="col-start-1 row-start-1 flex min-h-0 flex-col overflow-y-auto overscroll-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedTransition(reduced, {
              duration: 0.4,
              ease: EASE_OUT,
            })}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/**
 * Centered single-message card (closed, month limit, grading).
 *
 * @param props - Message content
 */
export function QuizCenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
      <div
        className={`${QUIZ_CARD_CLASS} w-full max-w-lg px-6 py-10 text-center sm:px-10 sm:py-12`}
      >
        {children}
      </div>
    </div>
  );
}
