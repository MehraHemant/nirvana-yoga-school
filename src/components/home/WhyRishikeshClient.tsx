"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Container, Heading, Pill } from "@/components/ui";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import type { HomeWhyRishikeshContent } from "@/content/types/dedicated-pages";
import { Play } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

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

/**
 * Formats a duration in seconds as `m:ss`.
 *
 * @param totalSeconds - Total duration in seconds
 * @returns Formatted duration string
 */
function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Builds a YouTube embed URL with autoplay for the Why Rishikesh player.
 *
 * @param videoId - YouTube video id
 * @returns Embed URL
 */
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
  /** CMS Why Rishikesh section content */
  content?: HomeWhyRishikeshContent;
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

/**
 * Interactive Why Rishikesh client UI (sutras, trust logos, video card).
 *
 * @param props - CMS content plus resolved YouTube metadata
 */
export default function WhyRishikeshClient({
  content = createEmptyHomePageContent().whyRishikesh,
  videoId,
  videoTitle,
  thumbnailUrl,
  durationSeconds,
}: WhyRishikeshClientProps) {
  const sutras =
    content.sutras?.length > 0
      ? content.sutras
      : createEmptyHomePageContent().whyRishikesh.sutras;
  const trustLogos =
    content.trustLogos?.length > 0
      ? content.trustLogos
      : createEmptyHomePageContent().whyRishikesh.trustLogos;
  const videoCard =
    content.videoCard ?? createEmptyHomePageContent().whyRishikesh.videoCard;

  const [activeSutraIndex, setActiveSutraIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (prefersReduced || isPaused || isPlaying) return;

    const intervalTime = 100;
    const duration = 15000;
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

  useEffect(() => {
    if (progress >= 100) {
      setActiveSutraIndex((prevIndex) => (prevIndex + 1) % sutras.length);
      setProgress(0);
    }
  }, [progress, sutras.length]);

  return (
    <Container size="2xl">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 lg:gap-10 mb-8 sm:mb-10 lg:mb-10 items-end"
      >
        <div>
          {content.eyebrow ? <Pill>{content.eyebrow}</Pill> : null}
          <Heading
            as="h2"
            align="left"
            font="serif"
            size="h2"
            className="mt-3 sm:mt-4 text-balance"
          >
            {content.title}{" "}
            {content.titleAccent ? (
              <span className="text-primary font-medium">
                {content.titleAccent}
              </span>
            ) : null}
            {content.description ? ` ${content.description}` : null}
          </Heading>
        </div>

        <div className="flex items-start justify-center">
          <div className="flex items-center gap-6 sm:gap-8 pt-2">
            {trustLogos.map((logo) => (
              <div
                key={logo.src}
                className="relative w-24 h-24 sm:w-36 sm:h-36 transition-transform duration-300 hover:scale-105"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10 items-start">
        <div className="space-y-6">
          <div className="relative flex gap-6 items-stretch">
            <div
              className="hidden sm:flex flex-col items-center relative select-none"
              aria-hidden="true"
            >
              <div className="w-px bg-ink/8 absolute top-8 bottom-8 left-1/2 -translate-x-1/2" />
              <motion.div
                className="w-px bg-primary absolute top-8 left-1/2 -translate-x-1/2 origin-top"
                animate={{
                  height: `${(activeSutraIndex / Math.max(sutras.length - 1, 1)) * 68}%`,
                }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>

            <motion.div
              className="flex-1 space-y-4"
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              {sutras.map((sutra, i) => {
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
                      <span
                        className={`font-serif text-xl sm:text-2xl leading-none transition-colors duration-300 select-none ${
                          isActive ? "text-primary font-medium" : "text-ink"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <h3
                        className={`type-display-sm transition-colors duration-300 ${
                          isActive ? "text-ink font-semibold" : "text-ink"
                        }`}
                      >
                        {sutra.title}
                      </h3>

                      <span className="ml-auto shrink-0" aria-hidden="true">
                        <motion.span
                          animate={{ rotate: isActive ? 45 : 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                            isActive ? "hidden" : "bg-ink/5 text-ink/40"
                          }`}
                        >
                          ＋
                        </motion.span>
                      </span>
                    </div>

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
                            <p className="type-body text-xs sm:text-sm text-ink leading-relaxed">
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

          <div className="border-l border-primary/20 pl-4 py-1 mt-4">
            <p className="font-poppins italic text-base sm:text-lg md:text-lg font-normal leading-snug text-ink">
              "{content.closingInvitation}"
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover={prefersReduced ? undefined : "hover"}
            viewport={VIEWPORT_ONCE}
            variants={playerCardVariants}
            className="bg-white rounded-[1.75rem] p-4 sm:p-5 shadow-card border border-ink/5 flex flex-col gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="type-eyebrow text-primary tracking-wider">
                  {videoCard.eyebrow}
                </span>
                <span
                  className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
              </div>
              <h3 className="type-display-sm font-semibold mt-1 text-ink leading-tight">
                {videoCard.title}
              </h3>
            </div>

            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video shadow-soft ring-1 ring-ink/5 bg-ink/5 group">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                  aria-label={`Play video: ${videoTitle}`}
                >
                  <Image
                    src={thumbnailUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 90vw, 450px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/25 transition-colors duration-300" />

                  <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider text-white bg-ink/40 border border-white/10 backdrop-blur-xs">
                    {videoCard.speakerTag}
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-2.5 rounded-full bg-white/10 scale-125 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                        <Play size={14} className="ml-0.5 fill-white" />
                      </span>
                    </div>
                  </div>

                  <span className="type-ui absolute bottom-3 right-3 rounded-md bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs tabular-nums">
                    {formatDuration(durationSeconds)}
                  </span>
                </button>
              ) : (
                <iframe
                  src={buildEmbedUrl(videoId)}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>

            <div className="pb-3 border-b border-ink/5">
              <p className="type-ui text-xs sm:text-sm font-medium text-ink leading-snug line-clamp-2">
                {videoTitle}
              </p>
              <p className="type-eyebrow text-ink mt-1 text-[9px]">
                {videoCard.speakerSubtitle}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Container>
  );
}
