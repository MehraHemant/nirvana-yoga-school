"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import { Button, Container, Pill } from "@/components/ui";
import { BadgeStar, Check } from "@/icons";
import { EASE_OUT, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";

const HIGHLIGHTS = [
  "Yoga Alliance RYS-200 · 300 · 500",
  "Residential & online programs",
  "Sattvic meals & ashram living",
  "Excursions, kirtan & Ganga aarti",
] as const;

const STATS = [
  { number: "10+", label: "Courses" },
  { number: "20+", label: "Gurus" },
  { number: "10+ Yrs", label: "Exp. Faculty" },
  { number: "5.0 ★", label: "Student Rating" },
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

const credentialsCardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.15 },
  },
  hover: {
    scale: 1.015,
    y: -8,
    boxShadow: "0 20px 40px -15px rgba(163, 36, 50, 0.1)",
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

const statsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.35,
    },
  },
};

const statPopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 },
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* Left Column - Staggered Asymmetrical Gallery (Premium Editorial Layout) */}
          <motion.div
            variants={leftColumnContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="order-2 lg:order-1 w-full relative"
          >
            <div className="grid grid-cols-2 gap-5 sm:gap-6 items-start w-full max-w-2xl mx-auto lg:mx-0">
              {/* Column 1 (Left side) */}
              <div className="flex flex-col gap-5 sm:gap-6">
                {/* Image 1: banner_3 (Asana study) - Tall Aspect with continuous floating */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full"
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
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800&auto=format&fit=crop&q=80"
                      alt="Yoga practice at Nirvana Yoga School"
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    {/* Elegant bottom-up dark gradient vignette */}
                    <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    {/* Editorial Double-Decker Caption */}
                    <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10">
                      <span className="type-eyebrow text-accent text-[9px] sm:text-[10px] tracking-widest font-bold block mb-0.5 sm:mb-1">
                        Asana & Alignment
                      </span>
                      <h4 className="font-serif text-white text-sm sm:text-base md:text-lg font-medium leading-tight">
                        Traditional Practice
                      </h4>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Credentials Card: Refined professional design with spring entrances and continuous floating */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  whileHover={prefersReduced ? undefined : "hover"}
                  viewport={VIEWPORT_ONCE}
                  variants={credentialsCardVariants}
                  className="w-full"
                >
                  <motion.div
                    animate={prefersReduced ? {} : { y: [0, -4] }}
                    transition={
                      prefersReduced
                        ? {}
                        : {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2.6,
                            ease: "easeInOut",
                            delay: 0.4,
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="bg-white border border-primary/10 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-card select-none relative overflow-hidden"
                  >
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />

                    {/* Header with badge */}
                    <div className="flex items-center gap-2.5 sm:gap-3 border-b border-primary/10 pb-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        <BadgeStar size={16} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-ink text-xs sm:text-sm leading-tight">
                          Nirvana Credentials
                        </h4>
                        <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-widest font-bold mt-0.5">
                          Yoga Alliance USA RYS
                        </p>
                      </div>
                    </div>

                    {/* Clean 2x2 Stats Grid with left border accents */}
                    <motion.div
                      variants={statsContainerVariants}
                      className="grid grid-cols-2 gap-x-4 gap-y-3.5"
                    >
                      {STATS.map((s) => (
                        <motion.div
                          key={s.label}
                          variants={statPopVariants}
                          className="flex flex-col border-l-2 border-primary/25 pl-3"
                        >
                          <span className="font-serif text-xl sm:text-2xl font-bold text-primary leading-none">
                            {s.number}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-muted uppercase font-semibold tracking-wider mt-1 sm:mt-1.5 leading-tight">
                            {s.label}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Column 2 (Right side, offset vertically) */}
              <div className="flex flex-col gap-5 sm:gap-6 pt-8 sm:pt-14">
                {/* Image 2: banner_2 (Ganga Sunrise) - Square Aspect with continuous floating */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full"
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
                            delay: 0.2,
                          }
                    }
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    className="aspect-square relative rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80"
                      alt="Sunrise yoga by the Ganges"
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    {/* Editorial Double-Decker Caption */}
                    <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10">
                      <span className="type-eyebrow text-accent text-[9px] sm:text-[10px] tracking-widest font-bold block mb-0.5 sm:mb-1">
                        Sacred Ganges
                      </span>
                      <h4 className="font-serif text-white text-sm sm:text-base md:text-lg font-medium leading-tight">
                        Rishikesh Sunrise
                      </h4>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Image 3: banner_1 (Meditation) - Tall Aspect with continuous floating */}
                <motion.div
                  variants={galleryItemVariants}
                  whileHover={prefersReduced ? undefined : "hover"}
                  className="w-full"
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
                    className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-card border border-ink/5 group cursor-default"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80"
                      alt="Meditation session at Nirvana Yoga School"
                      fill
                      sizes="(max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    {/* Editorial Double-Decker Caption */}
                    <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10">
                      <span className="type-eyebrow text-accent text-[9px] sm:text-[10px] tracking-widest font-bold block mb-0.5 sm:mb-1">
                        Inner Silence
                      </span>
                      <h4 className="font-serif text-white text-sm sm:text-base md:text-lg font-medium leading-tight">
                        Meditation & Pranayama
                      </h4>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Clean Copy & Structured Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={rightColumnContainer}
            className="order-1 lg:order-2 flex flex-col gap-6 lg:pl-6 xl:pl-10 border-l border-primary/15 pl-4 sm:pl-6 md:pl-8"
          >
            <motion.div variants={rightColumnItem}>
              <Pill>Yoga Alliance Certified · India</Pill>
            </motion.div>

            <motion.div
              variants={rightColumnItem}
              className="space-y-3 sm:space-y-4"
            >
              <h2 className="font-serif font-medium text-[1.75rem] leading-[1.12] sm:text-3xl md:text-4xl lg:text-5xl sm:leading-[1.1] text-ink text-balance tracking-tight">
                Welcome to Nirvana — a{" "}
                <span className="text-primary italic font-normal animate-glow-primary">
                  sanctuary for the soul
                </span>{" "}
                in Rishikesh
              </h2>
              <div
                className="w-12 h-px bg-linear-to-r from-primary/80 via-accent/70 to-transparent"
                aria-hidden="true"
              />
            </motion.div>

            {/* Lead Story Paragraph */}
            <motion.div variants={rightColumnItem}>
              <p className="text-base sm:text-lg text-ink/85 leading-relaxed font-sans font-normal border-l-2 border-primary/20 pl-4">
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
              <Button href="#contact" variant="ghost" size="md" responsive>
                Speak With Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}
