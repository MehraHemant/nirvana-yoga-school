"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Container } from "@/components/ui";
import { HeroUnderline } from "@/icons";
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
}

const ONLINE_IMAGES = [
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
];

export default function CourseHero({
  title,
  subtitle,
  image,
  heroImages,
}: CourseHeroProps) {
  const baseImages = heroImages && heroImages.length > 0 ? heroImages : [image];
  // Combine course-specific images with 15 premium online images to ensure exactly 15 slider options
  const images = Array.from(new Set([...baseImages, ...ONLINE_IMAGES])).slice(
    0,
    15,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Replicate images list to ensure a seamless infinite scroll loop of cards (at least 12 items)
  const getRepeatedImages = (list: string[]) => {
    let result = [...list];
    while (result.length < 12) {
      result = [...result, ...list];
    }
    return result;
  };
  const sliderImages = getRepeatedImages(images);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((currentImageIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images, currentImageIndex]);

  // Extracting the main style/type of training for the italicized word
  const titleParts = title.split(" ");
  const lastWord = titleParts.pop() || "";
  const remainingTitle = titleParts.join(" ");

  return (
    <section className="relative h-screen max-h-screen flex items-center pt-32 pb-36 lg:pb-40 overflow-hidden bg-ink text-white">
      {/* Background Image Carousel with Ken Burns zoom effect and crossfade */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full z-0"
          >
            <Image
              src={images[currentImageIndex]}
              alt={title}
              fill
              priority={currentImageIndex === 0}
              sizes="100vw"
              className="object-cover object-center animate-hero-zoom"
            />
          </motion.div>
        </AnimatePresence>
        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent z-10" />
        <div className="absolute inset-0 bg-radial-gradient(circle at 30% 50%, transparent 20%, rgba(26,20,16,0.8) 100%) z-10" />
      </div>

      {/* Decorative Radial Glow behind title */}
      <div className="absolute left-[-10%] top-[20%] w-[50%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      <Container size="2xl" className="relative z-20 w-full">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-white/50 font-medium tracking-wide">
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

        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* Left: Headline & Information */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="type-eyebrow tracking-wider text-[10px]">
                Yoga Alliance Certified RYS
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="type-h1 text-white mb-6"
            >
              {remainingTitle}{" "}
              <span className="relative inline-block text-accent font-serif italic font-normal">
                {lastWord}
                <HeroUnderline className="absolute left-0 right-0 -bottom-2 w-full text-accent opacity-80 h-3" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="type-lead text-white/80 max-w-xl mb-8"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button href="#pricing" variant="primary" size="lg" responsive>
                Select Batch &amp; Book
              </Button>
              <Button
                href="#syllabus"
                variant="outline-light"
                size="lg"
                responsive
              >
                View Syllabus
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Infinite Scroll Image Card Slider at the bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-0 inset-x-0 z-30 bg-black/40 border-t border-white/10 backdrop-blur-md py-4">
          <div className="marquee-mask overflow-hidden relative">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
              {["a", "b"].map((set) => (
                <div key={set} className="flex">
                  {sliderImages.map((img, idx) => {
                    const originalIdx = idx % images.length;
                    const isActive = currentImageIndex === originalIdx;
                    return (
                      <button
                        // biome-ignore lint/suspicious/noArrayIndexKey: idx is stable
                        key={`${set}-${idx}`}
                        type="button"
                        onClick={() => setCurrentImageIndex(originalIdx)}
                        className={`group relative flex-shrink-0 w-44 h-28 mx-3 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                          isActive
                            ? "border-accent scale-105 shadow-[0_0_15px_rgba(166,181,162,0.5)] z-10"
                            : "border-white/15 opacity-60 hover:opacity-100 hover:border-white/45"
                        }`}
                        aria-label={`Show slide ${originalIdx + 1}`}
                      >
                        <Image
                          src={img}
                          alt={`Slide ${originalIdx + 1}`}
                          fill
                          sizes="176px"
                          className="object-cover"
                        />
                        <div
                          className={`absolute inset-0 transition-colors ${
                            isActive
                              ? "bg-black/0"
                              : "bg-black/40 group-hover:bg-black/20"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
