"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { ChevronLeft, ChevronRight, HeroFlourish, Play } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";

interface CourseOverviewProps {
  overview: string;
  level: string;
  duration: string;
  certification?: string;
  fee?: string;
  videos?: YouTubeVideo[];
  featureImages?: string[];
  eyebrow?: string;
  title?: ReactNode;
  supportingCopy?: string;
  quoteText?: string;
  quoteAttribution?: string;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CourseOverview({
  overview,
  level,
  duration,
  certification = "RYT-200, Yoga Alliance",
  fee = "From 649 USD",
  videos = [],
  featureImages = [],
  eyebrow = "The Inner Path",
  title = (
    <>
      Transform your practice &amp; <span className="text-primary">awaken</span>{" "}
      your true purpose.
    </>
  ),
  supportingCopy = "Our residential yoga training program is designed to facilitate physical purification, emotional release, and intellectual understanding. By immersing yourself completely in the ashram lifecycle, you step away from modern distractions to cultivate discipline, self-inquiry, and authentic teachings handed down through generations.",
  quoteText = "Yoga is not just physical posture; it is a sacred pathway to quieting the mind, understanding the self, and returning to the lineage of ancient wisdom.",
  quoteAttribution = "Himalayan Lineage Teachings",
}: CourseOverviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const resolvedSupporting =
    supportingCopy === "" ? undefined : supportingCopy;
  const showVideoPanel = videos.length > 0;
  const showImagePanel = !showVideoPanel && featureImages.length > 0;

  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (featureImages.length > 0) {
      setActiveImageIndex(0);
    }
  }, [featureImages]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Sync active video when videos prop changes
  useEffect(() => {
    if (videos && videos.length > 0) {
      setActiveVideoId(videos[0].id);
      setIsPlaying(false);
    } else {
      setActiveVideoId("");
      setIsPlaying(false);
    }
  }, [videos]);

  const activeVideo =
    videos.find((v) => v.id === activeVideoId) || videos[0] || null;

  const activeVideoIndex = videos.findIndex((v) => v.id === activeVideoId);

  const overviewSpecs = [
    {
      index: "01",
      label: "Focus Level",
      value: level,
      hint: "All training experience welcome",
    },
    {
      index: "02",
      label: "Immersive Duration",
      value: duration,
      hint: "Full-time ashram residency",
    },
    {
      index: "03",
      label: "Certification",
      value: certification,
      hint: "Worldwide standard credentials",
    },
    {
      index: "04",
      label: "Course Fee",
      value: fee,
      hint: "All-inclusive tuition & board",
      highlight: true,
    },
  ] as const;

  const prevVideo = () => {
    const idx = (activeVideoIndex - 1 + videos.length) % videos.length;
    setActiveVideoId(videos[idx].id);
    setIsPlaying(false);
  };

  const nextVideo = () => {
    const idx = (activeVideoIndex + 1) % videos.length;
    setActiveVideoId(videos[idx].id);
    setIsPlaying(false);
  };

