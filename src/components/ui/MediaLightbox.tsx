"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Close, Play } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

interface MediaItem {
  type: "image" | "video";
  url: string;
  /** Optional poster for video thumbnails (Cloudinary / custom) */
  thumbnailUrl?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  activeIndex: number;
  onChangeActiveIndex: (index: number) => void;
  title?: string;
}

const getYouTubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export default function MediaLightbox({
  isOpen,
  onClose,
  items,
  activeIndex,
  onChangeActiveIndex,
  title = "Course Gallery",
}: MediaLightboxProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeItem = items[activeIndex];

  // Navigation handlers wrapped in useCallback to satisfy exhaustive dependencies
  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    onChangeActiveIndex((activeIndex + 1) % items.length);
  }, [items.length, activeIndex, onChangeActiveIndex]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    onChangeActiveIndex((activeIndex - 1 + items.length) % items.length);
  }, [items.length, activeIndex, onChangeActiveIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(
      `[data-index="${activeIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [isOpen, activeIndex]);

  // Lock scroll on background when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !activeItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex flex-col items-center justify-between bg-ink/98 backdrop-blur-md p-4 sm:p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          // Close only when clicking directly on the backdrop area
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between z-10 max-w-6xl">
          <div className="flex flex-col text-left">
            <span className="type-eyebrow text-accent font-semibold tracking-wider">
              {title}
            </span>
            <span className="text-white/65 text-xs mt-1 font-sans">
              Media {activeIndex + 1} of {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close Preview"
          >
            <Close size={20} />
          </button>
        </div>

        {/* Center Active Media Frame */}
        <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 md:my-6 select-none">
          {/* Left Arrow Navigation */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-0 sm:left-4 z-20 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Previous media"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right Arrow Navigation */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-0 sm:right-4 z-20 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Next media"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Active Media Container with Drag/Swipe support */}
          <motion.div
            key={activeIndex}
            initial={
              prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) {
                handleNext();
              } else if (info.offset.x > 80) {
                handlePrev();
              }
            }}
            className="w-full h-full relative flex items-center justify-center max-h-[60vh] md:max-h-[70vh] cursor-grab active:cursor-grabbing"
          >
            {activeItem.type === "image" ? (
              <Image
                src={activeItem.url}
                alt={`${title} - Item ${activeIndex + 1}`}
                fill
                sizes="(max-width: 1200px) 100vw, 1024px"
                className="object-contain pointer-events-none"
                priority
              />
            ) : (
              (() => {
                const isYouTube =
                  !activeItem.url.includes("/") && activeItem.url.length <= 12;
                return isYouTube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeItem.url}?autoplay=1&rel=0`}
                    title="Course Video"
                    className="w-full aspect-video max-w-4xl border-0 shadow-2xl rounded-2xl overflow-hidden"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // biome-ignore lint/a11y/useMediaCaption: custom fullscreen preview video
                  <video
                    src={activeItem.url}
                    className="w-full aspect-video max-w-4xl object-contain shadow-2xl rounded-2xl overflow-hidden bg-black"
                    controls
                    autoPlay
                    playsInline
                  />
                );
              })()
            )}
          </motion.div>
        </div>

        {/* Bottom Thumbnails Scrollstrip */}
        {items.length > 1 && (
          <div className="w-full max-w-3xl z-10">
            <div
              ref={scrollRef}
              className="no-scrollbar w-full overflow-x-auto py-2 flex gap-3 justify-start sm:justify-center snap-x snap-mandatory scroll-smooth"
            >
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.url}
                    data-index={idx}
                    type="button"
                    onClick={() => onChangeActiveIndex(idx)}
                    className={`relative shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer snap-center ${
                      isActive
                        ? "border-accent scale-105 shadow-md"
                        : "border-white/10 opacity-55 hover:opacity-100"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    {item.type === "image" ? (
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black/50">
                        <Image
                          src={
                            item.thumbnailUrl || getYouTubeThumbnail(item.url)
                          }
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={12} className="text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
