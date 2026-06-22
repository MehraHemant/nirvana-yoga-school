"use client";

import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import Container from "./Container";
import FAQItem from "./FAQItem";
import SectionHeader from "./SectionHeader";
import TabSwitcher from "./TabSwitcher";

export type FAQEntry = {
  question: string;
  answer: string;
  image?: string | StaticImageData;
  tag?: string;
  category?: string;
};

export type FAQCategory = {
  id: string;
  label: string;
};

export type FAQSectionProps = {
  id?: string;
  faqs: FAQEntry[];
  eyebrow?: string;
  title: ReactNode;
  align?: "left" | "center";
  sectionClassName?: string;
  /** When provided, renders category filter tabs above the grid */
  categories?: FAQCategory[];
};

export const COURSE_FAQ_CATEGORIES: FAQCategory[] = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General & Prerequisites" },
  { id: "certification", label: "Certification" },
  { id: "lodging", label: "Lodging & Meals" },
  { id: "travel", label: "Travel & Health" },
];

export function getCourseFaqCategory(faq: FAQEntry): string {
  if (faq.category) return faq.category;

  const text = `${faq.question} ${faq.answer}`.toLowerCase();

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
}

export default function FAQSection({
  id = "faq",
  faqs,
  eyebrow,
  title,
  align = "center",
  sectionClassName = "",
  categories,
}: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!categories || selectedCategory === "all") return faqs;
    return faqs.filter((faq) => getCourseFaqCategory(faq) === selectedCategory);
  }, [categories, faqs, selectedCategory]);

  const leftColumnFaqs = filteredFaqs.filter((_, index) => index % 2 === 0);
  const rightColumnFaqs = filteredFaqs.filter((_, index) => index % 2 !== 0);

  const renderItem = (faq: FAQEntry, index: number) => (
    <FAQItem
      key={faq.question}
      question={faq.question}
      answer={faq.answer}
      image={faq.image}
      tag={faq.tag}
      index={index}
      isActive={activeIndex === index}
      onToggle={() =>
        setActiveIndex((current) => (current === index ? null : index))
      }
    />
  );

  return (
    <section
      id={id}
      className={`overflow-hidden bg-light-gray py-12 sm:py-14 lg:py-16 ${sectionClassName}`}
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className={`mb-8 sm:mb-10 md:mb-16 ${
            align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
          }`}
        >
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            align={align}
            className={align === "center" ? "mx-auto" : undefined}
          />
        </motion.div>

        {categories && categories.length > 0 && (
          <TabSwitcher
            tabs={categories}
            activeId={selectedCategory}
            onChange={(nextId) => {
              setSelectedCategory(nextId);
              setActiveIndex(null);
            }}
            layoutId="activeFaqCategoryTab"
            size="sm"
            className="mb-8 sm:mb-10"
          />
        )}

        {filteredFaqs.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2">
            <div className="space-y-4 sm:space-y-5">
              {leftColumnFaqs.map((faq, index) => renderItem(faq, index * 2))}
            </div>
            <div className="space-y-4 sm:space-y-5">
              {rightColumnFaqs.map((faq, index) =>
                renderItem(faq, index * 2 + 1),
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/10 py-12 text-center font-sans text-sm text-muted">
            No questions found in this category.
          </div>
        )}
      </Container>
    </section>
  );
}
