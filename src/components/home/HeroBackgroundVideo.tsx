"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";

type HeroBackgroundVideoProps = {
  /** CMS hero video sources; falls back to defaults */
  video?: HomeHeroVideoContent;
};

/**
 * Full-bleed hero background using a muted, looping MP4 `<video>` (no controls).
 * Preloads metadata only, pauses when off-screen, and fades from the poster once playing.
 *
 * @param props - Optional CMS MP4 source paths and posters
 */
export default function HeroBackgroundVideo({
  video = createEmptyHomePageContent().hero.video,
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const mobileSrc = video.mobileSrc?.trim() || "";
  const desktopSrc = video.desktopSrc?.trim() || "";
  const hasMp4 = Boolean(mobileSrc || desktopSrc);
  const mobilePoster = video.mobilePoster?.trim() || "";
  const desktopPoster = video.desktopPoster?.trim() || mobilePoster;

  // Re-bind when CMS sources change so play/pause observers track the new element.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mobileSrc/desktopSrc intentionally re-run the effect
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    setPlaying(false);

    const markReady = () => setPlaying(true);

    el.addEventListener("canplay", markReady);
    el.addEventListener("playing", markReady);

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      markReady();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void el.play().catch(() => {
            // Keep the poster visible when autoplay is unavailable.
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("canplay", markReady);
      el.removeEventListener("playing", markReady);
    };
  }, [mobileSrc, desktopSrc]);

  return (
    <>
      {/* Responsive poster — visible until video is playing */}
      {desktopPoster ? (
        <picture
          className={`absolute inset-0 transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
        >
          {mobilePoster ? (
            <source media="(max-width: 768px)" srcSet={mobilePoster} />
          ) : null}
          <img
            src={desktopPoster}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : null}

      {/* MP4 — browser picks one source via media query */}
      {hasMp4 ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover animate-hero-zoom transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={desktopPoster || undefined}
          tabIndex={-1}
        >
          {mobileSrc ? (
            <source
              src={mobileSrc}
              type="video/mp4"
              media="(max-width: 768px)"
            />
          ) : null}
          {desktopSrc ? <source src={desktopSrc} type="video/mp4" /> : null}
        </video>
      ) : null}
    </>
  );
}
