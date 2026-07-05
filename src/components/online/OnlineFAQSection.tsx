"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { FAQ } from "@/content/types";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineFAQSectionProps = {
  faqs: FAQ[];
};

export default function OnlineFAQSection({ faqs }: OnlineFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <OnlineSectionShell
      id="faq"
      title="Frequently Asked Questions"
      className="border-b-0 pb-20"
    >
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-secondary/10 bg-white"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`online-faq-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className="font-medium text-ink">{faq.question}</span>
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    isOpen
                      ? "bg-secondary text-white"
                      : "bg-secondary/10 text-secondary"
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
                {isOpen && (
                  <motion.div
                    id={`online-faq-${index}`}
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
                    <p className="border-t border-secondary/10 px-5 pb-5 pt-4 type-body text-muted sm:px-6">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </OnlineSectionShell>
  );
}
