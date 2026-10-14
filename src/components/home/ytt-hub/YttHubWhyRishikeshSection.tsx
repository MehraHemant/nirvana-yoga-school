import WhyRishikeshSection from "@/components/home/WhyRishikeshSection";
import type { HomeWhyRishikeshContent } from "@/content/types/dedicated-pages";

type YttHubWhyRishikeshSectionProps = {
  /** Homepage Why Rishikesh CMS document (hub reuses home content). */
  content: HomeWhyRishikeshContent;
  /** Optional public HTML id override from `hub.sectionIds.whyRishikesh` */
  sectionId?: string;
};

/**
 * Hub wrapper around the homepage Why Rishikesh band.
 *
 * @param props - Home Why Rishikesh content and optional section id
 */
export default function YttHubWhyRishikeshSection({
  content,
  sectionId,
}: YttHubWhyRishikeshSectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-why-rishikesh">
      <WhyRishikeshSection content={content} sectionId={sectionId} />
    </div>
  );
}
