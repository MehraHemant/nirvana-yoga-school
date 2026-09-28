import type { YouTubeVideo } from "@/lib/youtube";

/**
 * Unified playlist entry for YouTube embeds and Cloudinary native playback.
 */
export type PlaylistVideo = YouTubeVideo & {
  source: "youtube" | "cloudinary";
  /** Direct file URL when `source` is `cloudinary` */
  playbackUrl?: string;
};

/**
 * Adapts legacy YouTube-only arrays for the shared player.
 *
 * @param videos - YouTube metadata rows
 */
export function asYouTubePlaylist(videos: YouTubeVideo[]): PlaylistVideo[] {
  return videos.map((video) => ({ ...video, source: "youtube" as const }));
}
