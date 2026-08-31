"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import VideoPlaylistPlayer from "@/components/home/VideoPlaylistPlayer";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import { SanitizedHtml } from "@/components/ui/SanitizedHtml";
import {
  cmsImageAlt,
  cmsImageCursorClass,
  handleCmsImageClick,
  type ImageClickAction,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import { HeroFlourish } from "@/icons";
import { resolveInlineRichTextHtml } from "@/lib/cms/blog-html";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";
import type { GlanceItem } from "@/content/types/page-modules";

type OverviewSpec = {
  index: string;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
};

/**
 * Maps CMS glance rows into overview fact-sheet specs.
 *
 * @param glance - Overview glance items from page modules
 */
function glanceToSpecs(glance: GlanceItem[]): OverviewSpec[] {
  return glance
    .filter((item) => Boolean(item.value?.trim()))
    .map((item, index) => ({
      index: String(index + 1).padStart(2, "0"),
      label: item.label,
      value: item.value,
      hint: item.hint?.trim() ? item.hint : undefined,
      highlight: /fee|price|tuition|cost/i.test(item.label),
    }));
}

/**
 * Legacy fallback when no glance rows exist in page modules.
 *
 * @param level - Focus level
 * @param duration - Program duration
 * @param certification - Certification line
 * @param fee - Fee display
 */
function legacyOverviewSpecs(
  level: string,
  duration: string,
  certification: string,
  fee: string,
): OverviewSpec[] {
  return [
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
  ].filter((spec) => Boolean(spec.value?.trim()));
}

/**
 * Merges overview description + lead into one HTML body for public display.
 *
 * @param description - Plain or HTML intro copy
 * @param lead - Rich-text lead body
 */
function mergeOverviewLead(description: string, lead: string): string {
  const descHtml = resolveInlineRichTextHtml(description);
  const leadHtml = resolveInlineRichTextHtml(lead);
  if (descHtml && leadHtml) return `${descHtml}${leadHtml}`;
  return descHtml || leadHtml;
}

/**
 * Responsive column classes so the glance sheet stays even for common counts.
 *
 * @param count - Number of fact cells
 */
function glanceGridClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    case 5:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
    case 6:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }
}

/**
 * Single fact cell for the course overview glance sheet.
 *
 * @param props - Glance spec row and stagger index for motion
 */
