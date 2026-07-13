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

/**
 * OnlineCourseHero displays metadata tables, descriptions, and interactive preview video dialogs
 * for virtual study courses and distance teacher programs.
 *
 * @param props - Component properties conforming to OnlineCourseHeroProps
 */
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
    <section className="online-hero relative overflow-hidden bg-[#e5eef7] pt-[var(--site-header-height)] text-ink">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
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
              <p className="type-eyebrow text-primary font-semibold">
                Online Yoga Teacher Training
              </p>
              <h1 className="font-serif text-3xl font-medium leading-[1.08] text-ink sm:text-4xl md:text-[2.75rem]">
                {title}
              </h1>
              <p className="font-serif text-lg text-primary font-medium sm:text-xl">
                {certification} · Globally Recognised
              </p>
              <p className="max-w-2xl type-body text-ink/80">{subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-ink/85">
              <span className="rounded-full border border-primary/10 bg-white/60 px-3 py-1">
                {duration}
              </span>
              <span className="rounded-full border border-primary/10 bg-white/60 px-3 py-1">
                {level}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-semibold text-primary">
                {fee}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                href={onlineEnquireHref(title)}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enquire Now
              </Button>
              <Button
                href={ctaSecondaryHref}
                variant="ghost"
                size="md"
                className="border border-primary/20 text-primary hover:bg-primary/5"
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
              <div className="relative aspect-video overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-xl">
                <div className="relative h-full w-full">
                  <Image
                    src={previewThumb}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                  {previewVideoId && (
                    <a
                      href={ctaSecondaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex size-16 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-105">
                        <Play size={28} className="ml-1" />
                      </span>
                      <span className="sr-only">Watch free preview</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-ink/8 px-5 py-4">
                  <div>
                    <p className="type-eyebrow text-muted">Free preview</p>
                    <p className="font-serif text-lg text-ink">
                      Try before you enroll
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <BadgeStar size={14} className="text-amber-500" />
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
