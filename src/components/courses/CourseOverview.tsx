"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import VideoPlaylistPlayer from "@/components/home/VideoPlaylistPlayer";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import {
  cmsImageAlt,
  cmsImageCursorClass,
  handleCmsImageClick,
  type ImageClickAction,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import { HeroFlourish } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";

type CourseOverviewProps = {
  /** Lead overview paragraph */
  overview: string;
  /** Focus / experience level */
  level: string;
  /** Program duration */
  duration: string;
  /** Certification line */
  certification?: string;
  /** Fee display string */
  fee?: string;
  /** Optional YouTube playlist (rendered below the copy, homepage-style) */
  videos?: YouTubeVideo[];
  /** Optional image carousel when no videos are provided */
  featureImages?: string[];
  /** Rich overview carousel images (preferred over featureImages) */
  overviewImages?: Array<{
    url: string;
    alt?: string;
    clickAction?: import("@/content/types/cms-image").ImageClickAction;
    redirectUrl?: string;
  }>;
  /** Section eyebrow */
  eyebrow?: string;
  /** Section title */
  title?: ReactNode;
  /** Supporting paragraph under the lead */
  supportingCopy?: string;
  /** Blockquote body */
  quoteText?: string;
  /** Blockquote attribution */
  quoteAttribution?: string;
  /** Public section HTML id (defaults to `overview`) */
  htmlId?: string;
};

/**
 * Course / retreat / site overview: editorial copy first, then media on its
 * own row. Videos use the same playlist-left / player-right layout as the
 * homepage video section.
 *
 * @param props - Overview copy, glance specs, and optional media
 */
