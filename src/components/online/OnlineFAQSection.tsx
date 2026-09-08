"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { FAQ } from "@/content/types";
import {
  DEFAULT_FAQ_CATEGORY,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import { groupFaqsByCategory } from "@/lib/cms/faq-utils";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import { TabSwitcher } from "@/components/ui";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineFAQSectionProps = {
  id?: string;
  faqs: FAQ[];
};

type FaqViewMode = "all" | FaqCategoryId;

function faqItemKey(faq: FAQ, categoryId: string, index: number) {
  return `${categoryId}-${index}-${faq.question}`;
}

/**
 * Online course FAQ accordion with fixed category tabs.
 */
export default function OnlineFAQSection({
  id = "faq",
  faqs,
}: OnlineFAQSectionProps) {
  const groups = useMemo(() => groupFaqsByCategory(faqs), [faqs]);
  const [activeView, setActiveView] = useState<FaqViewMode>(
    DEFAULT_FAQ_CATEGORY,
  );
  const [openKey, setOpenKey] = useState<string | null>(null);
  const prefersReduced = useReducedMotion() ?? false;

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

  return (
    <OnlineSectionShell
      id={id}
      title="Frequently Asked Questions"
      className="border-b-0 pb-20"
    >
      <div className="space-y-8">
        {showCategoryTabs ? (
          <TabSwitcher
            tabs={tabs}
            activeId={activeView}
            onChange={(nextId) => {
              setActiveView(nextId as FaqViewMode);
              setOpenKey(null);
            }}
            layoutId={`${id}-online-faq-categories`}
            size="sm"
          />
        ) : null}

        <div className="space-y-3">
          {visibleItems.map(({ faq, key }) => {
            const isOpen = openKey === key;

            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-primary/10 bg-white"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`online-faq-${key}`}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="font-semibold text-ink">{faq.question}</span>
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}
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
                      id={`online-faq-${key}`}
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
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </OnlineSectionShell>
  );
}
