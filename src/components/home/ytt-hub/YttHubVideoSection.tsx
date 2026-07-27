import { VideoSection } from "@/components/home";
import type { HomeVideoSectionContent } from "@/content/types/dedicated-pages";

type YttHubVideoSectionProps = {
  /** Homepage video CMS document (hub reuses home videos). */
  content: HomeVideoSectionContent;
};

/**
 * Hub wrapper around the shared video band — spacing/rhythm via `ytt-hub-page.css`.
 *
 * @param props - Home video section content
 */
export default function YttHubVideoSection({
  content,
}: YttHubVideoSectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-video">
      <VideoSection content={content} />
    </div>
  );
}
