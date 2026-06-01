import { YOUTUBE_VIDEO_URLS } from "@/constants/videos";
import { fetchYouTubeVideos } from "@/lib/youtube";
import VideoSectionPlayer from "./VideoSectionPlayer";

export default async function VideoSection() {
  const videos = await fetchYouTubeVideos(YOUTUBE_VIDEO_URLS);

  return <VideoSectionPlayer videos={videos} />;
}
