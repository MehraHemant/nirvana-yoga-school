"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, reducedTransition } from "@/lib/motion";

type QuizImmersiveLayoutProps = {
  /** Foreground quiz content; each step fills the area below the header. */
  children: ReactNode;
  /** Changes when the visible step changes so the screens crossfade. */
  stepKey?: string;
};

/**
 * Full-viewport ivory canvas below the site header. Steps lay themselves out
 * edge to edge and scroll internally when they outgrow the viewport.
 *
 * @param props - Composed foreground content and the current step key
 */
export function QuizImmersiveLayout({
  children,
  stepKey = "quiz",
}: QuizImmersiveLayoutProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="relative flex h-svh w-full min-w-0 flex-col overflow-hidden bg-[#fbf8f4] pt-(--site-header-height) text-ink">
      <div className="relative grid min-h-0 flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={stepKey}
            className="col-start-1 row-start-1 flex min-h-0 flex-col overflow-y-auto overscroll-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedTransition(reduced, {
              duration: 0.45,
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
 * Centered single-message screen (closed, month limit, grading).
 *
 * @param props - Message content
 */
export function QuizCenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">{children}</div>
    </div>
  );
}
