"use client";

import VideoPlaylistPlayer from "@/components/home/VideoPlaylistPlayer";
import type { YouTubeVideo } from "@/lib/youtube";
import OverviewImagePanel from "./OverviewImagePanel";
import type { ResolvedOverview } from "./types";

/**
 * Playlist heading used above the homepage-style player.
 */
function FilmsHeading() {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="type-eyebrow text-primary">Course films</p>
      <h3 className="type-h3 mt-1 text-ink">Watch the journey</h3>
    </div>
  );
}

/**
 * Course films: homepage playlist player.
 *
 * @param props.videos - YouTube videos from CMS
 */
export default function CourseOverviewVideos({
  videos,
}: {
  videos: YouTubeVideo[];
}) {
  if (videos.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <FilmsHeading />
      <VideoPlaylistPlayer videos={videos} />
    </div>
  );
}

/**
 * Videos when present, otherwise the overview image carousel.
 *
 * @param props.data - Resolved overview media
 */
export function OverviewMedia({
  data,
}: {
  data: Pick<
    ResolvedOverview,
    "videos" | "images" | "showVideoPanel" | "showImagePanel"
  >;
}) {
  if (data.showVideoPanel) {
    return <CourseOverviewVideos videos={data.videos} />;
  }
  if (data.showImagePanel) {
    return <OverviewImagePanel images={data.images} />;
  }
  return null;
}
