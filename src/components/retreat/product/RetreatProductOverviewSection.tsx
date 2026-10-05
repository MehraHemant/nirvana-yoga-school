"use client";

import { useState } from "react";
import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { Play } from "@/icons";
import {
  buildYouTubeEmbedUrl,
  parseYouTubeId,
  youTubeThumbnailUrl,
} from "@/lib/youtube";
import type { RetreatProductOverviewContent } from "./retreatProductTypes";

type RetreatProductOverviewSectionProps = {
  content: RetreatProductOverviewContent;
};

/**
 * Click-to-play YouTube embed for the retreat overview section.
 *
 * @param props - Watch URL, title, and optional poster
 */
function OverviewVideoPlayer({
  youtubeUrl,
  title,
}: {
  youtubeUrl: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = parseYouTubeId(youtubeUrl);

  if (!videoId) return null;

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/10 bg-ink shadow-card">
        <iframe
          src={buildYouTubeEmbedUrl(videoId, true)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/10 bg-ink shadow-card"
      aria-label={`Play video: ${title}`}
    >
      {/* biome-ignore lint/performance/noImgElement: YouTube poster with client fallback */}
      <img
        src={youTubeThumbnailUrl(videoId)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
      />
      <span className="absolute inset-0 bg-ink/25 transition group-hover:bg-ink/20" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition group-hover:scale-105">
        <Play size={22} className="ml-0.5 fill-current" />
      </span>
    </button>
  );
}

/**
 * Retreat overview — lead copy, optional subhead blocks, glance chips, and YouTube.
 *
 * @param content - CMS-mapped overview fields
 */
export default function RetreatProductOverviewSection({
  content,
}: RetreatProductOverviewSectionProps) {
  const videoUrl = content.youtubeUrl?.trim();
  const videoTitle =
    content.videoTitle?.trim() || "The Nirvana Retreat Experience";
  const showVideo = Boolean(videoUrl && parseYouTubeId(videoUrl));
  const blocks = content.blocks ?? [];

  return (
    <RetreatSectionShell
      id="overview"
      eyebrow={content.eyebrow}
      title={content.title}
    >
      <div className="space-y-10">
        <div className="space-y-6">
          <div className="space-y-5">
            {content.lead.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="type-body text-ink">
                {paragraph}
              </p>
            ))}
          </div>
          {blocks.length > 0 ? (
            <div className="space-y-6 border-t border-ink/8 pt-6">
              {blocks.map((block) => (
                <div key={block.heading} className="space-y-2">
                  <h3 className="type-h4 text-ink">{block.heading}</h3>
                  <p className="type-body text-ink/85">{block.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {content.glance.length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.glance.map((spec) => (
              <div
                key={`${spec.label}-${spec.value}`}
                className="rounded-2xl border border-primary/10 bg-white px-4 py-3.5 shadow-xs transition hover:border-primary/25 hover:shadow-sm"
              >
                <dt className="type-eyebrow text-primary">{spec.label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {showVideo && videoUrl ? (
          <div className="min-w-0 space-y-3">
            <p className="type-eyebrow text-primary">{videoTitle}</p>
            <OverviewVideoPlayer youtubeUrl={videoUrl} title={videoTitle} />
          </div>
        ) : null}
      </div>
    </RetreatSectionShell>
  );
}
