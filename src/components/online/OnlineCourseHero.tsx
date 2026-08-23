"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { HeroFrame } from "@/components/hero";
import { Button, Container, Heading, Pill } from "@/components/ui";
import { ArrowRight, Play } from "@/icons";
import { fadeUp, reducedTransition } from "@/lib/motion";
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
 * Online-course hero: dark ink band with copy left and a framed
 * preview image/video on the right. Keeps transparent-header contrast
 * for the white logo and primary header CTAs.
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
  const prefersReduced = useReducedMotion() ?? false;
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
    <HeroFrame
      transparentHeader
      className="online-hero relative isolate overflow-hidden bg-ink pt-(--site-header-height) text-white"
    >
      <div
        className="online-hero-wash pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="online-hero-glow pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <Container
        size="2xl"
        className="relative z-10 grid items-center gap-8 py-10 sm:gap-10 sm:py-12 md:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 lg:py-16"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-5 sm:space-y-6"
        >
          <div className="space-y-3 sm:space-y-3.5">
            {eyebrow ? <Pill invert>{eyebrow}</Pill> : null}
            <Heading
              as="h1"
              size="none"
              invert
              className="max-w-xl text-balance text-[1.75rem] font-bold leading-[1.08] tracking-tight sm:text-4xl md:text-[2.5rem] lg:text-[2.75rem]"
            >
              {title}
            </Heading>
            {subtitle ? (
              <p className="max-w-lg type-body text-pretty text-white/78 sm:text-base md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>

          {metaItems.length > 0 ? (
            <motion.dl
              initial="hidden"
              animate="visible"
              custom={0.08}
              variants={fadeUp}
              className="flex max-w-xl flex-wrap gap-x-5 gap-y-3 border-y border-white/12 py-3.5 sm:gap-x-7 sm:py-4"
            >
              {metaItems.map((item) => (
                <div key={item.label} className="min-w-22">
                  <dt className="type-eyebrow text-white/55">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {ctaPrimary && ctaPrimaryHref ? (
              <Button
                href={ctaPrimaryHref}
                variant="primary"
                size="md"
                className="group shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
              >
                {ctaPrimary}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            ) : null}
            {ctaSecondary && ctaSecondaryHref ? (
              <Button href={ctaSecondaryHref} variant="outline-light" size="md">
                {ctaSecondary}
              </Button>
            ) : null}
          </div>
        </motion.div>

        {previewThumb ? (
          <motion.div
            initial={
              prefersReduced ? false : { opacity: 0, y: 18, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reducedTransition(prefersReduced, {
              duration: 0.55,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            })}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div
              className="pointer-events-none absolute -inset-6 rounded-full bg-primary/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="group relative overflow-hidden rounded-[1.35rem] ring-1 ring-white/18 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)]">
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={previewThumb}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-ink/10"
                  aria-hidden="true"
                />

                {previewVideo ? (
                  <a
                    href={youTubeWatchUrl(previewVideo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-ink/15 transition-colors hover:bg-ink/30"
                    aria-label="Watch course preview on YouTube"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-white text-ink shadow-soft transition-transform duration-300 group-hover:scale-110 sm:size-14">
                      <Play size={18} className="ml-0.5" />
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </Container>
    </HeroFrame>
  );
}
