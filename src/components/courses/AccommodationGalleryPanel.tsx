"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cmsImageAlt,
  cmsImageCursorClass,
  handleCmsImageClick,
  type ImageClickAction,
} from "@/content/types/cms-image";
import type { SharedGalleryImage } from "@/content/types/shared-sections";
import { ChevronLeft, ChevronRight } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

type ImageGalleryPanelProps = {
  /** Images shown in the auto-advancing gallery */
  images: SharedGalleryImage[];
  /** Overlay label / pill text (e.g. room name or "Sattvic Cuisine") */
  label: string;
  /** Accent color used for the active thumbnail ring and glow */
  accent?: "primary" | "secondary";
  /** Opens the fullscreen lightbox at the given image index */
  onOpenLightbox: (index: number) => void;
};

/**
 * Auto-advancing image gallery with thumbnail strip and fullscreen trigger.
 *
 * Pauses on hover/focus, stops while off-screen, and respects reduced motion.
 *
 * @param props - Images, overlay label, accent color, and lightbox handler
 */
export function ImageGalleryPanel({
  images,
  label,
  accent = "primary",
  onOpenLightbox,
}: ImageGalleryPanelProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const isInView = useInView(panelRef, { amount: 0.2 });

  const active = images[activeIndex] ?? images[0];
  const activeAction: ImageClickAction = active.clickAction ?? "fullscreen";
  const activeAlt = cmsImageAlt(
    {
      url: active.url,
      alt: active.alt || active.title,
      clickAction: activeAction,
      redirectUrl: active.redirectUrl,
    },
    active.title || label,
  );

  const accentThumb = "border-primary ring-primary/20";

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Auto-advance the gallery — only while in view; pauses on hover/focus and
  // respects reduced motion.
  useEffect(() => {
    if (!isInView || isPaused || prefersReduced || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isInView, isPaused, prefersReduced, images.length]);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const thumb = list.children[activeIndex] as HTMLElement | undefined;
    if (!thumb) return;

    const targetScroll =
      thumb.offsetLeft - list.clientWidth / 2 + thumb.offsetWidth / 2;

    list.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [activeIndex, prefersReduced]);

  if (!active) return null;

  return (
    <section
      ref={panelRef}
      aria-label={`${label} gallery`}
      className="flex flex-col gap-3 min-w-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className={`absolute -inset-1.5 rounded-2xl bg-linear-to-br ${
            accent === "secondary"
              ? "from-secondary/10 via-transparent to-accent/10"
              : "from-primary/10 via-transparent to-accent/10"
          } blur-md pointer-events-none`}
          aria-hidden="true"
        />

        <div className="relative aspect-[5/3] md:aspect-[4/3] rounded-3xl overflow-hidden group">
          <AnimatePresence mode="popLayout">
            <motion.button
              key={active.url}
              type="button"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              onClick={() =>
                handleCmsImageClick(
                  {
                    url: active.url,
                    alt: activeAlt,
                    clickAction: activeAction,
                    redirectUrl: active.redirectUrl,
                  },
                  () => onOpenLightbox(activeIndex),
                )
              }
              disabled={activeAction === "none"}
              className={`absolute inset-0 h-full w-full ${cmsImageCursorClass(activeAction)} disabled:cursor-default`}
              aria-label={
                activeAction === "none"
                  ? activeAlt
                  : activeAction === "redirect"
                    ? `Open link for ${activeAlt}`
                    : `View ${activeAlt} fullscreen`
              }
            >
              <Image
                src={active.url}
                alt={activeAlt}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
            </motion.button>
          </AnimatePresence>

          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-white">
              {label}
            </span>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {activeAction !== "none" ? (
          <button
            type="button"
            onClick={() =>
              handleCmsImageClick(
                {
                  url: active.url,
                  alt: activeAlt,
                  clickAction: activeAction,
                  redirectUrl: active.redirectUrl,
                },
                () => onOpenLightbox(activeIndex),
              )
            }
            className="absolute -bottom-2.5 right-3 sm:right-4 px-3 py-1.5 rounded-full bg-white border border-ink/8 text-[10px] font-semibold text-ink shadow-soft hover:shadow-md hover:border-primary/20 transition-all cursor-pointer font-sans"
          >
            {activeAction === "redirect" ? "Open link" : "Open full gallery"}
          </button>
        ) : null}
      </div>

      {images.length > 1 && (
        <div className="surface-panel overflow-hidden rounded-xl p-2 shadow-xs">
          <ul
            ref={scrollRef}
            className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain snap-x snap-mandatory p-1 max-w-full"
            aria-label={`${label} thumbnails`}
          >
            {images.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={item.url} className="shrink-0 snap-center">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${accentThumb} shadow-sm scale-[1.02]`
                        : "border-transparent hover:opacity-100 hover:scale-[1.02]"
                    }`}
                    aria-label={item.title}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt || item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
