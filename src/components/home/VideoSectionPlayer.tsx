"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Play } from "@/icons";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { PlaylistVideo } from "@/lib/playlist-video";
import type { YouTubeVideo } from "@/lib/youtube";
import {
  postYouTubeCommand,
  useViewportMutedAutoplay,
} from "./useViewportMutedAutoplay";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Builds a YouTube embed URL; muted autoplay + jsapi for viewport play/pause.
 *
 * @param videoId - YouTube video id
 * @param autoplay - Whether to start muted autoplay
 */
function buildEmbedUrl(videoId: string, autoplay: boolean) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (typeof window !== "undefined") {
    params.set("origin", window.location.origin);
  }
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type VideoPlaylistItemProps = {
  video: PlaylistVideo;
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
      className={`group flex h-full w-full min-w-0 overflow-hidden rounded-2xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 max-md:flex-col md:flex-row md:items-stretch md:gap-3 md:p-2.5 ${isActive ? "border-primary/30 bg-white shadow-soft ring-1 ring-primary/20 md:border-l-[3px] md:border-l-primary md:pl-[calc(0.625rem-2px)]" : "border-ink/8 bg-white shadow-card hover:border-primary/20 hover:bg-white hover:shadow-soft md:border-l-[3px] md:border-l-transparent"}`}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-ink/10 max-md:rounded-t-2xl md:w-[38%] md:rounded-xl lg:w-[40%]">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 72vw, (max-width: 1024px) 140px, 160px"
          className={`object-cover transition-transform duration-500 ${isActive ? "scale-100" : "group-hover:scale-105"}`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-300 ${isActive ? "bg-primary/15" : "bg-ink/10 group-hover:bg-ink/5"}`}
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
            <span className="type-eyebrow normal-case tracking-normal text-white">
              Live
            </span>
          </span>
        )}
        {video.durationSeconds > 0 ? (
          <span className="type-ui absolute bottom-2 right-2 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {formatDuration(video.durationSeconds)}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 md:py-1 md:pr-1 md:pl-0">
        <span
          className={`type-eyebrow ${isActive ? "text-primary" : "text-ink"}`}
        >
          {isActive
            ? "Now playing"
            : video.source === "cloudinary"
              ? "Uploaded"
              : video.channel}
        </span>
        <span
          className={`type-ui line-clamp-2 font-semibold md:line-clamp-3 ${isActive ? "text-primary" : "text-ink group-hover:text-primary"}`}
        >
          {video.title}
        </span>
      </div>
    </button>
  );
}

type VideoSectionPlayerProps = {
  /** YouTube-only (home) or mixed YouTube + Cloudinary playlist */
  videos: PlaylistVideo[] | YouTubeVideo[];
  /** Optional CMS section `_id` (falls back to `video`) */
  sectionId?: string;
  /** Optional CMS section header */
  header?: { eyebrow?: string; title: string; description?: string };
};

/**
 * Starts muted autoplay after viewport entry, play tap, or playlist selection.
 *
 * @param setStarted - Marks the main player as interactive
 * @param setAutoplay - Enables muted autoplay unless reduced motion
 * @param setPlayerKey - Remounts the media element
 * @param prefersReduced - When true, skips autoplay
 */
function startPlayback(
  setStarted: (value: boolean) => void,
  setAutoplay: (value: boolean) => void,
  setPlayerKey: (updater: (key: number) => number) => void,
  prefersReduced: boolean,
) {
  setStarted(true);
  setAutoplay(!prefersReduced);
  setPlayerKey((key) => key + 1);
}

/**
 * Video playlist player — poster-first; muted autoplay when the section enters
 * the viewport (YouTube iframe or Cloudinary `<video>`). Pauses when scrolled
 * out of view. Click / playlist selection still works.
 *
 * @param props - Playlist videos and optional header / section id
 */
export default function VideoSectionPlayer({
  videos: videosProp,
  sectionId,
  header,
}: VideoSectionPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos: PlaylistVideo[] = videosProp.map((video) =>
    "source" in video && video.source
      ? (video as PlaylistVideo)
      : { ...(video as YouTubeVideo), source: "youtube" as const },
  );

  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const [playerKey, setPlayerKey] = useState(0);
  const [started, setStarted] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  useViewportMutedAutoplay({
    rootRef: playerRef,
    prefersReduced,
    started,
    onStart: () =>
      startPlayback(setStarted, setAutoplay, setPlayerKey, prefersReduced),
    onResume: () => {
      const native = videoRef.current;
      if (native) {
        void native.play().catch(() => {
          /* autoplay blocked — controls remain */
        });
        return;
      }
      postYouTubeCommand(iframeRef.current, "playVideo");
    },
    onPause: () => {
      videoRef.current?.pause();
      postYouTubeCommand(iframeRef.current, "pauseVideo");
    },
  });

  /**
   * Selects a playlist item and mounts the player if needed.
   *
   * @param id - Playlist video id
   */
  const selectVideo = (id: string) => {
    if (id === activeId && started) return;
    setActiveId(id);
    startPlayback(setStarted, setAutoplay, setPlayerKey, prefersReduced);
  };

  if (!active) return null;

  return (
    <section
      id={resolveSectionHtmlId("video", sectionId)}
      className="section-white overflow-hidden"
    >
      <Container size="2xl" className="relative min-w-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow={header?.eyebrow ?? "Student voices"}
            title={
              header?.title ?? (
                <>
                  Stories from{" "}
                  <span className="font-semibold text-primary">Rishikesh</span>
                </>
              )
            }
            description={
              header?.description ??
              "Watch real students share why they chose Nirvana Yoga School — tap a video to play."
            }
            descriptionClassName="text-ink"
            className="mb-6 sm:mb-8 lg:mb-10 lg:max-w-5xl"
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
                className="pointer-events-none absolute -inset-2 rounded-3xl bg-linear-to-br from-primary/12 via-transparent to-accent/12 blur-md sm:-inset-3 sm:rounded-[1.75rem]"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                <div
                  ref={playerRef}
                  className="relative aspect-video w-full bg-ink"
                >
                  {started ? (
                    active.source === "cloudinary" && active.playbackUrl ? (
                      <video
                        key={playerKey}
                        ref={videoRef}
                        src={active.playbackUrl}
                        poster={
                          active.thumbnailUrl !== active.playbackUrl
                            ? active.thumbnailUrl
                            : undefined
                        }
                        controls
                        playsInline
                        autoPlay={autoplay}
                        muted={autoplay}
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <iframe
                        key={playerKey}
                        ref={iframeRef}
                        src={buildEmbedUrl(activeId, autoplay)}
                        title={`${active.title} — ${active.channel}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startPlayback(
                          setStarted,
                          setAutoplay,
                          setPlayerKey,
                          prefersReduced,
                        )
                      }
                      className="group absolute inset-0 h-full w-full text-left"
                      aria-label={`Play ${active.title}`}
                    >
                      <Image
                        src={active.thumbnailUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                      <span
                        className="absolute inset-0 bg-ink/30 transition-colors group-hover:bg-ink/40"
                        aria-hidden="true"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
                          <Play
                            size={22}
                            className="ml-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Playlist — one list, responsive layout */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-4">
            <div className="mb-3 flex items-end justify-between gap-3 lg:mb-4">
              <p className="type-eyebrow text-ink">{videos.length} videos</p>
              <p className="type-eyebrow text-ink md:hidden">Swipe →</p>
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
