import { TestimonialsSection } from "@/components/home";

/**
 * Hub wrapper around the shared testimonials band — quieter surface, hub spacing.
 */
export default function YttHubTestimonialsSection() {
  return (
    <div className="ytt-hub-shared ytt-hub-testimonials">
      <TestimonialsSection />
    </div>
  );
}