  // Scroll listener to toggle left/right fades dynamically
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || videos.length === 0) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      setShowLeftFade(scrollLeft > 5);
      setShowRightFade(scrollLeft < maxScrollLeft - 5);
    };

    handleScroll(); // Initial check
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [videos.length]);

  return (
    <section
      id="overview"
      className="py-16 sm:py-14 bg-white relative overflow-hidden"
    >
      {/* Background radial glows for premium depth */}
      <div className="absolute right-[-10%] top-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-[10%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px] pointer-events-none" />

      {/* Sacred Geometry Mandalas in Background */}
      <HeroFlourish className="absolute right-[-8%] top-[5%] w-[450px] h-[450px] text-accent/12 pointer-events-none rotate-45" />
      <HeroFlourish className="absolute left-[-12%] bottom-[-5%] w-[380px] h-[380px] text-primary/4 pointer-events-none" />

      <Container size="2xl">
        <div className="space-y-8">
          {/* Header Row */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              align="left"
              className="mb-0!"
            />
          </motion.div>

          {/* 2-Column Split: Editorial Text & Interactive Video */}
          <div
            className={`grid gap-12 items-start ${showVideoPanel || showImagePanel ? "lg:grid-cols-12 lg:gap-16" : ""}`}
          >
            {/* Left: Editorial copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className={`space-y-8 ${showVideoPanel || showImagePanel ? "lg:col-span-6" : "max-w-4xl"}`}
            >
              <div className="space-y-6">
                <p className="type-lead text-muted first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8]">
                  {overview}
                </p>
                {resolvedSupporting && (
                  <p className="type-lead text-muted leading-relaxed font-sans">
                    {resolvedSupporting}
                  </p>
                )}
              </div>

              {/* Premium High-Contrast Blockquote Card */}
              <div className="relative overflow-hidden bg-secondary text-white p-7 sm:p-8 rounded-3xl shadow-card border border-white/10">
                <span
                  className="absolute -left-2 -top-8 font-serif text-[10rem] text-white/8 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  “
                </span>
                <p className="font-serif text-lg sm:text-xl leading-relaxed tracking-wide italic relative z-10">
                  "{quoteText}"
                </p>
                <span className="type-eyebrow text-accent text-right block mt-4 font-semibold tracking-wider relative z-10 uppercase">
                  — {quoteAttribution}
                </span>
              </div>
            </motion.div>

            {/* Right: Cinematic Video Station */}
            {(showVideoPanel || showImagePanel) && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
                variants={fadeUp}
                className="lg:col-span-6 w-full space-y-6"
              >
                {showImagePanel && (
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink/10 shadow-card border border-ink/5">
                    <Image
                      src={featureImages[activeImageIndex] ?? featureImages[0]}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {featureImages.length > 1 && (
                      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                        {featureImages.map((url, index) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            aria-label={`Show image ${index + 1}`}
                            className={`h-2 rounded-full transition-all ${
                              index === activeImageIndex
                                ? "w-6 bg-white"
                                : "w-2 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showVideoPanel && activeVideo && (
                  <div className="w-full">
                    {/* Floating Video Player Panel */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-ink/10 shadow-card hover:shadow-soft border border-ink/5 transition-all duration-500 group">
                      {isPlaying ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full border-0"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="absolute inset-0 w-full h-full p-0 border-0 text-left cursor-pointer focus:outline-none"
                        >
                          <Image
                            src={activeVideo.thumbnailUrl}
                            alt={activeVideo.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-102"
                          />
                          <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/10 transition-colors duration-300" />

                          {/* pulsing play trigger */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="relative flex h-16 w-16 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/45 opacity-75" />
                              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                                <Play size={25} className="" />
                              </span>
                            </span>
                          </div>

                          <span className="hero-glass text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10 absolute bottom-4 left-4 z-10">
                            Course Insights
                          </span>

                          <span className="type-ui absolute bottom-4 right-4 rounded-md bg-ink/80 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
                            {formatDuration(activeVideo.durationSeconds)}
                          </span>
                        </button>
                      )}

                      {/* Prev / Next arrows — always visible when multiple videos */}
                      {videos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); prevVideo(); }}
                            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/80 text-ink/70 shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:text-ink hover:scale-105"
                            aria-label="Previous video"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); nextVideo(); }}
                            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/80 text-ink/70 shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:text-ink hover:scale-105"
                            aria-label="Next video"
                          >
                            <ChevronRight size={18} />
                          </button>

                          {/* Video counter */}
                          <span className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink/55 px-3 py-1 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
                            {activeVideoIndex + 1} / {videos.length}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Playlist Selector - Horizontal Filmstrip */}
                    {videos.length > 1 && (
                      <div className="space-y-3 mt-6">
                        <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                          <span className="type-eyebrow text-[10px] text-muted uppercase tracking-wider font-semibold">
                            Course Videos &amp; Testimonials ({videos.length})
                          </span>
                          <span className="type-eyebrow text-[9.5px] text-muted font-sans flex items-center gap-1.5 opacity-80">
                            Swipe to browse →
                          </span>
                        </div>

                        {/* Horizontal filmstrip container */}
                        <div className="relative">
                          {/* Side fades to mask scrollable edges dynamically */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                              showLeftFade ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div
                            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                              showRightFade ? "opacity-100" : "opacity-0"
                            }`}
                          />

                          <div
                            ref={scrollContainerRef}
                            className="flex flex-nowrap gap-3.5 overflow-x-auto pb-2 px-1 scrollbar-none snap-x snap-mandatory"
                          >
                            {videos.map((vid) => {
                              const isActive = vid.id === activeVideo.id;
                              return (
                                <button
                                  key={vid.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveVideoId(vid.id);
                                    setIsPlaying(true);
                                  }}
                                  className="w-28 sm:w-32 shrink-0 text-left snap-start group/item cursor-pointer focus:outline-none"
                                  aria-label={`Play video: ${vid.title}`}
                                >
                                  <div
                                    className={`relative aspect-video w-full rounded-xl overflow-hidden border transition-all duration-300 ${
                                      isActive
                                        ? "border-primary ring-2 ring-primary/20 scale-95"
                                        : "border-ink/10 opacity-70 hover:opacity-100 hover:scale-95 shadow-xs"
                                    }`}
                                  >
                                    <Image
                                      src={vid.thumbnailUrl}
                                      alt=""
                                      fill
                                      sizes="120px"
                                      className="object-cover"
                                    />
                                    <div
                                      className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
                                        isActive ? "bg-primary/20" : "bg-ink/30"
                                      }`}
                                    >
                                      {isActive ? (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white scale-90 shadow-md">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        </span>
                                      ) : (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-primary scale-90 opacity-0 group-hover/item:opacity-100 transition-all duration-300 shadow-md">
                                          <Play size={8} className="ml-0.5" />
                                        </span>
                                      )}
                                    </div>
                                    <span className="type-ui absolute bottom-1 right-1 bg-ink/75 px-1 py-0.2 rounded text-[8.5px] font-medium text-white backdrop-blur-xs">
                                      {formatDuration(vid.durationSeconds)}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-medium leading-tight overflow-hidden mt-1.5 transition-colors duration-300 ${
                                      isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted group-hover/item:text-ink"
                                    }`}
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      height: "25px",
                                    }}
                                  >
                                    {vid.title}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Bottom specs — course snapshot card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="relative mt-12 overflow-hidden rounded-3xl bg-linear-to-br from-white via-white to-sand/50 shadow-card ring-1 ring-ink/6"
          >
            <HeroFlourish
              className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 text-primary/6"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-1 border-b border-ink/6 bg-sand/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="type-eyebrow font-semibold uppercase tracking-[0.2em] text-primary">
                Course at a glance
              </p>
              <p className="font-sans text-xs text-muted">
                Residential program essentials
              </p>
            </div>

            <div className="relative grid grid-cols-1 divide-y divide-ink/6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {overviewSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className={`group relative flex flex-col gap-3 px-6 py-8 transition-colors sm:px-7 md:py-9 ${
                    "highlight" in spec && spec.highlight
                      ? "bg-linear-to-br from-primary/10 via-primary/5 to-transparent lg:rounded-br-3xl"
                      : "hover:bg-sand/25"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="type-eyebrow font-semibold uppercase tracking-wider text-primary">
                      {spec.label}
                    </span>
                    <span
                      className="font-serif text-lg leading-none text-primary/20"
                      aria-hidden="true"
                    >
                      {spec.index}
                    </span>
                  </div>
                  <p
                    className={`font-serif text-2xl font-medium leading-[1.15] tracking-tight sm:text-[1.65rem] ${
                      "highlight" in spec && spec.highlight
                        ? "text-primary"
                        : "text-ink"
                    }`}
                  >
                    {spec.value}
                  </p>
                  <p className="max-w-[16rem] font-sans text-xs leading-relaxed text-muted">
                    {spec.hint}
                  </p>
                  <span
                    className={`absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 sm:left-7 sm:right-7 ${
                      "highlight" in spec && spec.highlight
                        ? "bg-primary/25"
                        : "bg-accent/50"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
