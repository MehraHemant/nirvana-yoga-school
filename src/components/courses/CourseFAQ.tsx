"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Plus } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface CourseFAQProps {
  faqs: FAQItem[];
}

export default function CourseFAQ({ faqs }: CourseFAQProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const prefersReduced = useReducedMotion() ?? false;

  // Simple categorization helper based on question keywords
  const getCategory = (question: string, answer: string) => {
    const text = `${question} ${answer}`.toLowerCase();
    if (
      text.includes("certificate") ||
      text.includes("alliance") ||
      text.includes("certified") ||
      text.includes("recognized")
    ) {
      return "certification";
    }
    if (
      text.includes("food") ||
      text.includes("sattvic") ||
      text.includes("room") ||
      text.includes("meals") ||
      text.includes("accommodation")
    ) {
      return "lodging";
    }
    if (
      text.includes("visa") ||
      text.includes("health") ||
      text.includes("requirements") ||
      text.includes("travel")
    ) {
      return "travel";
    }
    return "general";
  };

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General & Prerequisites" },
    { id: "certification", label: "Certification" },
    { id: "lodging", label: "Lodging & Meals" },
    { id: "travel", label: "Travel & Health" },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory === "all") return true;
    return getCategory(faq.question, faq.answer) === selectedCategory;
  });

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white relative">
      <Container size="md">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Got Questions?"
            title={
              <>
                Course <span className="text-primary italic">FAQs</span>
              </>
            }
            align="center"
          />
        </motion.div>

        {/* Category Pills Selector */}
        <div className="flex justify-center mb-10 overflow-x-auto scrollbar-none pb-2 px-4">
          <div className="inline-flex bg-sand p-1 rounded-full border border-ink/5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveIndex(0); // Reset accordion to first item in new category
                  }}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-semibold font-sans tracking-wide transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
                    isActive ? "text-primary" : "text-muted hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFaqCategoryTab"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                      className="absolute inset-0 bg-primary/5 rounded-full"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-4 max-w-3xl mx-auto min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-sand/20 shadow-soft"
                      : "border-ink/10 bg-white hover:border-primary/25"
                  }`}
                >
                  {/* Trigger Button */}
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={`faq-item-answer-${index}`}
                    onClick={() => setActiveIndex(isActive ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <span className="type-display-sm font-semibold text-ink leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? "bg-primary text-white" : "bg-ink/5 text-ink"
                      }`}
                    >
                      <motion.span
                        animate={{ rotate: isActive ? 45 : 0 }}
                        transition={
                          prefersReduced ? { duration: 0 } : { duration: 0.2 }
                        }
                        className="flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </motion.span>
                    </span>
                  </button>

                  {/* Content Container */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={`faq-item-answer-${index}`}
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
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-ink/5 max-w-3xl">
                          <p className="type-body text-muted leading-relaxed font-sans text-sm sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-muted font-sans text-sm border border-dashed border-ink/10 rounded-2xl">
              No questions found in this category.
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
