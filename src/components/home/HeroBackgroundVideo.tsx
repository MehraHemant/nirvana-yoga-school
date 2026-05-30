"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO = {
  mobile: {
    src: "/videos/videomobile.mp4",
    poster: "/videos/videomobile-poster.webp",
  },
  desktop: {
    src: "/videos/videodesktop.mp4",
    poster: "/videos/videodesktop-poster.webp",
  },
} as const;

export default function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setPlaying(true);

    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      markReady();
    }

    return () => {
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
    };
  }, []);

  return (
    <>
      {/* Responsive poster — visible until video is playing */}
      <picture className="absolute inset-0">
        <source media="(max-width: 768px)" srcSet={HERO_VIDEO.mobile.poster} />
        <img
          src={HERO_VIDEO.desktop.poster}
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
        poster={HERO_VIDEO.desktop.poster}
        tabIndex={-1}
      >
        <source
          src={HERO_VIDEO.mobile.src}
          type="video/mp4"
          media="(max-width: 768px)"
        />
        <source src={HERO_VIDEO.desktop.src} type="video/mp4" />
      </video>
    </>
  );
}
