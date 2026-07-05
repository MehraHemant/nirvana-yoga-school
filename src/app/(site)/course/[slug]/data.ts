import { getCourseMedia } from "@/content";
import type { ResidentialCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { ResidentialPageData } from "./types";

export async function loadResidentialPageData(
  slug: string,
  course: ResidentialCourseDocument,
): Promise<ResidentialPageData> {
  const media = await getCourseMedia(slug);
  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return { course, media, videos };
}