export default function CourseOverview({
  overview,
  level,
  duration,
  certification = "RYT-200, Yoga Alliance",
  fee = "649 USD",
  videos = [],
  featureImages = [],
  overviewImages = [],
  eyebrow = "The Inner Path",
  title = (
    <>
      Transform your practice &amp; <span className="text-primary">awaken</span>{" "}
      your true purpose.
    </>
  ),
  supportingCopy = "Our residential yoga training program is designed to facilitate physical purification, emotional release, and intellectual understanding. By immersing yourself completely in the ashram lifecycle, you step away from modern distractions to cultivate discipline, self-inquiry, and authentic teachings handed down through generations.",
  quoteText = "Yoga is not just physical posture; it is a sacred pathway to quieting the mind, understanding the self, and returning to the lineage of ancient wisdom.",
  quoteAttribution = "Himalayan Lineage Teachings",
  htmlId = "overview",
}: CourseOverviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const resolvedSupporting = supportingCopy === "" ? undefined : supportingCopy;
  const showVideoPanel = videos.length > 0;
  const carouselImages =
    overviewImages.length > 0
      ? overviewImages.map(normalizeCmsImage)
      : featureImages.map((url) => normalizeCmsImage(url));
  const showImagePanel = !showVideoPanel && carouselImages.length > 0;

  useEffect(() => {
    if (carouselImages.length > 0) setActiveImageIndex(0);
  }, [carouselImages.length]);

  const overviewSpecs = [
    {
      index: "01",
      label: "Focus Level",
      value: level,
      hint: "All training experience welcome",
    },
    {
      index: "02",
      label: "Immersive Duration",
      value: duration,
      hint: "Full-time ashram residency",
    },
    {
      index: "03",
      label: "Certification",
      value: certification,
      hint: "Worldwide standard credentials",
    },
    {
      index: "04",
      label: "Course Fee",
      value: fee,
      hint: "All-inclusive tuition & board",
      highlight: true,
    },
  ] as const;

  return (
    <section
      id={htmlId}
      className="relative overflow-hidden bg-white py-16 sm:py-14"
    >
      <div className="pointer-events-none absolute right-[-10%] top-[10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-accent/8 blur-[100px]" />
      <HeroFlourish className="pointer-events-none absolute right-[-8%] top-[5%] h-[450px] w-[450px] rotate-45 text-accent/12" />
      <HeroFlourish className="pointer-events-none absolute bottom-[-5%] left-[-12%] h-[380px] w-[380px] text-primary/4" />

      <Container size="2xl">
        <div className="space-y-10 lg:space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              align="left"
              className="mb-0!"
            />
          </motion.div>

          {/* Text first — full width editorial column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="grid gap-8 lg:grid-cols-12 lg:gap-12"
          >
            <div className="space-y-6 lg:col-span-7">
              <p className="type-lead text-muted first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-primary">
                {overview}
              </p>
              {resolvedSupporting ? (
                <p className="type-lead font-sans leading-relaxed text-muted">
                  {resolvedSupporting}
                </p>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-primary/5 p-7 text-ink shadow-card sm:p-8 lg:col-span-5 lg:self-start">
              <span
                className="pointer-events-none absolute -top-10 left-2 select-none font-serif text-[10rem] text-primary/8"
                aria-hidden="true"
              >
                “
              </span>
              <p className="relative z-10 font-serif text-lg italic leading-relaxed tracking-wide sm:text-xl">
                "{quoteText}"
              </p>
              <span className="type-eyebrow relative z-10 mt-4 block text-right font-semibold uppercase tracking-wider text-primary">
                — {quoteAttribution}
              </span>
            </div>
          </motion.div>

          {/* Media on its own row — homepage video layout */}
          {showVideoPanel ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="w-full min-w-0"
            >
              <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
                <div>
                  <p className="type-eyebrow text-primary">Course films</p>
                  <h3 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
                    Watch the journey
                  </h3>
                </div>
              </div>
              <VideoPlaylistPlayer videos={videos} />
            </motion.div>
          ) : null}

          {showImagePanel ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden rounded-3xl border border-ink/5 bg-ink/10 shadow-card sm:min-h-[280px]"
            >
              {(() => {
                const active =
                  carouselImages[activeImageIndex] ?? carouselImages[0];
                const action: ImageClickAction =
                  active.clickAction ?? "fullscreen";
                const alt = cmsImageAlt(active, "Course overview image");
                return (
                  <button
                    type="button"
                    disabled={action === "none"}
                    onClick={() =>
                      handleCmsImageClick(active, () => setLightboxOpen(true))
                    }
                    className={`absolute inset-0 h-full w-full ${cmsImageCursorClass(action)} disabled:cursor-default`}
                    aria-label={
                      action === "none"
                        ? alt
                        : action === "redirect"
                          ? `Open link for ${alt}`
                          : `View ${alt} fullscreen`
                    }
                  >
                    <Image
                      src={active.url}
                      alt={alt}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 1200px"
                      className="object-cover"
                    />
                  </button>
                );
              })()}
              {carouselImages.length > 1 ? (
                <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
                  {carouselImages.map((img, index) => (
                    <button
                      key={`${img.url}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        index === activeImageIndex
                          ? "w-6 bg-white"
                          : "w-2 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
              <MediaLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                items={carouselImages.map((img) => ({
                  type: "image" as const,
                  url: img.url,
                }))}
                activeIndex={activeImageIndex}
                onChangeActiveIndex={setActiveImageIndex}
                title="Overview gallery"
              />
            </motion.div>
          ) : null}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="relative mt-2 overflow-hidden rounded-3xl border border-ink/8 bg-surface shadow-card ring-1 ring-ink/5"
          >
            <HeroFlourish
              className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 text-primary/6"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-1 border-b border-ink/8 bg-surface-muted px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="type-eyebrow font-semibold uppercase tracking-[0.2em] text-primary">
                Course at a glance
              </p>
              <p className="font-sans text-xs text-muted">
                Residential program essentials
              </p>
            </div>

            <div className="relative grid grid-cols-1 divide-y divide-ink/6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {overviewSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className={`group relative flex flex-col gap-3 px-6 py-8 transition-colors sm:px-7 md:py-9 ${
                    "highlight" in spec && spec.highlight
                      ? "bg-linear-to-br from-primary/10 via-primary/5 to-transparent lg:rounded-br-3xl"
                      : "hover:bg-surface"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="type-eyebrow font-semibold uppercase tracking-wider text-primary">
                      {spec.label}
                    </span>
                    <span
                      className="font-serif text-lg leading-none text-primary/20"
                      aria-hidden="true"
                    >
                      {spec.index}
                    </span>
                  </div>
                  <p
                    className={`font-serif text-2xl font-medium leading-[1.15] tracking-tight sm:text-[1.65rem] ${
                      "highlight" in spec && spec.highlight
                        ? "text-primary"
                        : "text-ink"
                    }`}
                  >
                    {spec.value}
                  </p>
                  <p className="max-w-[16rem] font-sans text-xs leading-relaxed text-muted">
                    {spec.hint}
                  </p>
                  <span
                    className={`absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 sm:left-7 sm:right-7 ${
                      "highlight" in spec && spec.highlight
                        ? "bg-primary/25"
                        : "bg-accent/50"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
