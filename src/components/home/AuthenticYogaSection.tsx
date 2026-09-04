"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader, YouTubeThumbImage } from "@/components/ui";
import type { HomeAuthenticYogaContent } from "@/content/types/dedicated-pages";
import { Play } from "@/icons";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import { parseYouTubeId } from "@/lib/youtube";

type AuthenticYogaSectionProps = {
  /** Full CMS authentic yoga section */
  content?: HomeAuthenticYogaContent;
};

/**
 * Builds a YouTube embed URL for click-to-play tiles.
 *
 * @param videoId - YouTube video id
 * @param autoplay - Whether to autoplay after the user taps play
 */
function buildEmbedUrl(videoId: string, autoplay: boolean) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    showinfo: "0",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type AuthenticYogaVideoTileProps = {
  youtubeUrl: string;
  caption: string;
};

/**
 * Click-to-play YouTube tile with a caption under the player.
 *
 * @param props - YouTube URL and caption from CMS
 */
function AuthenticYogaVideoTile({
  youtubeUrl,
  caption,
}: AuthenticYogaVideoTileProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = parseYouTubeId(youtubeUrl);
  if (!videoId) return null;

  const label = caption.trim() || "Play video";

  return (
    <div>
      {playing ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink/5 bg-ink shadow-card sm:rounded-3xl">
          <iframe
            src={buildEmbedUrl(videoId, true)}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-ink/5 bg-ink/10 text-left shadow-card sm:rounded-3xl"
          aria-label={`Play ${label}`}
        >
          <YouTubeThumbImage
            videoId={videoId}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span
            className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35"
            aria-hidden="true"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
              <Play size={20} className="ml-0.5" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
      {caption.trim() ? (
        <p className="type-body mt-3 text-center font-medium text-ink">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Homepage authentic yoga band — original live-site copy plus a 2×2 video grid.
 *
 * @param props - Optional CMS authentic yoga content
 */
export default function AuthenticYogaSection({
  content = createEmptyHomePageContent().authenticYoga,
}: AuthenticYogaSectionProps) {
  const paragraphs =
    content.paragraphs?.length > 0
      ? content.paragraphs
      : createEmptyHomePageContent().authenticYoga.paragraphs;
  const videos =
    content.videos?.length > 0
      ? content.videos
      : createEmptyHomePageContent().authenticYoga.videos;
  const playableVideos = videos.filter((video) =>
    Boolean(parseYouTubeId(video.youtubeUrl)),
  );

  return (
    <section
      id={resolveSectionHtmlId("authentic-yoga", content._id)}
      className="relative overflow-hidden bg-white section-padding-y"
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            align="left"
            className="max-w-5xl"
          />
          <div className="mt-5 space-y-4 sm:mt-6">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 32)}`}
                className="type-body text-ink"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {playableVideos.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2">
            {playableVideos.map((video) => (
              <AuthenticYogaVideoTile
                key={video.youtubeUrl}
                youtubeUrl={video.youtubeUrl}
                caption={video.caption}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
