"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui";
import type { SitePageHighlight } from "@/data/sitePages";
import { reducedTransition } from "@/lib/motion";
import { sectionTone } from "../utils";

export default function HighlightsModule({
  highlights,
  toneIndex,
}: {
  highlights: SitePageHighlight[];
  toneIndex: number;
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const activeItem = highlights[active] ?? highlights[0];

  return (
    <section className={`${sectionTone(toneIndex)} py-12 sm:py-16`}>
      <Container size="2xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActive(index)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  active === index
                    ? "border-primary/30 bg-white shadow-soft"
                    : "border-ink/6 bg-white/70 hover:border-primary/15"
                }`}
              >
                <p className="type-display-sm font-serif text-ink">
                  {item.title}
                </p>
                <p className="mt-2 line-clamp-2 font-sans text-sm text-muted">
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-ink/5 shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reducedTransition(prefersReduced, {
                  duration: 0.35,
                })}
                className="absolute inset-0"
              >
                {activeItem.image ? (
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/5 p-8">
                    <p className="max-w-sm text-center font-serif text-2xl text-primary">
                      {activeItem.title}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="type-eyebrow text-accent">{activeItem.title}</p>
                  <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-white/90">
                    {activeItem.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
