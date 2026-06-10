"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Container, Pill } from "@/components/ui";
import { Play } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const SUTRAS = [
  {
    title: "A Sacred Rhythm",
    body: "There is a sacred rhythm in Rishikesh that cannot be explained but must be felt. It lives in the crispness of the morning air, hums in the silence between the ringing of temple bells, and moves rhythmically in the gentle flow of the river Ganga. For centuries, seekers from all over the world have come here in the drawing of something beyond words. To learn yoga in Rishikesh is to become part of that ancient stream of wisdom, healing, and inner peace.",
  },
  {
    title: "Remembering Who You Are",
    body: "Yoga in India is another way of remembering who you truly are. Sitting here in the serene Himalayan foothills and being immersed in the spiritual undercurrent of this holy land, your yoga practice transcends the physical. The asanas start to stir something within; the breathing turns from unconscious to a prayer; the meditation deepens into stillness, as if the very mountains are meditating with you.",
  },
  {
    title: "The Sages' Presence",
    body: "The energy of this land holds the memory of sages who walked here before us — those silent saints who sat by the river and dissolved the limits between self and universe. When you sit beside the Ganga at sunrise or bring your voice in chanting, you find yourself feeling light, clear, and alive. It isn't a spell — it's presence, and Rishikesh can bring you home to it.",
  },
] as const;

const CLOSING_INVITATION =
  "So come… for we warmly invite you to experience it yourself. Walk with us on the banks of this sacred river. Breathe with the mountains. Let Rishikesh remind you of your wholeness, of your stillness, and the vast, beautiful peace that lies within you.";

