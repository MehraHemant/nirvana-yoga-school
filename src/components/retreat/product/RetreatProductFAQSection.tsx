"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import type { RetreatProductFaqContent } from "./retreatProductTypes";

type RetreatProductFAQSectionProps = {
  content: RetreatProductFaqContent;
};

/**
 * Single-open FAQ accordion — id `faq`.
 *
 * @param content - Question and answer pairs
 */
export default function RetreatProductFAQSection({
  content,
}: RetreatProductFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <RetreatSectionShell
      id="faq"
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
      className="border-b-0"
    >
      <div className="space-y-3">
        {content.items.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `retreat-faq-${index}`;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-xs transition hover:border-primary/20"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className="font-semibold text-ink">{item.question}</span>
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={
                      prefersReduced ? { duration: 0 } : { duration: 0.2 }
                    }
                  >
                    <Plus size={14} />
                  </motion.span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    initial={
                      prefersReduced
                        ? { opacity: 1, height: "auto" }
                        : { height: 0, opacity: 0 }
                    }
                    animate={{ height: "auto", opacity: 1 }}
                    exit={
                      prefersReduced
                        ? { opacity: 0, height: 0 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { duration: 0.3, ease: EASE_OUT }
                    }
                    className="overflow-hidden"
                  >
                    <p className="border-t border-primary/10 px-5 pb-5 pt-4 type-body text-ink sm:px-6">
                      {item.answer}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </RetreatSectionShell>
  );
}
