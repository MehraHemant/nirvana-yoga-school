"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Container } from "@/components/ui";
import { ChevronLeft, ChevronRight, Close, HeroUnderline, Play } from "@/icons";
import { fadeUp } from "@/lib/motion";

interface CourseHeroProps {
  title: string;
  subtitle: string;
  duration: string;
  level: string;
  certification: string;
  fee: string;
  image: string;
  certBadge: string;
  heroImages?: string[];
  images?: string[];
  videos?: string[];
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

function MaximizeIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

const getYouTubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export default function CourseHero({
  title,
  subtitle,
  duration,
  level,
  certification,
  fee,
  image,
  certBadge,
  heroImages,
  videos,
}: CourseHeroProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  // Combine all images and videos into a single mediaItems list
  const mediaItems = useMemo(() => {
    const list: MediaItem[] = [];

    // Prioritize passed images array, fall back to heroImages, then single image prop
    const baseImages = heroImages || [];

    for (const img of baseImages) {
      if (img) {
        list.push({ type: "image", url: img });
      }
    }

    if (videos && videos.length > 0) {
      for (const vid of videos) {
        if (vid) {
          list.push({ type: "video", url: vid });
        }
      }
    }

    return list;
  }, [heroImages, videos]);

  const [activeFilter, setActiveFilter] = useState<"all" | "photos" | "videos">(
    "all",
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const activeThumb = document.getElementById(`thumb-${activeIndex}`);
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      if (activeFilter === "photos") return item.type === "image";
      if (activeFilter === "videos") return item.type === "video";
      return true;
    });
  }, [mediaItems, activeFilter]);

  // Safeguard activeIndex when filter changes
  const activeItem = filteredItems[activeIndex] ||
    filteredItems[0] || { type: "image", url: image };

  // Fallback background image when active media is a video
  const bgImageSrc = useMemo(() => {
    if (activeItem.type === "image") return activeItem.url;
    const firstImg = mediaItems.find((item) => item.type === "image");
    return firstImg ? firstImg.url : image;
  }, [activeItem, mediaItems, image]);

  const handleFilterChange = (filter: "all" | "photos" | "videos") => {
    setActiveFilter(filter);
    setActiveIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleNext = useCallback(() => {
    if (filteredItems.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
  }, [filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (filteredItems.length <= 1) return;
    setActiveIndex(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
    );
  }, [filteredItems.length]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  // Extract the last word of title for italic decoration
  const titleParts = title.split(" ");
  const lastWord = titleParts.pop() || "";
  const remainingTitle = titleParts.join(" ");

  return (
    <section className="relative min-h-screen lg:h-screen lg:max-h-[900px] flex items-center pt-28 pb-16 lg:py-0 overflow-hidden bg-ink text-white">
      {/* Dynamic Background Image/Video mirroring active item */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden opacity-25">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgImageSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full z-0"
          >
            <Image
              src={bgImageSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center animate-hero-zoom"
            />
          </motion.div>
        </AnimatePresence>
        {/* Dark overlay gradients to ensure readability and cinematic vibe */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent z-10" />
      </div>

      {/* Dynamic Background Radial Glow */}
      <div className="absolute left-[-10%] top-[20%] w-[50%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      <Container
        size="2xl"
        className="relative z-20 lg:pt-8 w-full h-full flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Course Metadata & Details */}
          <div className="lg:col-span-5 flex flex-col items-start w-full">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-white/50 font-medium tracking-wide">
              <Link href="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/#courses"
                className="hover:text-accent transition-colors"
              >
                Courses
              </Link>
              <span>/</span>
              <span className="text-accent truncate max-w-[200px] sm:max-w-none">
                {title}
              </span>
            </nav>

            {/* Certification Badge Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent mb-4 w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="type-eyebrow tracking-wider text-[10px]">
                Yoga Alliance Certified RYS
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="type-h1 text-white mb-4 leading-tight"
            >
              {remainingTitle}{" "}
              <span className="relative inline-block text-accent font-serif font-normal">
                {lastWord}
                <HeroUnderline className="absolute left-0 right-0 -bottom-2 w-full text-accent opacity-80 h-3" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="type-lead text-white/80 max-w-xl mb-6 text-sm md:text-base leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* Summary Metadata Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mb-6 font-sans w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 w-full">
                  <div>
                    <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                      Duration
                    </span>
                    <span className="text-sm font-semibold text-white/90">
                      {duration}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                      Level
                    </span>
                    <span className="text-sm font-semibold text-white/90">
                      {level}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                      Certification
                    </span>
                    <span className="text-sm font-semibold text-white/90">
                      {certification}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                      Course Fee
                    </span>
                    <span className="text-sm font-bold text-accent font-serif text-base">
                      {fee}
                    </span>
                  </div>
                </div>

                {certBadge && (
                  <div className="relative w-16 h-16 shrink-0 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg border border-white/20 select-none self-center sm:self-auto">
                    <Image
                      src={certBadge}
                      alt="Yoga Alliance Certification"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button
                href="#pricing"
                variant="primary"
                size="lg"
                responsive
                className="w-full sm:w-auto text-center justify-center"
              >
                Select Batch &amp; Book
              </Button>
              <Button
                href="#syllabus"
                variant="outline-light"
                size="lg"
                responsive
                className="w-full sm:w-auto text-center justify-center"
              >
                View Syllabus
              </Button>
            </motion.div>
          </div>

          {/* Right Column: Premium Active Viewer + Thumbnails Carousel */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 mb-4 bg-white/5 border border-white/10 p-1 rounded-full w-fit self-center lg:self-start">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-accent text-ink"
                    : "text-white/70 hover:text-white"
                }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("photos")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeFilter === "photos"
                    ? "bg-accent text-ink"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Photos ({mediaItems.filter((i) => i.type === "image").length})
              </button>
              {mediaItems.some((i) => i.type === "video") && (
                <button
                  type="button"
                  onClick={() => handleFilterChange("videos")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeFilter === "videos"
                      ? "bg-accent text-ink"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Videos ({mediaItems.filter((i) => i.type === "video").length})
                </button>
              )}
            </div>

            {/* Main Player Display */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-4">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeItem.url}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                  {activeItem.type === "image" ? (
                    <Image
                      src={activeItem.url}
                      alt={title}
                      fill
                      sizes="100vw"
                      className="object-cover animate-hero-zoom"
                      priority
                    />
                  ) : (
                    // Display YouTube video or fallback HTML5 video player
                    (() => {
                      const isYouTube =
                        !activeItem.url.includes("/") &&
                        activeItem.url.length <= 12;
                      return isYouTube ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${activeItem.url}?autoplay=1&mute=1&controls=1&rel=0`}
                          title="Course Video"
                          className="absolute inset-0 w-full h-full border-0 z-10"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={activeItem.url}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          controls
                          autoPlay
                          muted
                          playsInline
                        />
                      );
                    })()
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white transition-all cursor-pointer hover:scale-105"
                    aria-label="Previous Media"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white transition-all cursor-pointer hover:scale-105"
                    aria-label="Next Media"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Lightbox Trigger Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white transition-all cursor-pointer"
                aria-label="View Fullscreen"
              >
                <MaximizeIcon size={16} />
              </button>

              {/* Media Status Pill */}
              <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-white text-[10px] font-semibold tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                {activeItem.type === "video" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>VIDEO</span>
                  </>
                ) : (
                  <span>PHOTO</span>
                )}
                <span className="text-white/60">•</span>
                <span>
                  {activeIndex + 1} / {filteredItems.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Slider Header & Scrollstrip */}
            {filteredItems.length > 1 && (
              <div className="relative w-full flex flex-col bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
                {/* Scroll Control Arrows */}
                <div className="flex justify-between items-center mb-2 px-1 select-none">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                    Gallery Carousel ({filteredItems.length} items)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={scrollLeft}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                      aria-label="Scroll thumbnails left"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={scrollRight}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                      aria-label="Scroll thumbnails right"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Thumbnails Row */}
                <ul
                  ref={scrollContainerRef}
                  className="overflow-x-auto scrollbar-none py-1 flex gap-3 scroll-smooth snap-x snap-mandatory"
                >
                  {filteredItems.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: indices are stable for media list
                        key={idx}
                        id={`thumb-${idx}`}
                        className="snap-start shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={`relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer block ${
                            isActive
                              ? "border-accent shadow-[0_0_10px_rgba(166,181,162,0.6)] z-10"
                              : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                          }`}
                          aria-label={`Select media slide ${idx + 1}`}
                        >
                          {item.type === "image" ? (
                            <Image
                              src={item.url}
                              alt=""
                              fill
                              sizes="128px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full bg-ink">
                              <Image
                                src={getYouTubeThumbnail(item.url)}
                                alt=""
                                fill
                                sizes="128px"
                                className="object-cover opacity-80"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play
                                  size={16}
                                  className="text-white fill-white drop-shadow-md"
                                />
                              </div>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Lightbox / Fullscreen Modal Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 md:p-8"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Fullscreen"
            >
              <Close size={24} />
            </button>

            {/* Main Lightbox Frame */}
            <div className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center">
              {/* Left Arrow */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Previous Media"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Right Arrow */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Next Media"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Active Media Inside Lightbox */}
              <div className="w-full h-full relative">
                {activeItem.type === "image" ? (
                  <Image
                    src={activeItem.url}
                    alt={title}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  (() => {
                    const isYouTube =
                      !activeItem.url.includes("/") &&
                      activeItem.url.length <= 12;
                    return isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${activeItem.url}?autoplay=1&rel=0`}
                        title="Course Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      // biome-ignore lint/a11y/useMediaCaption: custom fullscreen preview video
                      <video
                        src={activeItem.url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        playsInline
                      />
                    );
                  })()
                )}
              </div>
            </div>

            {/* Lightbox Thumbnails selection strip */}
            {filteredItems.length > 1 && (
              <div className="mt-6 w-full max-w-4xl overflow-x-auto py-2 flex gap-3 justify-start sm:justify-center scrollbar-thin">
                {filteredItems.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: indices are stable for media files
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({
                            left: idx * 128 - 20,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`relative shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-accent scale-105"
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
                            src={getYouTubeThumbnail(item.url)}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
