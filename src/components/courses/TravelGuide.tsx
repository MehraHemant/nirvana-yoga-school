"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Heading, SectionHeader } from "@/components/ui";
import type { TravelGuideContent } from "@/content/types/shared-sections";
import { ChevronDown } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import { mapTravelTopics, type TravelTopic } from "./travelGuideShared";

/**
 * Topic hero image for the travel guide banner.
 *
 * @param props.topic - Active travel topic
 */
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
        <Heading as="h3" size="h4" invert>
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
  const topics = useMemo(
    () => (content?.topics?.length ? mapTravelTopics(content) : []),
    [content],
  );
  const intro = content?.intro?.trim() || "";
  const topicCount = topics.length;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canAutoRotate, setCanAutoRotate] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    amount: 0.25,
    margin: "-12% 0px -12% 0px",
  });

  // Auto-rotate only on large screens where the accordion column is fixed-height.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setCanAutoRotate(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Keep selection valid when CMS topics load / change.
  useEffect(() => {
    if (topicCount === 0) {
      setActiveId(null);
      return;
    }
    setActiveId((current) => {
      if (current && topics.some((topic) => topic.id === current)) {
        return current;
      }
      return topics[0].id;
    });
  }, [topicCount, topics]);

  // Auto-rotate topics only while the section is stably in view (desktop).
  useEffect(() => {
    if (
      !canAutoRotate ||
      !isInView ||
      isPaused ||
      prefersReduced ||
      topicCount <= 1
    ) {
      return;
    }
    const interval = setInterval(() => {
      setActiveId((current) => {
        if (current === null) return topics[0]?.id ?? null;
        const idx = topics.findIndex((topic) => topic.id === current);
        const safeIdx = idx >= 0 ? idx : 0;
        return topics[(safeIdx + 1) % topics.length].id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [canAutoRotate, isInView, isPaused, prefersReduced, topicCount, topics]);

  if (topicCount === 0) return null;

  const active = topics.find((topic) => topic.id === activeId) ?? topics[0];
  if (!active) return null;

  return (
    <section
      ref={sectionRef}
      id="travel"
      aria-label="Guide to travelling to India"
      className="travel-guide-section relative overflow-x-clip bg-white py-20 sm:py-28"
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

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <div className="h-[260px] sm:h-[340px] lg:min-h-[340px] lg:h-full">
            <HeroBanner topic={active} />
          </div>

          <aside className="flex flex-col gap-2" aria-label="Travel topics">
            {topics.map((topic) => {
              const isActive = activeId === topic.id;
              const { Icon } = topic;
              return (
                <div
                  key={topic.id}
                  className="shrink-0 overflow-hidden rounded-2xl border border-ink/8 transition-colors duration-200"
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

                    <span
                      className={`min-w-0 flex-1 font-sans text-sm font-semibold ${isActive ? "text-white" : "text-ink"}`}
                    >
                      {topic.title}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-300 ${
                        isActive ? "rotate-180 text-white/70" : "text-ink/30"
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.25, ease: EASE_OUT },
                          opacity: { duration: 0.18 },
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
