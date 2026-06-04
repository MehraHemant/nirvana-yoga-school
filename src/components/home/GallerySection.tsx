"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { ChevronLeft, ChevronRight, Close } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  category: "practice" | "campus" | "life";
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/1.webp",
    alt: "Excursion in 200-Hour YTTC",
    title: "Weekend Excursions",
    category: "life",
  },
  {
    id: 2,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/2.webp",
    alt: "Opening ceremony of yoga teacher training course",
    title: "Opening Fire Ceremony (Havan)",
    category: "life",
  },
  {
    id: 3,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/3.webp",
    alt: "Beach yoga in Rishikesh",
    title: "Ganga Beach Yoga Sessions",
    category: "practice",
  },
  {
    id: 4,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/4.webp",
    alt: "Food at Nirvana yoga school, Rishikesh",
    title: "Nourishing Sattvic Food",
    category: "campus",
  },
  {
    id: 5,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/5.webp",
    alt: "Hatha yoga class of 200-hour yoga teacher training",
    title: "Traditional Hatha Yoga Class",
    category: "practice",
  },
  {
    id: 6,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/6.webp",
    alt: "Pranayama (breathwork) practice class",
    title: "Pranayama & Breathwork",
    category: "practice",
  },
  {
    id: 7,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/7.webp",
    alt: "Trataka meditation",
    title: "Trataka (Candle Gazing)",
    category: "practice",
  },
  {
    id: 8,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/8.webp",
    alt: "Private balcony room accommodation at Nirvana yoga school",
    title: "Private Balcony Room",
    category: "campus",
  },
  {
    id: 9,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/9.webp",
    alt: "Shatkarma practice in 200 hour Yoga TTC",
    title: "Shatkarma (Yogic Cleansing)",
    category: "practice",
  },
  {
    id: 10,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/10.webp",
    alt: "Student celebration at Nirvana yoga school",
    title: "Kirtan & Celebration",
    category: "life",
  },
  {
    id: 11,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/11.webp",
    alt: "Sound healing session",
    title: "Sacred Sound Healing",
    category: "practice",
  },
  {
    id: 12,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/12.webp",
    alt: "Dinner at Nirvana yoga school",
    title: "Sattvic Vegetarian Buffet",
    category: "campus",
  },
  {
    id: 13,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/13.webp",
    alt: "Sunrise excursion during yoga course in Rishikesh",
    title: "Himalayan Sunrise Excursion",
    category: "life",
  },
  {
    id: 14,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/14.webp",
    alt: "Outdoor yoga class",
    title: "Outdoor Yoga Sessions",
    category: "practice",
  },
  {
    id: 15,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/15.webp",
    alt: "4-sharing dorm accommodation",
    title: "Spacious Dorm Accommodation",
    category: "campus",
  },
  {
    id: 16,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/16.webp",
    alt: "Yoga philosophy class",
    title: "Yoga Philosophy & Satsang",
    category: "practice",
  },
  {
    id: 17,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/17.webp",
    alt: "Certification ceremony of yoga teacher training course",
    title: "Graduation Ceremony",
    category: "life",
  },
  {
    id: 18,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/18.webp",
    alt: "Outdoor yoga philosophy class",
    title: "Outdoor Philosophy Discussion",
    category: "practice",
  },
  {
    id: 19,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/19.webp",
    alt: "Candle light dinner at Nirvana yoga school",
    title: "Special Candlelight Dinner",
    category: "campus",
  },
  {
    id: 20,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/20.webp",
    alt: "Ganga beach yoga",
    title: "Yoga by the River Ganges",
    category: "practice",
  },
  {
    id: 21,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/21.webp",
    alt: "Dining hall of Nirvana yoga school, Rishikesh",
    title: "Community Dining Hall",
    category: "campus",
  },
  {
    id: 22,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/22.webp",
    alt: "Certification ceremony of 300-hour yoga teacher training",
    title: "Graduation Celebration",
    category: "life",
  },
  {
    id: 23,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/23.webp",
    alt: "Yoga Nidra session",
    title: "Yoga Nidra & Relaxation",
    category: "practice",
  },
  {
    id: 24,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/24.webp",
    alt: "Ashtanga Vinyasa yoga practice session",
    title: "Ashtanga Vinyasa Flow",
    category: "practice",
  },
  {
    id: 25,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/25.webp",
    alt: "2-sharing balcony room accommodation",
    title: "Shared Room with Balcony",
    category: "campus",
  },
  {
    id: 26,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/26.webp",
    alt: "Students of Nirvana yoga school, India",
    title: "Global Yogic Community",
    category: "life",
  },
  {
    id: 27,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/27.webp",
    alt: "Students of Nirvana yoga school, Rishikesh",
    title: "Lifetime Connections",
    category: "life",
  },
  {
    id: 28,
    src: "https://www.nirvanayogaschoolindia.com/img/gallery/home_slider/28.webp",
    alt: "Yoga anatomy class",
    title: "Functional Yoga Anatomy",
    category: "practice",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Images" },
  { id: "practice", label: "Yoga & Practice" },
  { id: "campus", label: "Campus & Food" },
  { id: "life", label: "Excursions & Life" },
] as const;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "practice" | "campus" | "life"
  >("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxDirection, setLightboxDirection] = useState<number>(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const prefersReduced = useReducedMotion() ?? false;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter items based on selected category
  const filteredItems = GALLERY_ITEMS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory,
  );

  // Helper to recalculate carousel bounds based on current layout state
  const updateConstraints = useCallback(() => {
    if (viewportRef.current && trackRef.current) {
      const viewportWidth = viewportRef.current.clientWidth;
      const trackWidth = trackRef.current.scrollWidth;
      const maxScrollVal = Math.max(0, trackWidth - viewportWidth);
      setMaxScroll(maxScrollVal);

      // Reset x value if out of bounds after resize
      const currentX = x.get();
      if (currentX < -maxScrollVal) {
        x.set(-maxScrollVal);
      }

      // Update boundaries
      const tolerance = 5;
      setCanScrollLeft(x.get() < -tolerance);
      setCanScrollRight(x.get() > -maxScrollVal + tolerance);

      // Update progress
      if (maxScrollVal > 0) {
        setScrollProgress(
          Math.min(1, Math.max(0, Math.abs(x.get()) / maxScrollVal)),
        );
      } else {
        setScrollProgress(0);
      }
    }
  }, [x]);

  // Ref callback to measure the track width immediately on category mount
  const trackRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      if (node && viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const trackWidth = node.scrollWidth;
        const maxScrollVal = Math.max(0, trackWidth - viewportWidth);
        setMaxScroll(maxScrollVal);

        const tolerance = 5;
        setCanScrollLeft(x.get() < -tolerance);
        setCanScrollRight(x.get() > -maxScrollVal + tolerance);

        if (maxScrollVal > 0) {
          setScrollProgress(
            Math.min(1, Math.max(0, Math.abs(x.get()) / maxScrollVal)),
          );
        } else {
          setScrollProgress(0);
        }
      }
    },
    [x],
  );

  // Track position changes for progress bar and navigation buttons
  useEffect(() => {
    updateConstraints();

    const unsubscribe = x.on("change", (latestX) => {
      if (maxScroll > 0) {
        setScrollProgress(
          Math.min(1, Math.max(0, Math.abs(latestX) / maxScroll)),
        );
      } else {
        setScrollProgress(0);
      }
      const tolerance = 5;
      setCanScrollLeft(latestX < -tolerance);
      setCanScrollRight(latestX > -maxScroll + tolerance);
    });

    window.addEventListener("resize", updateConstraints);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateConstraints);
    };
  }, [maxScroll, x, updateConstraints]);

  // Handle category changes
  useEffect(() => {
    // Reset track position to 0 with a spring animation when changing category
    if (prefersReduced) {
      x.set(0);
    } else {
      animate(x, 0, { type: "spring", stiffness: 220, damping: 25 });
    }

    // Explicitly reference selectedCategory to satisfy dependency rules
    const _cat = selectedCategory;
    const timer = setTimeout(updateConstraints, 50);
    return () => clearTimeout(timer);
  }, [selectedCategory, prefersReduced, x, updateConstraints]);

  // Navigate carousel by buttons
  const handleScroll = (direction: "left" | "right") => {
    if (maxScroll <= 0) return;

    const viewportWidth = viewportRef.current?.clientWidth ?? 350;
    const scrollStep = viewportWidth * 0.75; // Scroll 75% of viewport width per click
    const currentX = x.get();

    let targetX =
      direction === "left" ? currentX + scrollStep : currentX - scrollStep;
    targetX = Math.min(0, Math.max(-maxScroll, targetX));

    if (prefersReduced) {
      x.set(targetX);
    } else {
      animate(x, targetX, { type: "spring", stiffness: 120, damping: 22 });
    }
  };

  const handleLightboxPrev = useCallback(() => {
    setLightboxDirection(-1);
    setLightboxIndex((prev) =>
      prev === null || prev === 0 ? filteredItems.length - 1 : prev - 1,
    );
  }, [filteredItems.length]);

  const handleLightboxNext = useCallback(() => {
    setLightboxDirection(1);
    setLightboxIndex((prev) =>
      prev === null || prev === filteredItems.length - 1 ? 0 : prev + 1,
    );
  }, [filteredItems.length]);

  // Lightbox keyboard and body scroll handling
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handleLightboxPrev();
      if (e.key === "ArrowRight") handleLightboxNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, handleLightboxPrev, handleLightboxNext]);

  return (
    <section
      id="gallery"
      className="relative w-full overflow-hidden bg-sand py-20 md:py-28"
    >
      <Container size="2xl" className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
            <SectionHeader
              eyebrow="Campus & Culture"
              title={
                <>
                  Life at{" "}
                  <span className="italic font-normal text-accent">
                    Nirvana
                  </span>
                </>
              }
              description="A glimpse into the daily rhythm, organic meals, clean accommodations, sacred ceremonies, and outdoor excursions that make up your yoga teacher training journey."
              align="left"
              className="max-w-2xl !mb-0"
            />

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 self-start md:self-end">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/8 bg-white text-ink shadow-sm transition-all duration-300 ${
                  canScrollLeft
                    ? "hover:border-primary hover:bg-primary hover:text-white hover:shadow-soft"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/8 bg-white text-ink shadow-sm transition-all duration-300 ${
                  canScrollRight
                    ? "hover:border-primary hover:bg-primary hover:text-white hover:shadow-soft"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories Tab Bar */}
        <motion.div
          className="mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          custom={0.06}
          variants={fadeUp}
        >
          <div className="flex flex-wrap gap-2 border-b border-ink/8 pb-4">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`type-ui relative px-4 py-2 font-medium transition-colors duration-300 focus-visible:outline-none ${
                    isActive ? "text-primary" : "text-muted hover:text-ink"
                  }`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Carousel Container with Crossfade Category Transition */}
        <div
          ref={viewportRef}
          className="relative w-full overflow-visible select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <motion.div
                ref={trackRefCallback}
                drag="x"
                dragConstraints={{ left: -maxScroll, right: 0 }}
                dragElastic={0.15}
                dragTransition={{ power: 0.25, timeConstant: 250 }}
                style={{ x }}
                className="flex gap-6 w-max touch-pan-y"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    onClick={() => {
                      setLightboxDirection(0);
                      setLightboxIndex(index);
                    }}
                    className="group relative h-[210px] w-[280px] sm:h-[270px] sm:w-[360px] shrink-0 overflow-hidden rounded-3xl bg-ink/5 shadow-card transition-shadow duration-300 hover:shadow-soft"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 280px, 360px"
                      draggable={false}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Overlay details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
                      <span className="type-eyebrow text-[10px] text-accent tracking-widest mb-1.5">
                        {item.category === "practice"
                          ? "Yoga Practice"
                          : item.category === "campus"
                            ? "Campus Life"
                            : "Excursion"}
                      </span>
                      <h3 className="font-serif text-lg text-white font-medium leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar tracker */}
        {maxScroll > 0 && (
          <motion.div
            className="mt-8 flex justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.18}
            variants={fadeUp}
          >
            <div className="relative h-1 w-48 rounded-full bg-ink/8 overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-primary rounded-full origin-left"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </Container>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setLightboxIndex(null);
              }
            }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/80 backdrop-blur-xl p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery lightbox"
          >
            {/* Top Bar Header */}
            <div className="w-full max-w-6xl flex items-center justify-between gap-4 pb-4 border-b border-white/10 z-50">
              <div>
                <p className="type-eyebrow text-accent tracking-widest text-[10px] sm:text-xs">
                  {filteredItems[lightboxIndex].category === "practice"
                    ? "Yoga Practice"
                    : filteredItems[lightboxIndex].category === "campus"
                      ? "Campus Life"
                      : "Excursion & Culture"}
                </p>
                <h2 className="font-serif text-base sm:text-xl text-white font-medium mt-1">
                  {filteredItems[lightboxIndex].title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="type-ui text-white/50 text-[10px] sm:text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close gallery"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer border border-white/5"
                >
                  <Close size={18} />
                </button>
              </div>
            </div>

            {/* Middle Image Area */}
            <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center py-4 my-2">
              {/* Prev Navigation Button */}
              <button
                type="button"
                onClick={handleLightboxPrev}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Image Frame with explicit, non-collapsible size */}
              <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[70vh] overflow-hidden flex items-center justify-center select-none">
                <AnimatePresence initial={false} custom={lightboxDirection}>
                  <motion.div
                    key={lightboxIndex}
                    custom={lightboxDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 260, damping: 28 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 h-full w-full flex items-center justify-center"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={filteredItems[lightboxIndex].src}
                        alt={filteredItems[lightboxIndex].alt}
                        fill
                        priority
                        className="object-contain select-none"
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        draggable={false}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Navigation Button */}
              <button
                type="button"
                onClick={handleLightboxNext}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Caption Description Area */}
            <div className="w-full max-w-2xl text-center pb-2 z-50">
              <p className="type-body text-white/70 text-xs sm:text-sm italic leading-relaxed">
                {filteredItems[lightboxIndex].alt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
