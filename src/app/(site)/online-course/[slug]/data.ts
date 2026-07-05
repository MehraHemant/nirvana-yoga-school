import { getCourseMedia } from "@/content";
import type { OnlineCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { OnlinePageData } from "./types";

export const ONLINE_BATCHES = [
  {
    dates: "Start anytime",
    spaces: "Lifetime access · self-paced",
    status: "Open",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    tone: "open" as const,
  },
];

export async function loadOnlinePageData(
  slug: string,
  course: OnlineCourseDocument,
): Promise<OnlinePageData> {
  const media = await getCourseMedia(slug);
  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return { course, media, videos };
}
