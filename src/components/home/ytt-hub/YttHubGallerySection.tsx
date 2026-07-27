import { GallerySection } from "@/components/home";
import type { HomeGallerySectionContent } from "@/content/types/dedicated-pages";

type YttHubGallerySectionProps = {
  /** Homepage gallery CMS document (hub reuses home gallery). */
  content: HomeGallerySectionContent;
};

/**
 * Hub wrapper around the shared gallery band — spacing/rhythm via `ytt-hub-page.css`.
 *
 * @param props - Home gallery section content
 */
export default function YttHubGallerySection({
  content,
}: YttHubGallerySectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-gallery">
      <GallerySection content={content} />
    </div>
  );
}
