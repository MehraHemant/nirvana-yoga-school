"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
import { fadeUp } from "@/lib/motion";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";

type OnlineCourseHeroProps = {
  eyebrow?: string;
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
 * OnlineCourseHero displays the CMS-configured hero for virtual study courses.
 *
 * @param props - Component properties conforming to OnlineCourseHeroProps
 */
export default function OnlineCourseHero({
  eyebrow,
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
  const previewVideo = previewVideoId ? parseYouTubeId(previewVideoId) : null;
  const previewThumb = previewVideo
    ? `https://img.youtube.com/vi/${previewVideo}/maxresdefault.jpg`
    : image;
  const metaItems = [
    { label: "Duration", value: duration },
    { label: "Level", value: level },
    { label: "Certification", value: certification },
    { label: "Fee", value: fee },
  ].filter((item) => item.value.trim());

  return (
    <section
      data-transparent-header="true"
      className="online-hero relative isolate overflow-hidden bg-[#17222b] pt-(--site-header-height) text-white"
    >
      {previewThumb ? (
        <>
          <Image
            src={previewThumb}
            alt=""
            fill
            priority
            className="object-cover object-center opacity-70"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#101b22]/92 via-[#101b22]/68 to-[#101b22]/28"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#101b22]/65 via-transparent to-[#101b22]/35"
            aria-hidden="true"
          />
        </>
      ) : null}

      <Container
        size="2xl"
        className="relative z-10 flex min-h-[540px] items-end py-14 sm:min-h-[580px] md:py-20 lg:min-h-[640px] lg:py-24"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl"
        >
          <div className="space-y-5">
            {eyebrow ? (
              <p className="type-eyebrow font-semibold tracking-[0.14em] text-accent">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.03] text-balance text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-2xl type-lead text-pretty text-white/85">
                {subtitle}
              </p>
            ) : null}
          </div>

          {metaItems.length > 0 ? (
            <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 backdrop-blur-[2px] sm:grid-cols-4">
              {metaItems.map((item) => (
                <div key={item.label} className="bg-[#101b22]/30 px-4 py-3.5">
                  <dt className="type-eyebrow text-white/60">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {ctaPrimary && ctaPrimaryHref ? (
              <Button href={ctaPrimaryHref} variant="primary" size="md">
                {ctaPrimary}
              </Button>
            ) : null}
            {ctaSecondary && ctaSecondaryHref ? (
              <Button
                href={ctaSecondaryHref}
                variant="ghost"
                size="md"
                className="border border-white/35 text-white hover:bg-white/10"
              >
                {ctaSecondary}
              </Button>
            ) : null}
            {previewVideo ? (
              <a
                href={youTubeWatchUrl(previewVideo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-white/85 transition-colors hover:text-white"
              >
                <span
                  className="flex size-8 items-center justify-center rounded-full border border-white/45"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 12 12"
                    className="ml-0.5 size-3 fill-current"
                    focusable="false"
                  >
                    <title>Play</title>
                    <path d="M3 2.25v7.5L9 6 3 2.25Z" />
                  </svg>
                </span>
                Watch preview
              </a>
            ) : null}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
