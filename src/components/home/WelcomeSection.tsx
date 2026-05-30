"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { banner_1, banner_2, banner_3 } from "@/assets";
import { Button, Container, Pill } from "@/components/ui";
import { BadgeStar, Star, Users } from "@/icons";
import {
  EASE_OUT,
  reducedTransition,
  starPop,
  VIEWPORT_ONCE,
} from "@/lib/motion";

const GALLERY = [
  {
    src: banner_1,
    alt: "A student in meditation at Nirvana Yoga School Rishikesh",
    caption: "Morning meditation by the Ganga",
  },
  {
    src: banner_2,
    alt: "Sunrise over the Ganges in Rishikesh",
    caption: "Sunrise over the sacred Ganges",
  },
  {
    src: banner_3,
    alt: "Hatha yoga practice in the Himalayan foothills",
    caption: "Hatha yoga in the Himalayan foothills",
  },
] as const;

const TABS = [
  {
    id: "story",
    label: "Our Story",
    paragraphs: [
      "Nirvana Yoga School is more than a teacher training — it is an ancient healing art set in the heart of Rishikesh along the sacred Ganges, elevated by the spirit of Himalayan stillness. Registered with Yoga Alliance, USA, we are among the most trusted traditional yoga schools in India.",
      "With a wise and compassionate teacher team, our residential and online programs take very good care of each student. Each class is an opportunity to explore your inner life, surrounded by a gentle support matrix of community, tradition, and nature.",
    ],
  },
  {
    id: "vision",
    label: "Our Vision",
    paragraphs: [
      "Our vision is to share timeless yogic wisdom with sincerity, care, and devotion. From every breath, posture, and chant, we invite you into a life that feels complete, serene, and deeply aligned — rooted in tradition yet respectful of every individual journey.",
    ],
  },
  {
    id: "promise",
    label: "Our Promise",
    paragraphs: [
      "Whether you join us for a 200-hour foundational training, a deeper 300- or 500-hour immersion, or a soulful retreat, our intention remains steady: to hold the space for meaningful transformation, where yogis learn, grow, and find balance.",
      "Nirvana Yoga School welcomes seekers from around the globe to walk with us on this journey — not as students but as co-travellers. If your heart leads you to Rishikesh for the real yoga experience, we stand ready to receive you with open arms.",
    ],
  },
] as const;

const HIGHLIGHTS = [
  "Yoga Alliance RYS-200 · 300 · 500",
  "Residential & online programs",
  "Sattvic meals & ashram living",
  "Excursions, kirtan & Ganga aarti",
] as const;

const STATS = [
  {
    value: "5.0",
    label: "Star rating",
    sub: "Google · Tripadvisor",
    icon: "star" as const,
  },
  {
    value: "5,000+",
    label: "Students trained",
    sub: "Across 50+ countries",
    icon: "users" as const,
  },
  {
    value: "RYT",
    label: "Yoga Alliance",
    sub: "USA certified",
    icon: "cert" as const,
  },
] as const;

const GALLERY_INTERVAL_MS = 4500;

const statStripVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

const starRowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.45 },
  },
};

function StatIcon({
  type,
  reducedMotion,
}: {
  type: (typeof STATS)[number]["icon"];
  reducedMotion: boolean;
}) {
  if (type === "star") {
    if (reducedMotion) {
      return (
        <div
          className="flex items-center justify-center gap-0.5 h-5"
          role="img"
          aria-label="5 out of 5 stars"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={12} className="w-3 h-3 text-white/90" />
          ))}
        </div>
      );
    }

    return (
      <motion.div
        className="flex items-center justify-center gap-0.5 h-5"
        role="img"
        aria-label="5 out of 5 stars"
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={starRowVariants}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={starPop}>
            <Star size={12} className="w-3 h-3 text-white/90" />
          </motion.div>
        ))}
      </motion.div>
    );
  }
  if (type === "cert") {
    return <BadgeStar className="text-white/75 w-4 h-4 sm:w-5 sm:h-5" />;
  }
  return <Users className="text-white/75 w-4 h-4 sm:w-5 sm:h-5" />;
}

