import type { VideosModuleItem } from "@/content/types/page-modules";
import { cloudinaryVideoPosterUrl } from "@/lib/cdn/cloudinary-video-url";
import {
  fetchYouTubeVideos,
  parseYouTubeId,
  type YouTubeVideo,
  youTubeWatchUrl,
} from "@/lib/youtube";

/**
 * Unified playlist entry for YouTube embeds and Cloudinary native playback.
 */
export type PlaylistVideo = YouTubeVideo & {
  source: "youtube" | "cloudinary";
  /** Direct file URL when `source` is `cloudinary` */
  playbackUrl?: string;
};

/**
 * Stable id for a Cloudinary playlist row.
 *
 * @param item - Cloudinary videos-module item
 */
function cloudinaryPlaylistId(item: VideosModuleItem): string {
  const key = item.publicId || item.cloudinaryUrl || "video";
  return `cld-${key.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64)}`;
}

/**
 * Maps a Cloudinary CMS item to a playlist video (no network).
 *
 * @param item - Cloudinary videos-module item
 */
export function playlistVideoFromCloudinary(
  item: VideosModuleItem,
): PlaylistVideo | null {
  if (item.type !== "cloudinary" || !item.cloudinaryUrl?.trim()) return null;
  const playbackUrl = item.cloudinaryUrl.trim();
  return {
    id: cloudinaryPlaylistId(item),
    title: item.title?.trim() || "Campus video",
    channel: "Nirvana Yoga School",
    channelUrl: "https://www.nirvanayogaschoolindia.com",
    thumbnailUrl:
      item.thumbnailUrl?.trim() ||
      cloudinaryVideoPosterUrl(playbackUrl) ||
      playbackUrl,
    durationSeconds: item.durationSeconds ?? 0,
    source: "cloudinary",
    playbackUrl,
  };
}

/**
 * Builds a mixed YouTube + Cloudinary playlist from videos-module items.
 *
 * @param items - Normalized `page_modules.videos.items`
 */
export async function resolvePlaylistVideos(
  items: VideosModuleItem[],
): Promise<PlaylistVideo[]> {
  const playlist: PlaylistVideo[] = [];

  for (const item of items) {
    if (item.type === "youtube") {
      const id = parseYouTubeId(item.youtubeUrl ?? "");
      if (!id) continue;
      const [video] = await fetchYouTubeVideos([youTubeWatchUrl(id)]);
      if (!video) continue;
      playlist.push({
        ...video,
        title: item.title?.trim() || video.title,
        source: "youtube",
      });
      continue;
    }

    const cloudinaryVideo = playlistVideoFromCloudinary(item);
    if (cloudinaryVideo) playlist.push(cloudinaryVideo);
  }

  return playlist;
}

/**
 * Adapts legacy YouTube-only arrays for the shared player.
 *
 * @param videos - YouTube metadata rows
 */
export function asYouTubePlaylist(videos: YouTubeVideo[]): PlaylistVideo[] {
  return videos.map((video) => ({ ...video, source: "youtube" as const }));
}
