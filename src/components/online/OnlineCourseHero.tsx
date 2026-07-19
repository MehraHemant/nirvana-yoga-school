"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HeroFrame } from "@/components/hero";
import { Button, Container, Heading, Pill } from "@/components/ui";
import { ArrowRight, Play } from "@/icons";
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
 * Compact online-course hero: dark brand band with copy left and a framed
 * preview image/video on the right. Keeps transparent-header behavior.
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
    <HeroFrame
      transparentHeader
      className="online-hero relative isolate overflow-hidden bg-linear-to-br from-ink to-primary-dark pt-(--site-header-height) text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-55"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 88% 8%, rgb(255 255 255 / 0.08), transparent 40%), radial-gradient(circle at 8% 92%, rgb(163 36 50 / 0.28), transparent 46%)",
        }}
      />

      <Container
        size="2xl"
        className="relative z-10 grid items-center gap-6 py-8 sm:gap-8 sm:py-10 md:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10 lg:py-12"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-4"
        >
          <div className="space-y-2.5">
            {eyebrow ? <Pill invert>{eyebrow}</Pill> : null}
            <Heading
              as="h1"
              size="none"
              font="serif"
              invert
              className="max-w-xl text-balance text-2xl font-medium leading-[1.1] tracking-tight sm:text-3xl md:text-[2.125rem] lg:text-[2.375rem]"
            >
              {title}
            </Heading>
            {subtitle ? (
              <p className="max-w-lg type-body text-pretty text-white/80">
                {subtitle}
              </p>
            ) : null}
          </div>

          {metaItems.length > 0 ? (
            <dl className="hero-glass grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-4">
              {metaItems.map((item) => (
                <div
                  key={item.label}
                  className="bg-ink/25 px-2.5 py-2 sm:px-3 sm:py-2.5"
                >
                  <dt className="type-eyebrow text-white/65">{item.label}</dt>
                  <dd className="mt-0.5 text-xs font-semibold leading-snug text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {ctaPrimary && ctaPrimaryHref ? (
              <Button
                href={ctaPrimaryHref}
                variant="primary"
                size="sm"
                className="group shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35"
              >
                {ctaPrimary}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            ) : null}
            {ctaSecondary && ctaSecondaryHref ? (
              <Button href={ctaSecondaryHref} variant="outline-light" size="sm">
                {ctaSecondary}
              </Button>
            ) : null}
          </div>
        </motion.div>

        {previewThumb ? (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none"
          >
            <div
              className="absolute -inset-1.5 rounded-2xl bg-linear-to-tr from-accent/20 via-primary/12 to-transparent opacity-45 blur-lg"
              aria-hidden="true"
            />
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-2xl">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={previewThumb}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 380px"
                  className="object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-ink/10" />

                {previewVideo ? (
                  <>
                    <span className="absolute top-2 left-2 rounded-full bg-ink/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      Preview
                    </span>
                    <a
                      href={youTubeWatchUrl(previewVideo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-ink/10 transition-colors hover:bg-ink/25"
                      aria-label="Watch course preview on YouTube"
                    >
                      <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft transition-transform group-hover:scale-110 sm:size-11">
                        <Play size={15} className="ml-0.5 text-ink/85" />
                      </span>
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </Container>
    </HeroFrame>
  );
}
