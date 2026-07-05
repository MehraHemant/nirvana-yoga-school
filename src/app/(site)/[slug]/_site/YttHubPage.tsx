import {
  GallerySection,
  TeachersSection,
  TestimonialsSection,
  VideoSection,
  WhyRishikeshSection,
} from "@/components/home";
import {
  YttHubCoursesSection,
  YttHubEligibilitySection,
  YttHubHeroSection,
  YttHubOverviewSection,
} from "@/components/home/ytt-hub";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import { YTT_HUB_FAQS } from "@/data/yttHubPage";
import YttHubStickyNav from "./YttHubStickyNav";

export default async function YttHubPage() {
  return (
    <div className="ytt-hub-page bg-white">
      <YttHubHeroSection />
      <YttHubStickyNav />
      <YttHubOverviewSection />
      <VideoSection />
      <GallerySection />
      <WhyRishikeshSection />
      <YttHubCoursesSection />
      <YttHubEligibilitySection />
      <TeachersSection />
      <TestimonialsSection />
      <FAQSection
        id="faq"
        faqs={YTT_HUB_FAQS}
        categories={COURSE_FAQ_CATEGORIES}
        sectionClassName="bg-paper"
        eyebrow="Got Questions?"
        title={
          <>
            Course <span className="text-primary">FAQs</span>
          </>
        }
      />
    </div>
  );
}
