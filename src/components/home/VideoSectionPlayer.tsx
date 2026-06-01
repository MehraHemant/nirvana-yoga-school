"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Play } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildEmbedUrl(videoId: string, autoplay: boolean) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type VideoPlaylistItemProps = {
  video: YouTubeVideo;
  isActive: boolean;
  onSelect: (id: string) => void;
};

function VideoPlaylistItem({
  video,
  isActive,
  onSelect,
}: VideoPlaylistItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(video.id)}
      aria-current={isActive ? "true" : undefined}
      className={`group flex h-full w-full min-w-0 overflow-hidden rounded-2xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 max-md:flex-col md:flex-row md:items-stretch md:gap-3 md:p-2.5 ${
        isActive
          ? "border-primary/30 bg-white shadow-soft ring-1 ring-primary/20 md:border-l-[3px] md:border-l-primary md:pl-[calc(0.625rem-2px)]"
          : "border-ink/8 bg-white shadow-card hover:border-primary/20 hover:bg-white hover:shadow-soft md:border-l-[3px] md:border-l-transparent"
      }`}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-ink/10 max-md:rounded-t-2xl md:w-[38%] md:rounded-xl lg:w-[40%]">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 72vw, (max-width: 1024px) 140px, 160px"
          className={`object-cover transition-transform duration-500 ${
            isActive ? "scale-100" : "group-hover:scale-105"
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isActive ? "bg-primary/15" : "bg-ink/10 group-hover:bg-ink/5"
          }`}
          aria-hidden="true"
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-md transition-transform duration-300 group-hover:scale-110 md:h-9 md:w-9">
              <Play size={14} className="ml-0.5" />
            </span>
          </div>
        )}
        {isActive && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 md:hidden">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            <span className="type-eyebrow text-[9px] normal-case tracking-normal text-white">
              Live
            </span>
          </span>
        )}
        <span className="type-ui absolute bottom-2 right-2 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 md:py-1 md:pr-1 md:pl-0">
        <span
          className={`type-eyebrow text-[10px] sm:text-xs ${
            isActive ? "text-primary" : "text-muted"
          }`}
        >
          {isActive ? "Now playing" : video.channel}
        </span>
        <span
          className={`type-ui line-clamp-2 font-medium leading-snug md:line-clamp-3 md:text-[0.9375rem] ${
            isActive ? "text-primary" : "text-ink group-hover:text-primary"
          }`}
        >
          {video.title}
        </span>
      </div>
    </button>
  );
}

type VideoSectionPlayerProps = {
  videos: YouTubeVideo[];
};

export default function VideoSectionPlayer({
  videos,
}: VideoSectionPlayerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAutoplayedOnce = useRef(false);
  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const [playerKey, setPlayerKey] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  const selectVideo = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setAutoplay(!prefersReduced);
    setPlayerKey((key) => key + 1);
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAutoplayedOnce.current) return;

        hasAutoplayedOnce.current = true;
        setAutoplay(true);
        setPlayerKey((key) => key + 1);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReduced]);

  if (!active) return null;

  return (
    <section
      id="video"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-paper py-16 sm:py-20 lg:py-28"
    >
      <Container size="2xl" className="relative min-w-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow="Student voices"
            title={
              <>
                Stories from{" "}
                <span className="italic font-normal text-accent">
                  Rishikesh
                </span>
              </>
            }
            description="Watch real students share why they chose Nirvana Yoga School — tap a video to play."
            className="mb-6 sm:mb-8 lg:mb-10 lg:max-w-xl"
          />
        </motion.div>

        <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Player */}
          <motion.div
            className="order-1 min-w-0 lg:order-2 lg:col-span-8 lg:sticky lg:top-24"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.08}
            variants={fadeUp}
          >
            <div className="relative w-full min-w-0">
              <div
                className="pointer-events-none absolute -inset-2 rounded-[1.5rem] bg-linear-to-br from-primary/12 via-transparent to-accent/12 blur-md sm:-inset-3 sm:rounded-[1.75rem]"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    key={playerKey}
                    src={buildEmbedUrl(activeId, autoplay)}
                    title={`${active.title} — ${active.channel}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Playlist — one list, responsive layout */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-4">
            <div className="mb-3 flex items-end justify-between gap-3 lg:mb-4">
              <p className="type-eyebrow text-muted">{videos.length} videos</p>
              <p className="type-eyebrow text-muted md:hidden">Swipe →</p>
            </div>

            <div className="marquee-mask max-md:-mx-5 max-md:px-5 md:contents">
              <ul
                className="flex gap-3 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-1 md:gap-2.5 md:overflow-visible md:pb-0 lg:flex lg:max-h-[min(32rem,calc(100svh-8rem))] lg:flex-col lg:gap-2.5 lg:overflow-y-auto lg:pr-0.5"
                aria-label="Video playlist"
              >
                {videos.map((video) => {
                  const isActive = video.id === activeId;

                  return (
                    <li
                      key={video.id}
                      className="w-[min(78vw,17rem)] shrink-0 snap-start md:w-full md:shrink lg:w-full"
                    >
                      <VideoPlaylistItem
                        video={video}
                        isActive={isActive}
                        onSelect={selectVideo}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
