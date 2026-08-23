"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BlogRoomImagesCarouselProps = {
  images: string[];
  /** Accessible label for the carousel region */
  label?: string;
};

/**
 * Gentle auto-advancing room image carousel for the blog programs rail.
 * Pauses on hover/focus; disabled when prefers-reduced-motion or a single image.
 *
 * @param props - Local room image URLs
 */
export function BlogRoomImagesCarousel({
  images,
  label = "Room photos",
}: BlogRoomImagesCarouselProps) {
  const urls = images.map((url) => url.trim()).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || urls.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % urls.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, urls.length]);

  if (urls.length === 0) return null;

  return (
    <div
      className="relative mt-3.5 aspect-16/10 w-full overflow-hidden rounded-xl bg-surface-muted"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {urls.map((url, index) => (
        <Image
          key={url}
          src={url}
          alt=""
          fill
          className={`object-cover transition-opacity duration-700 ease-out ${index === activeIndex ? "opacity-100" : "opacity-0"} ${reducedMotion ? "transition-none" : ""}`}
          sizes="(max-width: 1024px) 100vw, 352px"
          priority={index === 0}
          aria-hidden={index !== activeIndex}
        />
      ))}
      <span className="sr-only">
        Photo {activeIndex + 1} of {urls.length}
      </span>
    </div>
  );
}
