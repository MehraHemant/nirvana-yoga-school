import type { HomeVideoSectionContent } from "@/content/types/dedicated-pages";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { fetchYouTubeVideos } from "@/lib/youtube";
import VideoSectionPlayer from "./VideoSectionPlayer";

type VideoSectionProps = {
  /** Full CMS video section (header + YouTube URLs) */
  content?: HomeVideoSectionContent;
};

/**
 * Homepage video section — fetches YouTube metadata then renders the player.
 *
 * @param props - Optional CMS video section content
 */
export default async function VideoSection({
  content = createEmptyHomePageContent().video,
}: VideoSectionProps) {
  const urls =
    content.youtubeUrls?.length > 0
      ? content.youtubeUrls
      : createEmptyHomePageContent().video.youtubeUrls;
  const videos = await fetchYouTubeVideos(urls);

  return (
    <VideoSectionPlayer
      videos={videos}
      sectionId={content._id}
      header={{
        eyebrow: content.eyebrow,
        title: content.title,
        description: content.description,
      }}
    />
  );
}
