import { TestimonialsSection } from "@/components/home";
import type { HomeReviewsSectionContent } from "@/content/types/dedicated-pages";
import type { ReviewsContent } from "@/content/types/shared-sections";

type YttHubTestimonialsSectionProps = {
  /** Shared / homepage review rows */
  reviews?: ReviewsContent | null;
  /** Homepage testimonials header (+ optional `_id` override) */
  content?: Pick<
    HomeReviewsSectionContent,
    "_id" | "eyebrow" | "title" | "description"
  >;
};

/**
 * Hub wrapper around the shared testimonials / review band.
 *
 * @param props - Review rows and optional homepage header copy
 */
export default function YttHubTestimonialsSection({
  reviews,
  content,
}: YttHubTestimonialsSectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-testimonials">
      <TestimonialsSection reviews={reviews} content={content} />
    </div>
  );
}
