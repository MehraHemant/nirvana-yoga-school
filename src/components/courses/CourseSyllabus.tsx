"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Plus } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface SyllabusSection {
  title: string;
  description: string;
  subtopics: string[];
}

type SyllabusSidebar = {
  title: string;
  subtitle?: string;
  items: { area: string; hours: string; pct?: string }[];
  footerNote?: string;
};

interface CourseSyllabusProps {
  description: string;
  syllabus: SyllabusSection[];
  /** Replace default YTT hours distribution sidebar */
  sidebar?: SyllabusSidebar;
  /** Hide right sidebar column entirely */
  hideSidebar?: boolean;
  subtopicsLabel?: string;
  /** Public section HTML id (defaults to `syllabus`) */
  htmlId?: string;
}

export default function CourseSyllabus({
  description,
  syllabus,
  sidebar,
  hideSidebar = false,
  subtopicsLabel = "Core Study Modules:",
  htmlId = "syllabus",
}: CourseSyllabusProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const prefersReduced = useReducedMotion() ?? false;

  const distributionItems = sidebar?.items ?? [
    { area: "Asana & Alignment Clinic", hours: "100 Hours", pct: "50%" },
    { area: "Pranayama, Cleansing & Shatkarma", hours: "30 Hours", pct: "15%" },
    { area: "Anatomy & Kinesiology", hours: "20 Hours", pct: "10%" },
    { area: "Philosophy, Sutras & Lineage", hours: "30 Hours", pct: "15%" },
    { area: "Teaching Methodology & Practicum", hours: "20 Hours", pct: "10%" },
  ];

  const sidebarTitle = sidebar?.title ?? "Hours Distribution";
  const sidebarSubtitle =
    sidebar?.subtitle ?? "Certified 200-Hour Syllabus Standards";
  const sidebarFooter =
    sidebar?.footerNote ??
    "📜 Yoga Alliance curriculum details are updated regularly to stay aligned with current international teacher standards.";
  const showProgressBars = !sidebar;

  return (
    <section id={htmlId} className="py-20 sm:py-28 bg-white">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Curriculum"
            title={
              <>
                Syllabus &amp; <span className="text-primary">Structure</span>
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-6 max-w-xl mx-auto font-sans text-base sm:text-lg">
            {description}
          </p>
        </motion.div>

        <div
          className={`grid gap-12 items-start ${hideSidebar ? "" : "lg:grid-cols-12 lg:gap-12"}`}
        >
          <div className={`space-y-4 ${hideSidebar ? "" : "lg:col-span-8"}`}>
            {syllabus.map((item, index) => {
              const isOpen = openIndex === index;
              const moduleNumber = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={item.title}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-primary bg-surface-muted shadow-soft"
                      : "surface-panel border-ink/10 hover:border-primary/50"
                  }`}
                >
                  {/* Accordion header button */}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`syllabus-section-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-serif text-sm sm:text-base font-semibold text-primary/60 select-none">
                        {moduleNumber}
                      </span>
                      <span className="type-display-sm text-ink">
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? "bg-primary text-white" : "bg-ink/5 text-ink"
                      }`}
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={
                          prefersReduced ? { duration: 0 } : { duration: 0.2 }
                        }
                        className="flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </motion.span>
                    </span>
                  </button>

                  {/* Collapsible Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`syllabus-section-${index}`}
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
                        <div className="px-5 sm:px-16 pb-6 pt-1 border-t border-ink/5 space-y-5">
                          <p className="type-body text-muted leading-relaxed font-sans text-sm sm:text-base">
                            {item.description}
                          </p>

                          <div className="surface-panel rounded-2xl p-5 shadow-xs">
                            <span className="type-eyebrow text-primary block mb-3">
                              {subtopicsLabel}
                            </span>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {item.subtopics.map((topic) => (
                                <div
                                  key={topic}
                                  className="flex items-start gap-2.5"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                  <span className="text-xs sm:text-sm text-ink/80 leading-normal font-sans font-medium">
                                    {topic}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {!hideSidebar && (
            <div className="lg:col-span-4 lg:sticky lg:top-36">
              <div className="surface-card rounded-3xl p-6 sm:p-8">
                <h3 className="type-display-sm text-ink mb-1">
                  {sidebarTitle}
                </h3>
                <p className="text-xs text-muted font-sans mb-6">
                  {sidebarSubtitle}
                </p>

                <div className="space-y-4">
                  {distributionItems.map((item) => (
                    <div key={item.area} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold font-sans">
                        <span className="text-ink/85">{item.area}</span>
                        <span className="text-primary">{item.hours}</span>
                      </div>
                      {showProgressBars && item.pct && (
                        <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: item.pct }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="surface-panel mt-8 rounded-2xl p-4 text-center font-sans text-xs leading-relaxed text-muted">
                  {sidebarFooter}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
