"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Pill, SectionHeader } from "@/components/ui";
import { ChevronDown } from "@/icons";
import type { TravelGuideContent } from "@/content/types/shared-sections";
import { EASE_OUT } from "@/lib/motion";
import {
  mapTravelTopics,
  TRAVEL_INTRO,
  TRAVEL_TOPICS,
  type TravelTopic,
} from "./travelGuideShared";

function HeroBanner({ topic }: { topic: TravelTopic }) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-ink shadow-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={topic.id}
          initial={prefersReduced ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.45 }}
          className="absolute inset-0"
        >
          <Image
            src={topic.image}
            alt={topic.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/90 via-ink/50 to-ink/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:max-w-lg">
        <Pill invert>{topic.tag}</Pill>
        <Heading as="h3" size="h4" invert className="mt-3">
          {topic.title}
        </Heading>
      </div>
    </div>
  );
}

/**
 * Travel guide section — prefers CMS shared content.
 *
 * @param props.content - Shared travel document from MySQL
 */
export default function TravelGuide({
  content = null,
}: {
  content?: TravelGuideContent | null;
} = {}) {
  const topics = content?.topics?.length
    ? mapTravelTopics(content)
    : TRAVEL_TOPICS;
  const intro = content?.intro?.trim() || TRAVEL_INTRO;

  const [activeId, setActiveId] = useState<string | null>(topics[0]?.id ?? null);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });
  const active =
    topics.find((topic) => topic.id === activeId) ?? topics[0];

  useEffect(() => {
    if (!isInView || isPaused || prefersReduced || topics.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setActiveId((current) => {
        if (current === null) return topics[0].id;
        const idx = topics.findIndex((topic) => topic.id === current);
        return topics[(idx + 1) % topics.length].id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isInView, isPaused, prefersReduced, topics]);

  if (!active) return null;

  return (
    <section
      ref={sectionRef}
      id="travel"
      aria-label="Guide to travelling to India"
      className="relative overflow-x-clip bg-white py-20 sm:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rounded-full bg-accent/6 blur-[100px]"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative">
        {/* Split header */}
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <SectionHeader
            eyebrow="Logistics"
            title={
              <>
                Guide to Travelling to{" "}
                <span className="text-primary">India</span>
              </>
            }
          />
          <p className="type-body border-l-2 border-primary/20 pl-4 font-sans text-muted sm:text-base">
            {intro}
          </p>
        </div>

        {/* Main grid: banner left (fixed height), accordion right (free height) */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Hero banner — fixed height so accordion expanding never resizes it */}
          <div className="h-[260px] sm:h-[340px] lg:h-[520px]">
            <HeroBanner topic={active} />
          </div>

          {/* Topic accordion */}
          <aside className="flex flex-col gap-2" aria-label="Travel topics">
            {topics.map((topic) => {
              const isActive = activeId === topic.id;
              const { Icon } = topic;
              return (
                <div
                  key={topic.id}
                  className="overflow-hidden rounded-2xl border border-ink/8 transition-colors duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(isActive ? null : topic.id)}
                    aria-expanded={isActive}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-sand/40 hover:bg-sand"
                    }`}
                  >
                    {/* icon */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                        isActive ? "bg-white/15" : "bg-primary/10"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon
                        size={15}
                        className={isActive ? "text-white" : "text-primary"}
                      />
                    </span>

                    {/* labels */}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`type-eyebrow block ${isActive ? "text-accent" : "text-primary"}`}
                      >
                        {topic.tag}
                      </span>
                      <span
                        className={`block font-sans text-sm font-semibold ${isActive ? "text-white" : "text-ink"}`}
                      >
                        {topic.title}
                      </span>
                    </span>

                    {/* chevron */}
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-300 ${
                        isActive ? "rotate-180 text-white/70" : "text-ink/30"
                      }`}
                    />
                  </button>

                  {/* Inline detail panel — expands below the active button */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.3, ease: EASE_OUT },
                          opacity: { duration: 0.2 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 bg-paper px-4 py-4">
                          <p className="font-sans text-xs leading-relaxed text-muted sm:text-[13px]">
                            {topic.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </aside>
        </div>
      </Container>
    </section>
  );
}
