"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
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
    <section className="retreat-hero relative overflow-hidden bg-secondary text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgb(255 255 255 / 0.08), transparent 35%), radial-gradient(circle at 10% 100%, rgb(163 36 50 / 0.18), transparent 40%)",
        }}
      />

      <Container size="2xl" className="relative z-10 py-10 md:py-14 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="space-y-6"
          >
            <div className="space-y-3">
              <p className="type-eyebrow text-white/70">
                Yoga Retreat · Rishikesh, India
              </p>
              <h1 className="font-serif text-3xl font-medium leading-[1.08] sm:text-4xl md:text-[2.75rem]">
                {displayTitle(title)}
              </h1>
              <p className="max-w-2xl type-body text-white/75">{description}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                {duration}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white">
                {fee}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                href={retreatEnquireHref(title)}
                variant="outline-light"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enquire Now
              </Button>
              <Button href="#pricing" variant="outline-light" size="md">
                View packages
              </Button>
              <Button
                href={ctaHref}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaLabel}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/20">
              <div className="relative aspect-[4/3] sm:aspect-video">
                <Image
                  src={image}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-secondary/60 via-transparent to-transparent" />
              </div>
              <div className="border-t border-white/10 px-5 py-4">
                <p className="type-eyebrow text-white/60">Himalayan wellness</p>
                <p className="font-serif text-lg text-white">
                  Yoga, meditation & Ayurveda
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
