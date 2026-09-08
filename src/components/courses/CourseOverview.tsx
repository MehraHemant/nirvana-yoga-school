"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
/** Content-hashed so next/image cache updates when the PNG is replaced. */
import heroMandalaSrc from "../../../public/images/hero-mandala.png";
import GlanceSoftWashGrid, {
  glanceToSpecs,
  legacyOverviewSpecs,
} from "@/components/courses/GlanceSoftWashGrid";
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
import { resolveInlineRichTextHtml } from "@/lib/cms/blog-html";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { YouTubeVideo } from "@/lib/youtube";
import type { GlanceItem } from "@/content/types/page-modules";

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
 * Spinning overview flourish: circular clip + white disc so PNG gaps
 * read as a filled medallion on the white section, not a hollow hole.
 *
 * @param size - Intrinsic image width/height
 * @param className - Position, size, and opacity utilities
 */
function HeroMandalaFlourish({
  size,
  className,
}: {
  size: number;
  className: string;
}) {
  return (
    <div
      aria-hidden
      className={`hero-mandala-spin pointer-events-none absolute overflow-hidden rounded-full bg-white ${className}`}
    >
      <Image
        src={heroMandalaSrc}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </div>
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
      <HeroMandalaFlourish
        size={450}
        className="right-[-8%] top-[5%] h-[450px] w-[450px] opacity-25"
      />
      {/* <HeroMandalaFlourish
        size={380}
        className="bottom-[-5%] left-[-12%] h-[380px] w-[380px] opacity-15"
      /> */}

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
            <GlanceSoftWashGrid specs={overviewSpecs} />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
