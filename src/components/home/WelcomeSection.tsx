"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Container, Heading, Pill } from "@/components/ui";
import type { HomeWelcomeContent } from "@/content/types/dedicated-pages";
import { Check, Play } from "@/icons";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { EASE_OUT, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";
import { parseYouTubeId } from "@/lib/youtube";

type WelcomeSectionProps = {
  /** Optional CMS welcome band content */
  content?: HomeWelcomeContent;
};

const leftColumnContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const galleryItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.15 },
  },
  hover: {
    scale: 1.015,
    y: -8,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

const rightColumnContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const rightColumnItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/**
 * Builds a YouTube embed URL for the welcome overview player.
 *
 * @param videoId - YouTube video id
 * @param autoplay - Whether to autoplay after click-to-play
 */
function buildWelcomeEmbedUrl(videoId: string, autoplay: boolean) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    showinfo: "0",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type WelcomeVideoPlayerProps = {
  url: string;
  poster?: string;
  title?: string;
  prefersReduced: boolean;
};

/**
 * Click-to-play overview video — YouTube iframe or native MP4.
 *
 * @param props - Video URL, optional poster, and motion preference
 */
function WelcomeVideoPlayer({
  url,
  poster,
  title = "Overview video",
  prefersReduced,
}: WelcomeVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = parseYouTubeId(url);
  const isMp4 = /\.mp4($|\?)/i.test(url);
  const posterSrc =
    poster?.trim() ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "");

  if (playing && youtubeId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-ink/5 bg-ink shadow-card">
        <iframe
          src={buildWelcomeEmbedUrl(youtubeId, true)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (playing && isMp4) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-ink/5 bg-ink shadow-card">
        {/* biome-ignore lint/a11y/useMediaCaption: CMS overview promo clip */}
        <video
          src={url}
          poster={posterSrc || undefined}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      variants={galleryItemVariants}
      whileHover={prefersReduced ? undefined : "hover"}
      onClick={() => setPlaying(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-ink/5 bg-ink/10 shadow-card text-left"
      aria-label={`Play ${title}`}
    >
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-ink/20" />
      )}
      <span className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
          <Play size={22} className="ml-0.5" aria-hidden="true" />
        </span>
      </span>
    </motion.button>
  );
}

/**
 * Homepage welcome / about band with rotating stats and highlights.
 * When {@link HomeWelcomeContent.video} has a URL, the left column shows a
 * single video player instead of the image collage (online hub).
 *
 * @param props - Optional CMS welcome fields
 */
export default function WelcomeSection({
  content = createEmptyHomePageContent().welcome,
}: WelcomeSectionProps) {
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const rotatingStats = content.rotatingStats;
  const highlights = content.highlights;
  const videoUrl = content.video?.url?.trim() || "";
  const showVideo = Boolean(videoUrl);
  const images = content.images.length
    ? content.images
    : createEmptyHomePageContent().welcome.images;
  const [imageA, imageB, imageC] = images;
  const showVision =
    Boolean(content.vision.label?.trim()) ||
    Boolean(content.vision.body?.trim());
  const showPromise =
    Boolean(content.promise.label?.trim()) ||
    Boolean(content.promise.body?.trim());
  const sectionFallback = content.sectionFallbackId?.trim() || "about";

  useEffect(() => {
    if (showVideo || rotatingStats.length === 0) return;
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % rotatingStats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [rotatingStats.length, showVideo]);

  return (
    <motion.section
      id={resolveSectionHtmlId(sectionFallback, content._id)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(prefersReduced, {
        duration: 0.6,
        ease: EASE_OUT,
      })}
      className="bg-white section-padding-y relative overflow-hidden"
    >
      <Container size="2xl" className="w-full lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* Left Column — video player or 2x2 collage */}
          <motion.div
            variants={leftColumnContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="order-2 lg:order-1 w-full relative"
          >
            {showVideo ? (
              <div className="w-full max-w-2xl mx-auto lg:mx-0">
                <WelcomeVideoPlayer
                  url={videoUrl}
                  poster={content.video?.poster}
                  title={content.video?.title}
                  prefersReduced={prefersReduced}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl mx-auto lg:mx-0 pr-6 pb-6 sm:pr-8 sm:pb-8 md:pr-10 md:pb-10">
                {/* Cell 1: Rotating Stats Card (Absolute positioned overlap) */}
                <div className="relative w-full aspect-square">
                  <motion.div
                    variants={galleryItemVariants}
                    whileHover={prefersReduced ? undefined : "hover"}
                    className="absolute left-6 top-6 right-[-24px] bottom-[-24px] sm:left-8 sm:top-8 sm:right-[-32px] sm:bottom-[-32px] md:left-10 md:top-10 md:right-[-40px] md:bottom-[-40px] z-10 select-none bg-primary text-white rounded-3xl shadow-card border border-primary/10 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 text-center"
                  >
                    {/* Subtle decorative glow overlays */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-md pointer-events-none" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4 text-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeStatIndex}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={reducedTransition(prefersReduced, {
                            duration: 0.35,
                            ease: EASE_OUT,
                          })}
                          className="flex flex-col items-center"
                        >
                          <span className="type-h1 font-bold leading-none text-white mb-2">
                            {rotatingStats[activeStatIndex]?.value}
                          </span>
                          <span className="type-eyebrow text-white/95 max-w-[85%] leading-tight">
                            {rotatingStats[activeStatIndex]?.label}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Cell 2: Image 1 */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full aspect-square"
                >
                  <motion.div
                    animate={prefersReduced ? {} : { y: [0, -5] }}
                    transition={
                      prefersReduced
                        ? {}
                        : {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 3,
                            ease: "easeInOut",
                            delay: 0.2,
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src={imageA.src}
                      alt={imageA.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </motion.div>
                </motion.div>

                {/* Cell 3: Image 2 */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full aspect-square"
                >
                  <motion.div
                    animate={prefersReduced ? {} : { y: [0, -6] }}
                    transition={
                      prefersReduced
                        ? {}
                        : {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2.8,
                            ease: "easeInOut",
                            delay: 0.4,
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src={imageB.src}
                      alt={imageB.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                </motion.div>

                {/* Cell 4: Image 3 */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full aspect-square"
                >
                  <motion.div
                    animate={prefersReduced ? {} : { y: [0, -5] }}
                    transition={
                      prefersReduced
                        ? {}
                        : {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 3.2,
                            ease: "easeInOut",
                            delay: 0.6,
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src={imageC.src}
                      alt={imageC.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Clean Copy & Structured Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={rightColumnContainer}
            className="order-1 lg:order-2 flex flex-col gap-6"
          >
            <motion.div variants={rightColumnItem}>
              <Pill>{content.eyebrow}</Pill>
            </motion.div>

            <motion.div
              variants={rightColumnItem}
              className="space-y-3 sm:space-y-4"
            >
              <Heading as="h2" align="left" size="h2" className="text-balance">
                {content.title}
              </Heading>
              <div
                className="w-12 h-px bg-linear-to-r from-primary/80 via-accent/70 to-transparent"
                aria-hidden="true"
              />
            </motion.div>

            {/* Lead Story Paragraph */}
            <motion.div variants={rightColumnItem}>
              <p className="text-base md:text-lg leading-snug font-semibold text-ink">
                {content.lead}
              </p>
            </motion.div>

            {/* Split Grid for Vision and Promise */}
            {showVision || showPromise ? (
              <motion.div
                variants={rightColumnItem}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2"
              >
                {showVision ? (
                  <div className="space-y-2 border-t border-ink/5 pt-4">
                    <span className="text-primary font-bold text-sm uppercase tracking-wide block">
                      {content.vision.label}
                    </span>
                    <p className="text-sm sm:text-sm md:text-base leading-snug font-semibold text-ink">
                      {content.vision.body}
                    </p>
                  </div>
                ) : null}

                {showPromise ? (
                  <div className="space-y-2 border-t border-ink/5 pt-4">
                    <span className="text-primary font-bold text-sm uppercase tracking-wide block">
                      {content.promise.label}
                    </span>
                    <p className="text-sm sm:text-sm md:text-base leading-snug font-semibold text-ink">
                      {content.promise.body}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            {/* Highlights List - Minimalist check grid */}
            {highlights.length > 0 ? (
              <motion.div
                variants={rightColumnItem}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-ink/10"
              >
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 cursor-default select-none"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold leading-tight text-ink">
                      {item}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : null}

            {/* CTA Buttons */}
            {content.ctaLabel?.trim() ? (
              <motion.div
                variants={rightColumnItem}
                className="flex flex-wrap gap-2.5 sm:gap-3"
              >
                <Button
                  href={content.ctaHref}
                  variant="primary"
                  size="md"
                  responsive
                  className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  {content.ctaLabel}
                </Button>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}
