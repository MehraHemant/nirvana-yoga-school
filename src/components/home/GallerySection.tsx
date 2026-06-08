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
    src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop&q=80",
    alt: "Excursion in 200-Hour YTTC",
    title: "Weekend Excursions",
    category: "life",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80",
    alt: "Opening ceremony of yoga teacher training course",
    title: "Opening Fire Ceremony (Havan)",
    category: "life",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
    alt: "Beach yoga in Rishikesh",
    title: "Ganga Beach Yoga Sessions",
    category: "practice",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
    alt: "Food at Nirvana yoga school, Rishikesh",
    title: "Nourishing Sattvic Food",
    category: "campus",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    alt: "Hatha yoga class of 200-hour yoga teacher training",
    title: "Traditional Hatha Yoga Class",
    category: "practice",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80",
    alt: "Pranayama (breathwork) practice class",
    title: "Pranayama & Breathwork",
    category: "practice",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80",
    alt: "Trataka meditation",
    title: "Trataka (Candle Gazing)",
    category: "practice",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
    alt: "Private balcony room accommodation at Nirvana yoga school",
    title: "Private Balcony Room",
    category: "campus",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80",
    alt: "Shatkarma practice in 200 hour Yoga TTC",
    title: "Shatkarma (Yogic Cleansing)",
    category: "practice",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    alt: "Student celebration at Nirvana yoga school",
    title: "Kirtan & Celebration",
    category: "life",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&auto=format&fit=crop&q=80",
    alt: "Sound healing session",
    title: "Sacred Sound Healing",
    category: "practice",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=80",
    alt: "Dinner at Nirvana yoga school",
    title: "Sattvic Vegetarian Buffet",
    category: "campus",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    alt: "Sunrise excursion during yoga course in Rishikesh",
    title: "Himalayan Sunrise Excursion",
    category: "life",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80",
    alt: "Outdoor yoga class",
    title: "Outdoor Yoga Sessions",
    category: "practice",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    alt: "4-sharing dorm accommodation",
    title: "Spacious Dorm Accommodation",
    category: "campus",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
    alt: "Yoga philosophy class",
    title: "Yoga Philosophy & Satsang",
    category: "practice",
  },
  {
    id: 17,
    src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80",
    alt: "Certification ceremony of yoga teacher training course",
    title: "Graduation Ceremony",
    category: "life",
  },
  {
    id: 18,
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80",
    alt: "Outdoor yoga philosophy class",
    title: "Outdoor Philosophy Discussion",
    category: "practice",
  },
  {
    id: 19,
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    alt: "Candle light dinner at Nirvana yoga school",
    title: "Special Candlelight Dinner",
    category: "campus",
  },
  {
    id: 20,
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80",
    alt: "Ganga beach yoga",
    title: "Yoga by the River Ganges",
    category: "practice",
  },
  {
    id: 21,
    src: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop&q=80",
    alt: "Dining hall of Nirvana yoga school, Rishikesh",
    title: "Community Dining Hall",
    category: "campus",
  },
  {
    id: 22,
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    alt: "Certification ceremony of 300-hour yoga teacher training",
    title: "Graduation Celebration",
    category: "life",
  },
  {
    id: 23,
    src: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=800&auto=format&fit=crop&q=80",
    alt: "Yoga Nidra session",
    title: "Yoga Nidra & Relaxation",
    category: "practice",
  },
  {
    id: 24,
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
    alt: "Ashtanga Vinyasa yoga practice session",
    title: "Ashtanga Vinyasa Flow",
    category: "practice",
  },
  {
    id: 25,
    src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
    alt: "2-sharing balcony room accommodation",
    title: "Shared Room with Balcony",
    category: "campus",
  },
  {
    id: 26,
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
    alt: "Students of Nirvana yoga school, India",
    title: "Global Yogic Community",
    category: "life",
  },
  {
    id: 27,
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    alt: "Students of Nirvana yoga school, Rishikesh",
    title: "Lifetime Connections",
    category: "life",
  },
  {
    id: 28,
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
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
    }, 2500); // Transition every 2.5 seconds

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
                  className={`type-ui relative px-4 py-2 font-medium transition-colors duration-300 focus-visible:outline-none ${
                    isActive ? "text-primary" : "text-muted hover:text-ink"
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
