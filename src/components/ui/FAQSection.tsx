"use client";

import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  DEFAULT_FAQ_CATEGORY,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import { groupFaqsByCategory } from "@/lib/cms/faq-utils";
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
  category?: FaqCategoryId | string;
};

export type FAQSectionProps = {
  id?: string;
  faqs: FAQEntry[];
  eyebrow?: string;
  title: ReactNode;
  align?: "left" | "center";
  sectionClassName?: string;
};

type FaqViewMode = "all" | FaqCategoryId;

function faqItemKey(faq: FAQEntry, categoryId: string, index: number) {
  return `${categoryId}-${index}-${faq.question}`;
}

/**
 * Two-column FAQ band with optional category tabs and grouped browsing.
 */
export default function FAQSection({
  id = "faq",
  faqs,
  eyebrow,
  title,
  align = "center",
  sectionClassName = "",
}: FAQSectionProps) {
  const groups = useMemo(() => groupFaqsByCategory(faqs), [faqs]);
  const [activeView, setActiveView] = useState<FaqViewMode>(
    DEFAULT_FAQ_CATEGORY,
  );
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const categoryTabs = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        label: group.label,
      })),
    [groups],
  );

  const showCategoryTabs = categoryTabs.length > 1;
  const tabs = showCategoryTabs
    ? [{ id: "all", label: "All" }, ...categoryTabs]
    : categoryTabs;

  const visibleItems = useMemo(() => {
    if (activeView === "all") {
      return groups.flatMap((group) =>
        group.items.map((faq, index) => ({
          faq,
          key: faqItemKey(faq, group.id, index),
        })),
      );
    }

    const group = groups.find((candidate) => candidate.id === activeView);
    return (group?.items ?? []).map((faq, index) => ({
      faq,
      key: faqItemKey(faq, activeView, index),
    }));
  }, [groups, activeView]);

  const leftColumn = visibleItems.filter((_, index) => index % 2 === 0);
  const rightColumn = visibleItems.filter((_, index) => index % 2 !== 0);

  const renderColumn = (columnFaqs: Array<{ faq: FAQEntry; key: string }>) => (
    <div className="space-y-4 sm:space-y-5">
      {columnFaqs.map(({ faq, key }) => (
        <FAQItem
          key={key}
          question={faq.question}
          answer={faq.answer}
          image={faq.image}
          tag={faq.tag}
          index={0}
          isActive={activeKey === key}
          onToggle={() =>
            setActiveKey((current) => (current === key ? null : key))
          }
        />
      ))}
    </div>
  );

  return (
    <section
      id={id}
      className={`overflow-hidden section-padding-y ${sectionClassName || "bg-light-gray"}`}
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className={`mb-8 sm:mb-10 md:mb-16 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}
        >
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            align={align}
            className={align === "center" ? "mx-auto" : undefined}
          />
        </motion.div>

        {faqs.length > 0 ? (
          <div className="space-y-8 sm:space-y-10">
            {showCategoryTabs ? (
              <TabSwitcher
                tabs={tabs}
                activeId={activeView}
                onChange={(nextId) => {
                  setActiveView(nextId as FaqViewMode);
                  setActiveKey(null);
                }}
                layoutId={`${id}-faq-categories`}
                size="sm"
                className="mb-2"
              />
            ) : null}

            <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2">
              {renderColumn(leftColumn)}
              {renderColumn(rightColumn)}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
