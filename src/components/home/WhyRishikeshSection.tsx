import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeWhyRishikeshContent } from "@/content/types/dedicated-pages";
import { resolveSectionHtmlId } from "@/lib/html-id";
import {
  fetchYouTubeDuration,
  fetchYouTubeOEmbed,
  parseYouTubeId,
  youTubeWatchUrl,
} from "@/lib/youtube";
import WhyRishikeshClient from "./WhyRishikeshClient";

type WhyRishikeshSectionProps = {
  /** Full CMS Why Rishikesh section */
  content?: HomeWhyRishikeshContent;
  /** Optional public HTML id override (e.g. YTT hub `sectionIds.whyRishikesh`) */
  sectionId?: string;
};

/**
 * Homepage Why Rishikesh band — loads YouTube metadata then renders the client UI.
 *
 * @param props - Optional CMS Why Rishikesh content
 */
export default async function WhyRishikeshSection({
  content = DEFAULT_HOME_PAGE_CONTENT.whyRishikesh,
  sectionId,
}: WhyRishikeshSectionProps) {
  const youtubeUrl =
    content.youtubeUrl || DEFAULT_HOME_PAGE_CONTENT.whyRishikesh.youtubeUrl;
  const videoId = parseYouTubeId(youtubeUrl);
  if (!videoId) return null;

  const watchUrl = youTubeWatchUrl(videoId);
  const [oembed, durationSeconds] = await Promise.all([
    fetchYouTubeOEmbed(watchUrl),
    fetchYouTubeDuration(videoId),
  ]);

  return (
    <section
      id={resolveSectionHtmlId("why-rishikesh", sectionId ?? content._id)}
      className="relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
    >
      <WhyRishikeshClient
        content={content}
        videoId={videoId}
        videoTitle={oembed.title}
        thumbnailUrl={oembed.thumbnail_url}
        durationSeconds={durationSeconds}
      />
    </section>
  );
}
