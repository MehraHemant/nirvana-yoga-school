"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";

type HeroBackgroundVideoProps = {
  /** CMS hero video sources; falls back to defaults */
  video?: HomeHeroVideoContent;
};

/**
 * Full-bleed responsive hero background video with poster fallback.
 *
 * @param props - Optional CMS video source paths
 */
export default function HeroBackgroundVideo({
  video = DEFAULT_HOME_PAGE_CONTENT.hero.video,
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const markReady = () => setPlaying(true);

    el.addEventListener("canplay", markReady);
    el.addEventListener("playing", markReady);

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      markReady();
    }
    // Explicitly retry playback after hydration for browsers that defer autoplay.
    void el.play().catch(() => {
      // Keep the poster visible when autoplay is unavailable.
    });

    return () => {
      el.removeEventListener("canplay", markReady);
      el.removeEventListener("playing", markReady);
    };
  }, []);

  return (
    <>
      {/* Responsive poster — visible until video is playing */}
      <picture className="absolute inset-0">
        <source media="(max-width: 768px)" srcSet={video.mobilePoster} />
        <img
          src={video.desktopPoster}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* Single video — browser picks one source via media query */}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover animate-hero-zoom transition-opacity duration-500 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={video.desktopPoster}
        tabIndex={-1}
      >
        <source
          src={video.mobileSrc}
          type="video/mp4"
          media="(max-width: 768px)"
        />
        <source src={video.desktopSrc} type="video/mp4" />
      </video>
    </>
  );
}
