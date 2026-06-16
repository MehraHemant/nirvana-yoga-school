"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { banner_1, banner_2, banner_3 } from "@/assets";
import { Button, Container, Heading, Pill } from "@/components/ui";
import { Check } from "@/icons";
import { EASE_OUT, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";

const HIGHLIGHTS = [
  "Yoga Alliance RYS-200 · 300 · 500",
  "Residential & online programs",
  "Sattvic meals & ashram living",
  "Excursions, kirtan & Ganga aarti",
] as const;

const ROTATING_STATS = [
  { value: "10+", label: "Courses" },
  { value: "20+", label: "Teachers" },
  { value: "10+", label: "Years Experienced Teachers" },
  { value: "5", label: "Star Rating" },
] as const;

const leftColumnContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const galleryItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.15 },
  },
  hover: {
    scale: 1.015,
    y: -8,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

const rightColumnContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const rightColumnItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export default function WelcomeSection() {
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % ROTATING_STATS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(prefersReduced, {
        duration: 0.6,
        ease: EASE_OUT,
      })}
      className="bg-paper py-12 sm:py-14 lg:py-16 relative overflow-hidden"
    >
      <Container size="2xl" className="w-full lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* Left Column - 2x2 Grid with Rotating Experience Stats & Local Images */}
          <motion.div
            variants={leftColumnContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="order-2 lg:order-1 w-full relative"
          >
            <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl mx-auto lg:mx-0 pr-6 pb-6 sm:pr-8 sm:pb-8 md:pr-10 md:pb-10">
              {/* Cell 1: Rotating Stats Card (Absolute positioned overlap) */}
              <div className="relative w-full aspect-square">
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="absolute left-6 top-6 right-[-24px] bottom-[-24px] sm:left-8 sm:top-8 sm:right-[-32px] sm:bottom-[-32px] md:left-10 md:top-10 md:right-[-40px] md:bottom-[-40px] z-10 select-none bg-primary text-white rounded-3xl shadow-card border border-primary/10 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 text-center"
                >
                  {/* Subtle decorative glow overlays */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-md pointer-events-none" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4 text-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStatIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={reducedTransition(prefersReduced, {
                          duration: 0.35,
                          ease: EASE_OUT,
                        })}
                        className="flex flex-col items-center"
                      >
                        <span className="type-h1 font-bold leading-none text-white mb-2">
                          {ROTATING_STATS[activeStatIndex].value}
                        </span>
                        <span className="type-eyebrow text-white/95 max-w-[85%] leading-tight">
                          {ROTATING_STATS[activeStatIndex].label}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Cell 2: Image 1 (banner_3) - Clean, rounded image */}
              <motion.div
                variants={galleryItemVariants}
                whileHover={prefersReduced ? undefined : "hover"}
                className="w-full aspect-square"
              >
                <motion.div
                  animate={prefersReduced ? {} : { y: [0, -5] }}
                  transition={
                    prefersReduced
                      ? {}
                      : {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 3,
                        ease: "easeInOut",
                        delay: 0.2,
                      }
                  }
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                >
                  <Image
                    src={banner_3}
                    alt="Yoga practice at Nirvana Yoga School"
                    fill
                    sizes="(max-width: 1024px) 50vw, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </motion.div>
              </motion.div>

              {/* Cell 3: Image 2 (banner_2) - Clean, rounded image */}
              <motion.div
                variants={galleryItemVariants}
                whileHover={prefersReduced ? undefined : "hover"}
                className="w-full aspect-square"
              >
                <motion.div
                  animate={prefersReduced ? {} : { y: [0, -6] }}
                  transition={
                    prefersReduced
                      ? {}
                      : {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2.8,
                        ease: "easeInOut",
                        delay: 0.4,
                      }
                  }
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                >
                  <Image
                    src={banner_2}
                    alt="Sunrise yoga by the Ganges"
                    fill
                    sizes="(max-width: 1024px) 50vw, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              </motion.div>

              {/* Cell 4: Image 3 (banner_1) - Clean, rounded image */}
              <motion.div
                variants={galleryItemVariants}
                whileHover={prefersReduced ? undefined : "hover"}
                className="w-full aspect-square"
              >
                <motion.div
                  animate={prefersReduced ? {} : { y: [0, -5] }}
                  transition={
                    prefersReduced
                      ? {}
                      : {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 3.2,
                        ease: "easeInOut",
                        delay: 0.6,
                      }
                  }
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                >
                  <Image
                    src={banner_1}
                    alt="Meditation session at Nirvana Yoga School"
                    fill
                    sizes="(max-width: 1024px) 50vw, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Clean Copy & Structured Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={rightColumnContainer}
            className="order-1 lg:order-2 flex flex-col gap-6 "
          >
            <motion.div variants={rightColumnItem}>
              <Pill>Yoga Alliance Certified · India</Pill>
            </motion.div>

            <motion.div
              variants={rightColumnItem}
              className="space-y-3 sm:space-y-4"
            >
              <Heading
                as="h2"
                align="left"
                font="serif"
                size="h2"
                className="text-balance"
              >
                Welcome to Nirvana — a{" "}
                <span className="text-primary font-medium">
                  sanctuary for the soul
                </span>{" "}
                in Rishikesh
              </Heading>
              <div
                className="w-12 h-px bg-linear-to-r from-primary/80 via-accent/70 to-transparent"
                aria-hidden="true"
              />
            </motion.div>

            {/* Lead Story Paragraph */}
            <motion.div variants={rightColumnItem}>
              <p className="type-lead text-ink/85">
                Nirvana Yoga School is more than a teacher training — it is an
                ancient healing art set in the heart of Rishikesh along the
                sacred Ganges, elevated by the spirit of Himalayan stillness.
                With a wise and compassionate teacher team, our residential and
                online programs take very good care of each student, surrounded
                by a gentle support matrix of community, tradition, and nature.
              </p>
            </motion.div>

            {/* Split Grid for Vision and Promise */}
            <motion.div
              variants={rightColumnItem}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2"
            >
              <div className="space-y-2 border-t border-ink/5 pt-4">
                <span className="text-primary font-bold text-xs uppercase tracking-widest block">
                  01 / Our Vision
                </span>
                <p className="text-xs sm:text-sm text-ink/75 leading-relaxed font-sans font-normal">
                  Our vision is to share timeless yogic wisdom with sincerity,
                  care, and devotion. From every breath, posture, and chant, we
                  invite you into a life that feels complete, serene, and deeply
                  aligned — rooted in tradition yet respectful of every
                  individual journey.
                </p>
              </div>

              <div className="space-y-2 border-t border-ink/5 pt-4">
                <span className="text-primary font-bold text-xs uppercase tracking-widest block">
                  02 / Our Promise
                </span>
                <p className="text-xs sm:text-sm text-ink/75 leading-relaxed font-sans font-normal">
                  Whether you join us for a foundational training or a deeper
                  immersion, our intention remains steady: to hold the space for
                  meaningful transformation. We welcome seekers from around the
                  globe to walk with us on this journey — not as students but as
                  co-travellers.
                </p>
              </div>
            </motion.div>

            {/* Highlights List - Minimalist check grid */}
            <motion.div
              variants={rightColumnItem}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-ink/10"
            >
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 cursor-default select-none"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-ink/80 font-medium leading-tight">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={rightColumnItem}
              className="flex flex-wrap gap-2.5 sm:gap-3"
            >
              <Button
                href="#courses"
                variant="primary"
                size="md"
                responsive
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                View Courses
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}
