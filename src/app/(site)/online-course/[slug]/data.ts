import { getCourseMedia } from "@/content";
import onlineCourseMeta from "@/content/data/online-courses/meta.json";
import type { OnlineCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { OnlineCoursePageData } from "./types";

type OnlineMeta = Record<string, { video: string | null }>;

const META = onlineCourseMeta as OnlineMeta;

export async function loadOnlineCoursePageData(
  slug: string,
  course: OnlineCourseDocument,
): Promise<OnlineCoursePageData> {
  const media = await getCourseMedia(slug);
  const previewId = META[slug]?.video ?? null;
  const videoIds = previewId
    ? [previewId, ...media.videos.filter((id) => id !== previewId)]
    : media.videos;

  const videos = await fetchYouTubeVideos(
    videoIds.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return {
    course,
    media: { images: media.images, videos: videoIds },
    videos,
  };
}
