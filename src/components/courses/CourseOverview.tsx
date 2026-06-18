"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { HeroFlourish, Play } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";

interface CourseOverviewProps {
  overview: string;
  level: string;
  duration: string;
  certification?: string;
  fee?: string;
  videos?: YouTubeVideo[];
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
}: CourseOverviewProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

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
      className="py-16 sm:py-14 bg-paper relative overflow-hidden"
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
              eyebrow="The Inner Path"
              title={
                <>
                  Transform your practice &amp;{" "}
                  <span className="text-primary">awaken</span> your true
                  purpose.
                </>
              }
              align="left"
              className="mb-0!"
            />
          </motion.div>

          {/* 2-Column Split: Editorial Text & Interactive Video */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left: Editorial copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="lg:col-span-6 space-y-8"
            >
              <div className="space-y-6">
                <p className="type-lead text-muted first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8]">
                  {overview}
                </p>
                <p className="type-lead text-muted leading-relaxed font-sans">
                  Our residential yoga training program is designed to
                  facilitate physical purification, emotional release, and
                  intellectual understanding. By immersing yourself completely
                  in the ashram lifecycle, you step away from modern
                  distractions to cultivate discipline, self-inquiry, and
                  authentic teachings handed down through generations.
                </p>
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
                  "Yoga is not just physical posture; it is a sacred pathway to
                  quieting the mind, understanding the self, and returning to
                  the lineage of ancient wisdom."
                </p>
                <span className="type-eyebrow text-accent text-right block mt-4 font-semibold tracking-wider relative z-10 uppercase">
                  — Himalayan Lineage Teachings
                </span>
              </div>
            </motion.div>

            {/* Right: Cinematic Video Station */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="lg:col-span-6 w-full space-y-6"
            >
              {activeVideo && (
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
                          className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#faf7f2] to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                            showLeftFade ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div
                          className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#faf7f2] to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
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
          </div>

          {/* Bottom Specs Ribbon (Anchors the layout full-width) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="col-span-12 border-y border-y-ink/10 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 bg-white/30 backdrop-blur-xs px-6 md:px-12"
          >
            {/* Spec 1 */}
            <div className="space-y-2 text-center md:text-left md:border-r md:border-ink/10 pr-4 last:border-r-0">
              <span className="type-eyebrow text-primary font-semibold uppercase tracking-wider block">
                Focus Level
              </span>
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-ink font-medium block leading-tight">
                {level}
              </span>
              <span className="text-xs text-muted block font-sans">
                All training experience welcome
              </span>
            </div>

            {/* Spec 2 */}
            <div className="space-y-2 text-center md:text-left md:border-r md:border-ink/10 pr-4 last:border-r-0 md:pl-4">
              <span className="type-eyebrow text-primary font-semibold uppercase tracking-wider block">
                Immersive Duration
              </span>
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-ink font-medium block leading-tight">
                {duration}
              </span>
              <span className="text-xs text-muted block font-sans">
                Full-time ashram residency
              </span>
            </div>

            {/* Spec 3 */}
            <div className="space-y-2 text-center md:text-left md:border-r md:border-ink/10 pr-4 last:border-r-0 md:pl-4">
              <span className="type-eyebrow text-primary font-semibold uppercase tracking-wider block">
                Certification
              </span>
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-ink font-medium block leading-tight">
                {certification}
              </span>
              <span className="text-xs text-muted block font-sans">
                Worldwide standard credentials
              </span>
            </div>

            {/* Spec 4 */}
            <div className="space-y-2 text-center md:text-left pr-4 last:border-r-0 md:pl-4">
              <span className="type-eyebrow text-primary font-semibold uppercase tracking-wider block">
                Course Fee
              </span>
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-ink font-medium block leading-tight">
                {fee}
              </span>
              <span className="text-xs text-muted block font-sans">
                All-inclusive tuition &amp; board
              </span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
