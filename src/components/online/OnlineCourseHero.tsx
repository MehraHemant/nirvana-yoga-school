"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
import { BadgeStar, Play } from "@/icons";
import { fadeUp } from "@/lib/motion";
import { onlineEnquireHref } from "./utils";

type OnlineCourseHeroProps = {
  title: string;
  subtitle: string;
  duration: string;
  level: string;
  certification: string;
  fee: string;
  image?: string;
  previewVideoId?: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
};

export default function OnlineCourseHero({
  title,
  subtitle,
  duration,
  level,
  certification,
  fee,
  image,
  previewVideoId,
  ctaPrimary,
  ctaPrimaryHref,
  ctaSecondary,
  ctaSecondaryHref,
}: OnlineCourseHeroProps) {
  const previewThumb = previewVideoId
    ? `https://img.youtube.com/vi/${previewVideoId}/maxresdefault.jpg`
    : image;

  return (
    <section className="online-hero relative overflow-hidden bg-secondary pt-[4.75rem] text-white md:pt-[5.5rem]">
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
                Online Yoga Teacher Training
              </p>
              <h1 className="font-serif text-3xl font-medium leading-[1.08] sm:text-4xl md:text-[2.75rem]">
                {title}
              </h1>
              <p className="font-serif text-lg text-white/90 sm:text-xl">
                {certification} · Globally Recognised
              </p>
              <p className="max-w-2xl type-body text-white/75">{subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                {duration}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                {level}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white">
                {fee}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                href={onlineEnquireHref(title)}
                variant="outline-light"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enquire Now
              </Button>
              <Button
                href={ctaSecondaryHref}
                variant="outline-light"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaSecondary}
              </Button>
              <Button
                href={ctaPrimaryHref}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaPrimary}
              </Button>
            </div>
          </motion.div>

          {previewThumb && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
            >
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/20">
                <div className="relative aspect-video">
                  <Image
                    src={previewThumb}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-secondary-dark/60 via-transparent to-transparent" />
                  {previewVideoId && (
                    <a
                      href={ctaSecondaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                        <Play size={28} className="ml-1 text-white" />
                      </span>
                      <span className="sr-only">Watch free preview</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <div>
                    <p className="type-eyebrow text-white/60">Free preview</p>
                    <p className="font-serif text-lg text-white">
                      Try before you enroll
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    <BadgeStar size={14} className="text-amber-300" />
                    4.9 rating
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
}