export default function WelcomeSection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const pauseReasonsRef = useRef(new Set<string>());
  const reducedMotion = useReducedMotion();
  const [activeImage, setActiveImage] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryInView, setGalleryInView] = useState(false);
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("story");
  const activeGallery = GALLERY[activeImage];
  const activeTabContent = TABS.find((t) => t.id === activeTab);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setGalleryInView(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const reasons = pauseReasonsRef.current;
    const syncPaused = () => setGalleryPaused(reasons.size > 0);
    const setPause = (reason: string, paused: boolean) => {
      if (paused) reasons.add(reason);
      else reasons.delete(reason);
      syncPaused();
    };

    const onEnter = () => setPause("hover", true);
    const onLeave = () => setPause("hover", false);
    const onFocusIn = () => setPause("focus", true);
    const onFocusOut = (event: FocusEvent) => {
      if (!el.contains(event.relatedTarget as Node)) {
        setPause("focus", false);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || galleryPaused || !galleryInView) return;

    const id = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % GALLERY.length);
    }, GALLERY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [galleryPaused, galleryInView]);

  useEffect(() => {
    const reasons = pauseReasonsRef.current;
    const syncPaused = () => setGalleryPaused(reasons.size > 0);
    const onVisibilityChange = () => {
      if (document.hidden) reasons.add("hidden-tab");
      else reasons.delete("hidden-tab");
      syncPaused();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const selectImage = (index: number) => {
    setActiveImage(index);
  };

  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(reducedMotion ?? false, {
        duration: 0.7,
        ease: EASE_OUT,
      })}
      className="bg-paper py-12 sm:py-14 md:py-16 lg:py-0 lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:items-center overflow-hidden"
    >
      <Container size="2xl" className="w-full lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-6 sm:gap-8 lg:gap-12 xl:gap-14 items-center">
          {/* Copy */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 order-2 lg:order-1 lg:pr-4 xl:pr-8 border-l border-primary/15 pl-4 sm:pl-5 md:pl-6 lg:pl-8">
            <Pill>Yoga Alliance Certified · India</Pill>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-serif font-medium text-[1.625rem] leading-[1.12] sm:text-3xl md:text-4xl lg:text-5xl sm:leading-[1.1] text-ink text-balance tracking-tight">
                Welcome to Nirvana — a{" "}
                <span className="text-primary italic font-normal">
                  sanctuary for the soul
                </span>{" "}
                in Rishikesh
              </h2>
              <div
                className="w-12 h-px bg-linear-to-r from-primary/80 via-accent/70 to-transparent"
                aria-hidden="true"
              />
            </div>

            {/* Tabs */}
            <div className="space-y-3 sm:space-y-4">
              <div
                role="tablist"
                aria-label="About Nirvana Yoga School"
                className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 border-b border-ink/10"
              >
                {TABS.map((tab) => {
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`welcome-panel-${tab.id}`}
                      id={`welcome-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-2.5 sm:pb-3 font-sans text-xs sm:text-sm tracking-wide transition-colors duration-300 ${
                        selected
                          ? "text-primary font-medium"
                          : "text-muted hover:text-ink/80"
                      }`}
                    >
                      {tab.label}
                      {selected && (
                        <span
                          className="absolute inset-x-0 -bottom-px h-px bg-primary"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeTabContent && (
                  <motion.div
                    key={activeTab}
                    id={`welcome-panel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`welcome-tab-${activeTab}`}
                    className="border-l-2 border-accent/35 pl-3 sm:pl-4 md:pl-5 space-y-2.5 sm:space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={reducedTransition(reducedMotion ?? false, {
                      duration: 0.45,
                      ease: EASE_OUT,
                    })}
                  >
                    {activeTabContent.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 32)}
                        className="text-sm leading-relaxed sm:text-base sm:leading-[1.65] text-ink/80 font-sans"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Highlights — single row on desktop */}
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-2.5 pt-2.5 sm:pt-3 border-t border-ink/8">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 sm:gap-2 font-sans text-[0.6875rem] sm:text-xs leading-snug text-ink/70"
                >
                  <span
                    className="mt-2 w-3 h-px bg-accent shrink-0"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                <Button href="#courses" variant="primary" size="sm" responsive>
                  View Courses
                </Button>
                <Button href="#contact" variant="ghost" size="sm" responsive>
                  Speak With Us
                </Button>
              </div>

              {/* Stats — unified strip */}
              <motion.div
                className="welcome-stats-strip rounded-xl sm:rounded-2xl text-white w-full relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
                variants={statStripVariants}
              >
                <motion.div
                  className="pointer-events-none absolute inset-[-50%_-30%]"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 42%, rgb(255 255 255 / 0.14) 50%, transparent 58%)",
                  }}
                  variants={{
                    hidden: { x: "-120%" },
                    visible: {
                      x: "120%",
                      transition: reducedTransition(reducedMotion ?? false, {
                        duration: 1.1,
                        delay: 0.35,
                        ease: EASE_OUT,
                      }),
                    },
                  }}
                  aria-hidden="true"
                />
                <div className="relative grid grid-cols-3">
                  {STATS.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      variants={statItemVariants}
                      className={`flex flex-col items-center justify-center text-center px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-5 md:py-4 min-h-[4.75rem] sm:min-h-[5.5rem] md:min-h-[5.75rem] ${
                        index > 0 ? "border-l border-white/15" : ""
                      }`}
                    >
                      <div className="font-serif text-lg sm:text-xl md:text-2xl leading-none tabular-nums">
                        {stat.value}
                      </div>
                      <div className="flex h-5 items-center justify-center mt-1.5">
                        <StatIcon
                          type={stat.icon}
                          reducedMotion={reducedMotion ?? false}
                        />
                      </div>
                      <div className="type-eyebrow text-[0.625rem] sm:text-[0.65rem] md:text-xs text-white/70 mt-1 sm:mt-1.5 leading-tight">
                        {stat.label}
                      </div>
                      <div className="type-eyebrow text-[0.625rem] sm:text-[0.65rem] text-white/50 mt-0.5 hidden sm:block leading-tight">
                        {stat.sub}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Gallery */}
          <div className="order-1 lg:order-2 w-full">
            <div
              ref={galleryRef}
              aria-live="polite"
              className="welcome-gallery-frame relative h-[260px] sm:h-[340px] md:h-[360px] lg:h-[min(calc(100svh-6.5rem),540px)] xl:h-[min(calc(100svh-6rem),560px)] rounded-[1.25rem] sm:rounded-[1.75rem] lg:rounded-[2rem] overflow-hidden bg-ink/5"
            >
              {GALLERY.map((item, i) => (
                <Image
                  key={item.alt}
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 44vw, 100vw"
                  className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
                    activeImage === i ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              <div
                className="welcome-gallery-vignette absolute inset-0 pointer-events-none"
                aria-hidden="true"
              />

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-5 lg:right-5 hero-glass rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 text-white text-center pointer-events-none">
                <div className="font-serif text-sm sm:text-base lg:text-lg leading-none">
                  2012
                </div>
                <div className="type-eyebrow text-white/60 mt-0.5 sm:mt-1">
                  Est. Rishikesh
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 md:p-6 lg:p-7">
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeGallery.caption}
                      className="font-serif text-lg sm:text-xl md:text-2xl leading-snug text-white max-w-md pointer-events-none"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={reducedTransition(reducedMotion ?? false, {
                        duration: 0.45,
                        ease: EASE_OUT,
                      })}
                    >
                      {activeGallery.caption}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex gap-2">
                    {GALLERY.map((item, i) => {
                      const selected = activeImage === i;
                      return (
                        <button
                          key={item.alt}
                          type="button"
                          onClick={() => selectImage(i)}
                          aria-label={`Show: ${item.caption}`}
                          aria-pressed={selected}
                          className={`h-1 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                            selected
                              ? "w-8 bg-white"
                              : "w-4 bg-white/40 hover:bg-white/65"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-3 lg:hidden">
              {GALLERY.map((item, i) => (
                <button
                  key={item.alt}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => selectImage(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeImage === i ? "w-8 bg-primary" : "w-4 bg-ink/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