const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const playerCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 16, delay: 0.15 },
  },
  hover: {
    y: -4,
    boxShadow:
      "0 20px 40px -15px rgba(163, 36, 50, 0.08), 0 0 0 1px rgba(163, 36, 50, 0.04)",
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

const pillContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const pillVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type WhyRishikeshClientProps = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export default function WhyRishikeshClient({
  videoId,
  title,
  thumbnailUrl,
  durationSeconds,
}: WhyRishikeshClientProps) {
  const [activeSutraIndex, setActiveSutraIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (prefersReduced || isPaused || isPlaying) return;

    const intervalTime = 100; // tick every 100ms
    const duration = 15000; // 15 seconds
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, isPlaying, prefersReduced]);

  // Separate effect to handle sutra transition when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      setActiveSutraIndex((prevIndex) => (prevIndex + 1) % SUTRAS.length);
      setProgress(0);
    }
  }, [progress]);

  return (
    <Container size="2xl">
      {/* ── Section Header (Split Grid to Eliminate Empty Side Space) ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 lg:gap-10 mb-8 sm:mb-10 lg:mb-10 items-end"
      >
        <div>
          <Pill>The Yoga Capital of the World</Pill>
          <h2 className="font-serif font-medium text-[1.625rem] leading-[1.12] sm:text-3xl md:text-4xl lg:text-[2.25rem] lg:leading-[1.1] text-ink mt-3 sm:mt-4 text-balance">
            Why learn yoga in{" "}
            <span className="italic font-normal text-primary animate-glow-primary">
              Rishikesh
            </span>{" "}
            — where earth, sky, and spirit meet
          </h2>
        </div>

        <div className="flex flex-col items-start gap-3">
          <p className="text-muted text-base sm:text-lg leading-7">
            For centuries, seekers have been drawn to this sacred land at the
            foothills of the Himalayas. Here, yoga is not just practised — it is
            lived, breathed, and remembered.
          </p>
          {/* Decorative rule */}
          <div
            className="w-12 h-px bg-linear-to-r from-primary/40 to-transparent"
            aria-hidden="true"
          />
        </div>
      </motion.div>

      {/* ── Two-column: Interactive Sutras left + Sticky player right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10 items-start">
        {/* Left Column — Timeline-style interactive accordion */}
        <div className="space-y-6">
          <div className="relative flex gap-6 items-stretch">
            {/* Stepper Timeline Line (Desktop only) */}
            <div
              className="hidden sm:flex flex-col items-center relative select-none"
              aria-hidden="true"
            >
              <div className="w-px bg-ink/8 absolute top-8 bottom-8 left-1/2 -translate-x-1/2" />
              {/* Highlight Fill Line */}
              <motion.div
                className="w-px bg-primary absolute top-8 left-1/2 -translate-x-1/2 origin-top"
                animate={{
                  height: `${(activeSutraIndex / (SUTRAS.length - 1)) * 68}%`,
                }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>

            {/* Accordion Cards */}
            <motion.div
              className="flex-1 space-y-4"
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              {SUTRAS.map((sutra, i) => {
                const isActive = activeSutraIndex === i;
                return (
                  <motion.button
                    key={sutra.title}
                    type="button"
                    onClick={() => {
                      setActiveSutraIndex(i);
                      setProgress(0);
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                    variants={itemVariants}
                    className={`w-full text-left rounded-3xl p-4 sm:p-5 transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer relative overflow-hidden ${
                      isActive
                        ? "bg-white shadow-soft border-primary/20 ring-1 ring-primary/10"
                        : "bg-white/40 border-ink/5 hover:bg-white/80 hover:border-ink/10"
                    }`}
                  >
                    {/* Time Progress Line (Above/Top of Card) */}
                    {isActive && !prefersReduced && (
                      <div
                        className="absolute top-0 left-0 right-0 h-1 bg-ink/5"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full bg-primary transition-[width] duration-100 ease-linear origin-left"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    <div className="flex gap-4 items-center">
                      {/* Indicator Number */}
                      <span
                        className={`font-serif text-xl sm:text-2xl leading-none transition-colors duration-300 select-none ${
                          isActive ? "text-primary font-medium" : "text-ink/30"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Sutra Title */}
                      <h3
                        className={`font-serif text-base sm:text-lg transition-colors duration-300 ${
                          isActive ? "text-ink font-semibold" : "text-ink/75"
                        }`}
                      >
                        {sutra.title}
                      </h3>

                      {/* Toggle Chevron / Plus Indicator */}
                      <span className="ml-auto shrink-0" aria-hidden="true">
                        <motion.span
                          animate={{ rotate: isActive ? 45 : 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-ink/5 text-ink/40"
                          }`}
                        >
                          ＋
                        </motion.span>
                      </span>
                    </div>

                    {/* Expandable Paragraph Body */}
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={
                            prefersReduced
                              ? { opacity: 1, height: "auto" }
                              : { opacity: 0, height: 0 }
                          }
                          animate={{ opacity: 1, height: "auto" }}
                          exit={
                            prefersReduced
                              ? { opacity: 0, height: 0 }
                              : { opacity: 0, height: 0 }
                          }
                          transition={{ duration: 0.35, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 border-t border-ink/5 mt-3">
                            <p className="type-body text-xs sm:text-sm text-ink/80 leading-relaxed">
                              {sutra.body}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* ── Closing Pull Quote ── */}
          <div className="border-l border-primary/20 pl-4 py-1 mt-4">
            <p className="font-serif italic sm:text-lg  text-ink/65">
              "{CLOSING_INVITATION}"
            </p>
          </div>
        </div>

        {/* Right Column — Unified Media Player Card */}
        <div className="lg:sticky lg:top-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover={prefersReduced ? undefined : "hover"}
            viewport={VIEWPORT_ONCE}
            variants={playerCardVariants}
            className="bg-white rounded-[1.75rem] p-4 sm:p-5 shadow-card border border-ink/5 flex flex-col gap-4"
          >
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2">
                <span className="type-eyebrow text-primary tracking-wider">
                  Founder's Wisdom
                </span>
                <span
                  className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-serif text-lg sm:text-xl mt-1 text-ink leading-tight">
                Spiritual Guidance with Gurudev
              </h3>
            </div>

            {/* Video Box Container */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video shadow-soft ring-1 ring-ink/5 bg-ink/5 group">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                  aria-label="Play video: Why Learning Yoga in Rishikesh is Life-Changing by Gurudev Dhruvaji"
                >
                  {/* Video Thumbnail */}
                  <Image
                    src={thumbnailUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 90vw, 450px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/25 transition-colors duration-300" />

                  {/* Glass Tag Upper Left */}
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider text-white bg-ink/40 border border-white/10 backdrop-blur-xs">
                    Gurudev Dhruvaji
                  </span>

                  {/* Custom Glass Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      {/* Outer Pulse Circle */}
                      <div className="absolute -inset-2.5 rounded-full bg-white/10 scale-125 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
                      {/* Core Glass Button */}
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                        <Play size={14} className="ml-0.5 fill-white" />
                      </span>
                    </div>
                  </div>

                  {/* Duration tag Bottom Right */}
                  <span className="type-ui absolute bottom-3 right-3 rounded-md bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs tabular-nums">
                    {formatDuration(durationSeconds)}
                  </span>
                </button>
              ) : (
                <iframe
                  src={buildEmbedUrl(videoId)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>

            {/* Video details & Speaker */}
            <div className="pb-3 border-b border-ink/5">
              <p className="type-ui text-xs sm:text-sm font-medium text-ink leading-snug line-clamp-2">
                {title}
              </p>
              <p className="type-eyebrow text-muted mt-1 text-[9px]">
                Founder & Spiritual Master · Nirvana Yoga School
              </p>
            </div>

            {/* Highlights Horizontal Pills */}
            <div>
              <h4 className="type-eyebrow text-ink/45 mb-2.5 tracking-wider text-[9px]">
                Why Rishikesh?
              </h4>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={pillContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
              >
                {[
                  "Birthplace of Yoga",
                  "River Ganga Energy",
                  "Himalayan Stillness",
                  "Lineage Masters",
                ].map((item) => (
                  <motion.span
                    key={item}
                    variants={pillVariants}
                    className="type-ui text-[11px] font-semibold bg-sand/60 border border-ink/5 px-2.5 py-1 rounded-full text-ink/75 hover:bg-white hover:shadow-xs transition-all duration-300"
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Container>
  );
}
