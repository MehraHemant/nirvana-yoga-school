"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import type { SitePageSection } from "@/data/sitePages";
import { Check, Plus } from "@/icons";
import { reducedTransition } from "@/lib/motion";
import { sectionTone } from "../utils";

export default function TimelineModule({
  section,
  toneIndex,
}: {
  section: SitePageSection;
  toneIndex: number;
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const steps = section.subsections ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = steps[activeIndex] ?? steps[0];

  return (
    <section className={`${sectionTone(toneIndex)} py-16 sm:py-20`}>
      <Container size="2xl">
        <SectionHeader
          eyebrow="Itinerary"
          title={<span className="text-balance">{section.title}</span>}
          description={section.body?.split("\n\n")[0]}
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  activeIndex === index
                    ? "border-primary/30 bg-white shadow-soft"
                    : "border-ink/6 bg-white/70 hover:border-primary/15"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold ${
                    activeIndex === index
                      ? "bg-primary text-white"
                      : "bg-sand text-ink"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-sans text-sm font-semibold leading-snug text-ink">
                  {step.title}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={active?.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reducedTransition(prefersReduced, { duration: 0.25 })}
              className="overflow-hidden rounded-3xl border border-ink/6 bg-white shadow-card"
            >
              {active?.image && (
                <div className="relative aspect-[21/9] bg-sand">
                  <Image
                    src={active.image}
                    alt={active.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-primary" />
                  <h3 className="type-display-sm font-serif text-ink">
                    {active?.title}
                  </h3>
                </div>
                {active?.body && (
                  <p className="type-body font-sans leading-relaxed text-muted">
                    {active.body}
                  </p>
                )}
                {active?.items && active.items.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {active.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 font-sans text-sm text-muted"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
