"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";
import { cloudinaryVideoPlaybackUrl } from "@/lib/cdn/cloudinary-video-url";
import {
  HERO_POSTER_MOBILE_MEDIA,
  HERO_POSTER_SIZES,
  responsiveImageAttrs,
} from "@/lib/cdn/responsive-image";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";

type HeroBackgroundVideoProps = {
  /** CMS hero video sources; falls back to defaults */
  video?: HomeHeroVideoContent;
};

/**
 * Full-bleed hero background. The CMS poster stays visible until the muted
 * video is actually playing, then the video fades in over it. The video file
 * is not requested until that poster has decoded, so it cannot delay the photo.
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
  const hasPoster = Boolean(desktopPoster);
  const posterKey = `${mobilePoster}|${desktopPoster}`;
  const [seenPoster, setSeenPoster] = useState(posterKey);
  const [fetchVideo, setFetchVideo] = useState(!hasPoster);
  if (seenPoster !== posterKey) {
    setSeenPoster(posterKey);
    setPlaying(false);
    setFetchVideo(!hasPoster);
  }

  const mobileAttrs = mobilePoster
    ? responsiveImageAttrs(mobilePoster, HERO_POSTER_SIZES)
    : null;
  const desktopAttrs = desktopPoster
    ? responsiveImageAttrs(desktopPoster, HERO_POSTER_SIZES)
    : null;

  // Start playback only after the poster has had the network to itself.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mobileSrc/desktopSrc intentionally re-run the effect
  useEffect(() => {
    if (!fetchVideo) return;
    const el = videoRef.current;
    if (!el) return;

    setPlaying(false);

    const markReady = () => setPlaying(true);
    el.addEventListener("playing", markReady);
    if (!el.paused && !el.ended && el.currentTime > 0) {
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
      el.removeEventListener("playing", markReady);
    };
  }, [fetchVideo, mobileSrc, desktopSrc]);

  return (
    <>
      {desktopPoster ? (
        <picture
          className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${playing ? "opacity-0" : "opacity-100"}`}
        >
          {mobileAttrs ? (
            <source
              media={HERO_POSTER_MOBILE_MEDIA}
              srcSet={mobileAttrs.srcSet || mobileAttrs.src}
              sizes={mobileAttrs.sizes}
            />
          ) : null}
          <img
            src={desktopAttrs?.src || desktopPoster}
            srcSet={desktopAttrs?.srcSet}
            sizes={desktopAttrs?.sizes || HERO_POSTER_SIZES}
            alt=""
            fetchPriority="high"
            decoding="sync"
            loading="eager"
            onLoad={() => setFetchVideo(true)}
            ref={(node) => {
              if (node?.complete && node.naturalWidth > 0) {
                setFetchVideo(true);
              }
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : null}

      {fetchVideo && hasMp4 ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover animate-hero-zoom transition-opacity duration-500 motion-reduce:transition-none ${playing ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        >
          {mobileSrc ? (
            <source
              src={cloudinaryVideoPlaybackUrl(mobileSrc)}
              type="video/mp4"
              media="(max-width: 768px)"
            />
          ) : null}
          {desktopSrc ? (
            <source
              src={cloudinaryVideoPlaybackUrl(desktopSrc)}
              type="video/mp4"
            />
          ) : null}
        </video>
      ) : null}
    </>
  );
}
