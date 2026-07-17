"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container, Heading } from "@/components/ui";
import { fadeUp } from "@/lib/motion";
import { retreatEnquireHref } from "./utils";

type RetreatHeroProps = {
  title: string;
  description: string;
  duration: string;
  fee: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
};

function displayTitle(title: string) {
  return title.replace(/^\d+\s*-?\s*Day\s+/i, "").trim();
}

export default function RetreatHero({
  title,
  description,
  duration,
  fee,
  image,
  ctaLabel,
  ctaHref,
}: RetreatHeroProps) {
  return (
    <section className="retreat-hero relative overflow-hidden bg-linear-to-br from-secondary via-ink to-secondary/90 text-white">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgb(255 255 255 / 0.12), transparent 45%), radial-gradient(circle at 15% 85%, rgb(163 36 50 / 0.25), transparent 45%)",
        }}
      />

      {/* Soft hero radial glow bottom-left */}
      <div
        className="hero-glow absolute -bottom-1/3 -left-1/4 h-[80%] w-[80%] opacity-35"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 py-12 md:py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="type-eyebrow inline-block rounded-full bg-accent/15 px-3 py-1 text-accent border border-accent/20">
                Yoga Retreat · Rishikesh, India
              </span>
              <Heading
                as="h1"
                size="h1"
                invert
                className="font-noe font-medium text-4xl sm:text-5xl md:text-6xl leading-[1.05]"
              >
                {displayTitle(title)}
              </Heading>
              <p className="max-w-2xl type-lead leading-relaxed text-white/80 font-sans">
                {description}
              </p>
            </div>

            {/* Glassmorphism badges */}
            <div className="flex flex-wrap gap-2.5">
              <span className="hero-glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                ⏱ {duration}
              </span>
              <span className="hero-glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent border-accent/30">
                🏷 {fee}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                href={ctaHref}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              >
                {ctaLabel}
              </Button>
              <Button
                href={retreatEnquireHref(title)}
                variant="outline-light"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enquire Now
              </Button>
              <Button
                href="#pricing"
                variant="outline-light"
                size="md"
                className="border-white/25 bg-transparent hover:bg-white/15 hover:text-white"
              >
                View Packages ↓
              </Button>
            </div>
          </motion.div>

          {/* Featured Image Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            {/* Ambient image shadow glow */}
            <div className="absolute -inset-2.5 rounded-3xl bg-linear-to-tr from-accent/20 to-primary/10 opacity-30 blur-2xl" />

            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl transition-all duration-300 hover:border-white/20">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  priority
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-103"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-80" />
              </div>
              <div className="border-t border-white/10 px-6 py-5 bg-ink/30 backdrop-blur-xs">
                <p className="type-eyebrow text-accent/80 tracking-widest">
                  Himalayan Wellness
                </p>
                <p className="font-serif text-xl mt-1 text-white leading-snug">
                  Yoga, Meditation & Ayurvedic Healing
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
