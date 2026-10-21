"use client";

import { useEffect, useRef, useState } from "react";
import { prefetchResponsiveImages } from "@/lib/cdn/prefetch-image";
import type { ResponsiveImageRequest } from "@/lib/cdn/responsive-image";

type PrefetchWhenNearProps = {
  /** Images to warm, in priority order */
  images: ResponsiveImageRequest[];
  /** How far ahead of the viewport to start. Default is about one screen. */
  rootMargin?: string;
  /** Cap so a long gallery does not prefetch every photo */
  limit?: number;
};

/**
 * Fetches the first images once this marker is near the viewport.
 * URLs match `next/image`, so the painted image is already cached.
 * Place it at the start of a below-the-fold section whose parent is positioned.
 *
 * @param props - Image list, lookahead distance, and cap
 */
export default function PrefetchWhenNear({
  images,
  rootMargin = "800px 0px",
  limit = 8,
}: PrefetchWhenNearProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef(images);
  const [near, setNear] = useState(false);

  imagesRef.current = images;

  const imageKey = images
    .slice(0, limit)
    .map((image) => `${image.src}|${image.sizes}|${image.quality ?? ""}`)
    .join("\n");

  useEffect(() => {
    const node = markerRef.current;
    if (!node || near) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  useEffect(() => {
    if (!near || imageKey.length === 0) return;
    prefetchResponsiveImages(imagesRef.current, limit);
  }, [near, imageKey, limit]);

  return (
    <div
      ref={markerRef}
      className="pointer-events-none absolute top-0 left-0 h-px w-px overflow-hidden"
      aria-hidden="true"
    />
  );
}
