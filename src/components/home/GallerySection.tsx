"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
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

const SLOT_ASPECTS = [
  "aspect-[2/3]", // Very Tall portrait
  "aspect-[16/10]", // Wide landscape
  "aspect-square", // Square
  "aspect-[3/4]", // Tall portrait
  "aspect-[4/5]", // Medium portrait
  "aspect-[16/9]", // Very Wide landscape
  "aspect-[2/3]", // Very Tall portrait
  "aspect-square", // Square
  "aspect-[4/3]", // Landscape
  "aspect-[3/4]", // Tall portrait
  "aspect-[2/3]", // Very Tall portrait
  "aspect-[16/10]", // Wide landscape
] as const;

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "practice" | "campus" | "life"
  >("all");
  const prefersReduced = useReducedMotion() ?? false;

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory,
    );
  }, [selectedCategory]);

  const [visibleItems, setVisibleItems] = useState<GalleryItem[]>([]);

  // Initialize visible items whenever category changes
  useEffect(() => {
    let slotsCount = 12;
    if (selectedCategory === "practice") {
      slotsCount = 11;
    } else if (selectedCategory === "life") {
      slotsCount = 8;
    } else if (selectedCategory === "campus") {
      slotsCount = 6;
    }
    slotsCount = Math.min(slotsCount, filteredItems.length);
    setVisibleItems(filteredItems.slice(0, slotsCount));
  }, [selectedCategory, filteredItems]);

  // Shuffling auto-transition timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: visibleItems is evaluated dynamically in the functional state updater to avoid resetting the interval
  useEffect(() => {
    if (prefersReduced) return;

    const pool = filteredItems.filter(
      (item) => !visibleItems.some((vis) => vis.id === item.id),
    );

    if (pool.length === 0 || visibleItems.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random slot to replace
      const slotIndex = Math.floor(Math.random() * visibleItems.length);

      setVisibleItems((currentVisible) => {
        const currentPool = filteredItems.filter(
          (item) => !currentVisible.some((vis) => vis.id === item.id),
        );
        if (currentPool.length === 0) return currentVisible;

        const randomPoolItem =
          currentPool[Math.floor(Math.random() * currentPool.length)];
        const nextVisible = [...currentVisible];
        nextVisible[slotIndex] = randomPoolItem;
        return nextVisible;
      });
    }, 3500); // Transition every 3.5 seconds

    return () => clearInterval(interval);
  }, [filteredItems, visibleItems.length, prefersReduced]);

  return (
    <section
      id="gallery"
      className="relative w-full overflow-hidden bg-sand py-12 sm:py-14 lg:py-16"
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
              className="max-w-2xl mb-0!"
            />
          </div>
        </motion.div>

        {/* Categories Tab Bar */}
        <motion.div
          className="mb-10"
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
                  className={`type-ui relative px-4 py-2 font-medium transition-colors duration-300 focus-visible:outline-none ${isActive ? "text-primary" : "text-muted hover:text-ink"
                    }`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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

        {/* Masonry Columns Container */}
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="columns-2 sm:columns-3 lg:columns-4 gap-5"
            >
              {visibleItems.map((item, index) => {
                const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];

                return (
                  <div
                    key={item.id}
                    className="w-full text-left break-inside-avoid mb-6 group block rounded-3xl"
                  >
                    {/* Image Card Frame */}
                    <div
                      className={`relative w-full ${aspect} overflow-hidden rounded-3xl bg-ink/5 border border-ink/5 group-hover:border-primary/15 shadow-card hover:shadow-soft transition-all duration-300`}
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={item.id} // item key drives the smooth crossfade transition on slot updates
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            draggable={false}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Pinterest Style Caption below Card */}
                    <div className="mt-3 px-2">
                      <span className="type-eyebrow text-[9px] text-primary tracking-widest block font-bold">
                        {item.category === "practice"
                          ? "Yoga Practice"
                          : item.category === "campus"
                            ? "Campus Life"
                            : "Excursion"}
                      </span>
                      <h4 className="font-serif text-sm sm:text-base font-semibold text-ink leading-tight mt-1 transition-colors duration-300">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
