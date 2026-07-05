"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import OnlineSectionShell from "./OnlineSectionShell";

type SyllabusSection = {
  title: string;
  description: string;
  subtopics: string[];
};

type OnlineCurriculumSectionProps = {
  description: string;
  syllabus: SyllabusSection[];
};

export default function OnlineCurriculumSection({
  description,
  syllabus,
}: OnlineCurriculumSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <OnlineSectionShell
      id="syllabus"
      title="Curriculum"
      description={description}
    >
      <div className="space-y-3">
        {syllabus.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.title}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                isOpen
                  ? "border-secondary/20 bg-white shadow-card"
                  : "border-secondary/10 bg-white/80 hover:border-secondary/20"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`online-curriculum-${index}`}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              >
                <span className="font-serif text-lg text-ink sm:text-xl">
                  {item.title}
                </span>
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
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
                    id={`online-curriculum-${index}`}
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
                    <div className="space-y-4 border-t border-secondary/10 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                      {item.description && (
                        <p className="type-body text-muted">
                          {item.description}
                        </p>
                      )}
                      {item.subtopics.length > 0 && (
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {item.subtopics.map((topic) => (
                            <li
                              key={topic}
                              className="flex items-start gap-2 text-sm text-ink/85"
                            >
                              <span
                                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