function OverviewGlanceItem({
  spec,
  index,
}: {
  spec: OverviewSpec;
  index: number;
}) {
  const highlighted = Boolean(spec.highlight);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      custom={index * 0.06}
      variants={fadeUp}
      className={`relative flex min-h-full flex-col gap-3 px-5 py-6 sm:gap-3.5 sm:px-7 sm:py-7 ${
        highlighted ? "bg-primary/[0.035]" : "bg-white"
      }`}
    >
      {highlighted ? (
        <span
          className="absolute inset-y-0 left-0 w-0.5 bg-primary/50"
          aria-hidden
        />
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <dt className="type-eyebrow text-ink/40">{spec.label}</dt>
        <span
          className="shrink-0 text-[0.6875rem] font-medium tabular-nums tracking-[0.12em] text-ink/25"
          aria-hidden
        >
          {spec.index}
        </span>
      </div>
      <dd className="flex min-w-0 flex-1 flex-col gap-2">
        <span
          className={`type-display-sm tracking-tight ${
            highlighted ? "font-semibold text-primary" : "font-semibold text-ink"
          }`}
        >
          {spec.value}
        </span>
        {spec.hint ? (
          <span className="mt-auto max-w-[18rem] text-sm leading-relaxed text-ink/50">
            {spec.hint}
          </span>
        ) : null}
      </dd>
    </motion.div>
  );
}

type CourseOverviewProps = {
  /** Lead overview paragraph (legacy prop name — may include merged description) */
  overview: string;
  /** Short intro prepended to the lead body on the public page */
  description?: string;
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
  /** Optional subheading above the lead body */
  heading?: string;
  /** Quote with author attribution */
  saying?: { text: string; author: string };
  /** Supporting paragraph under the lead */
  supportingCopy?: string;
  /** CMS glance stats (label, value, hint) — preferred over legacy level/duration props */
  glance?: GlanceItem[];
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
  description = "",
  level,
  duration,
  certification = "",
  fee = "",
  videos = [],
  featureImages = [],
  overviewImages = [],
  eyebrow = "",
  title = "",
  heading = "",
  saying,
  supportingCopy = "",
  glance = [],
  htmlId = "overview",
}: CourseOverviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const resolvedOverview = useMemo(
    () => mergeOverviewLead(description, overview),
    [description, overview],
  );
  const resolvedSupporting = supportingCopy.trim() ? supportingCopy : undefined;
  const resolvedHeading = heading.trim() ? heading : undefined;
  const resolvedSaying = saying?.text?.trim()
    ? { text: saying.text.trim(), author: saying.author?.trim() ?? "" }
    : undefined;
  const showVideoPanel = videos.length > 0;
  const carouselImages =
    overviewImages.length > 0
      ? overviewImages.map(normalizeCmsImage)
      : featureImages.map((url) => normalizeCmsImage(url));
  const showImagePanel = !showVideoPanel && carouselImages.length > 0;

  useEffect(() => {
    if (carouselImages.length > 0) setActiveImageIndex(0);
  }, [carouselImages.length]);

  const overviewSpecs =
    glance.length > 0
      ? glanceToSpecs(glance)
      : legacyOverviewSpecs(level, duration, certification, fee);

  return (
    <section
      id={htmlId}
      className="relative overflow-hidden bg-white py-16 sm:py-14"
    >
      <HeroFlourish className="pointer-events-none absolute right-[-8%] top-[5%] h-[450px] w-[450px] rotate-45 text-accent/12" />
      <HeroFlourish className="pointer-events-none absolute bottom-[-5%] left-[-12%] h-[380px] w-[380px] text-primary/4" />

      <Container size="2xl" className="w-full">
        <div className="space-y-10 lg:space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="w-full space-y-6"
          >
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              align="left"
              className="mb-4 max-w-6xl"
            />
            <div>
              {resolvedHeading ? (
                <h3 className="type-h3 mb-3 max-w-3xl text-ink">
                  {resolvedHeading}
                </h3>
              ) : null}
              {resolvedOverview ? (
                <SanitizedHtml
                  html={resolvedOverview}
                  className="cms-overview-lead flex flex-col gap-2 type-lead text-ink"
                />
              ) : null}
            </div>
            {resolvedSupporting ? (
              <p className="type-lead text-ink">
                {resolvedSupporting}
              </p>
            ) : null}
            {resolvedSaying ? (
              <figure className="max-w-3xl border-l-2 border-primary/25 pl-5 sm:pl-6">
                <blockquote className="type-lead text-ink">
                  {resolvedSaying.text}
                </blockquote>
                {resolvedSaying.author ? (
                  <figcaption className="mt-3 text-right text-sm text-ink">
                    — {resolvedSaying.author}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </motion.div>

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
                  <h3 className="type-h3 mt-1 text-ink">
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
                      className={`h-2 rounded-full transition-all ${index === activeImageIndex ? "w-6 bg-white" : "w-2 bg-white/60"}`}
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

          {overviewSpecs.length > 0 ? (
            <div className="space-y-5 sm:space-y-6">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
                variants={fadeUp}
                className="flex flex-col gap-1 border-b border-ink/8 pb-4 sm:pb-5"
              >
                <p className="type-eyebrow text-primary">Course at a glance</p>
                <h3 className="type-h3 text-ink">Program essentials</h3>
              </motion.div>

              <dl
                className={`grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 shadow-[0_1px_0_rgb(26_20_16/0.03)] ${glanceGridClass(overviewSpecs.length)}`}
              >
                {overviewSpecs.map((spec, index) => (
                  <OverviewGlanceItem
                    key={`${spec.label}-${spec.index}`}
                    spec={spec}
                    index={index}
                  />
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
