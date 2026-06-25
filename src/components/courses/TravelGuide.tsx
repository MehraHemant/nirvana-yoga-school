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
import { EASE_OUT } from "@/lib/motion";
import {
  TRAVEL_INTRO,
  TRAVEL_TOPICS,
  type TravelTopic,
} from "./travelGuideShared";

function TopicCallout({ topic }: { topic: TravelTopic }) {
  if (topic.id === "reach") {
    return (
      <div className="rounded-2xl border border-primary/10 bg-primary/4 px-5 py-4">
        <p className="type-eyebrow text-primary">Airport transfer</p>
        <p className="mt-2 type-body font-sans text-ink/85">
          Complimentary pick-up from Dehradun Airport for all registered
          students. Delhi Airport transfers available for $80 USD.
        </p>
      </div>
    );
  }
  if (topic.id === "visa") {
    return (
      <div className="rounded-2xl border border-secondary/10 bg-secondary/4 px-5 py-4">
        <p className="type-eyebrow text-secondary">Apply early</p>
        <p className="mt-2 type-body font-sans text-ink/85">
          Submit your e-Tourist Visa application 15–30 days before departure for
          the smoothest processing timeline.
        </p>
      </div>
    );
  }
  return null;
}

function DetailPanel({ topic }: { topic: TravelTopic }) {
  return (
    <div className="space-y-5">
      <p className="type-body font-sans leading-relaxed text-muted">
        {topic.content}
      </p>
      <TopicCallout topic={topic} />
    </div>
  );
}

function HeroBanner({ topic }: { topic: TravelTopic }) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-3xl bg-ink shadow-card sm:min-h-[260px]">
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

export default function TravelGuide() {
  const [activeId, setActiveId] = useState(TRAVEL_TOPICS[0].id);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });
  const active =
    TRAVEL_TOPICS.find((topic) => topic.id === activeId) ?? TRAVEL_TOPICS[0];

  // Auto-advance topics — only while in view; pauses on hover/focus and
  // respects reduced motion.
  useEffect(() => {
    if (!isInView || isPaused || prefersReduced || TRAVEL_TOPICS.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setActiveId((current) => {
        const idx = TRAVEL_TOPICS.findIndex((topic) => topic.id === current);
        return TRAVEL_TOPICS[(idx + 1) % TRAVEL_TOPICS.length].id;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isInView, isPaused, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      id="travel"
      aria-label="Guide to travelling to India"
      className="relative overflow-x-clip border-b border-ink/5 bg-white py-20 sm:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rounded-full bg-secondary/5 blur-[100px]"
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
            {TRAVEL_INTRO}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <div className="flex min-h-[220px] flex-col sm:min-h-[260px]">
            <HeroBanner topic={active} />
          </div>
          <aside className="flex flex-col gap-2" aria-label="Travel topics">
            {TRAVEL_TOPICS.map((topic) => {
              const isActive = activeId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveId(topic.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`cursor-pointer rounded-2xl border px-4 py-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-ink/8 bg-sand/40 hover:border-primary/30"
                  }`}
                >
                  <p
                    className={`type-eyebrow ${isActive ? "text-accent" : "text-primary"}`}
                  >
                    {topic.tag}
                  </p>
                  <p
                    className={`mt-1 font-sans text-sm font-semibold ${isActive ? "text-white" : "text-ink"}`}
                  >
                    {topic.title}
                  </p>
                </button>
              );
            })}
          </aside>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={active.id}
            initial={prefersReduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.35, ease: EASE_OUT }
            }
            className="mt-6 rounded-3xl border border-ink/8 bg-paper p-6 sm:p-8"
          >
            <DetailPanel topic={active} />
          </motion.article>
        </AnimatePresence>
      </Container>
    </section>
  );
}
