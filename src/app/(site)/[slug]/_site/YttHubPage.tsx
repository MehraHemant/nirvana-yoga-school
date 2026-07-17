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
import { getYttHub } from "@/content/repositories/shared-sections";
import { getTeachers } from "@/content/repositories/teachers";
import {
  optionalSectionHtmlId,
  resolveSectionHtmlId,
} from "@/lib/html-id";
import YttHubStickyNav from "./YttHubStickyNav";

/**
 * YTT hub page — teachers + hub copy load from MySQL.
 * Section HTML ids come from `hub.sectionIds` when set.
 */
export default async function YttHubPage() {
  const [teachers, hubResult] = await Promise.all([
    getTeachers(),
    getYttHub(),
  ]);
  const hub = hubResult.data;
  const sectionIds = hub.sectionIds;
  const stickyNavHtmlId = optionalSectionHtmlId(sectionIds?.stickyNav);

  return (
    <div className="ytt-hub-page bg-white">
      <YttHubHeroSection
        heroImage={hub.heroImage}
        intro={hub.intro}
        htmlId={sectionIds?.hero}
      />
      {stickyNavHtmlId ? (
        <div id={stickyNavHtmlId}>
          <YttHubStickyNav nav={hub.nav} />
        </div>
      ) : (
        <YttHubStickyNav nav={hub.nav} />
      )}
      <YttHubOverviewSection
        intro={hub.intro}
        overviewImage={hub.overviewImage}
        overviewInsetImage={hub.overviewInsetImage}
        htmlId={resolveSectionHtmlId("about", sectionIds?.overview)}
      />
      <VideoSection />
      <GallerySection />
      <WhyRishikeshSection sectionId={sectionIds?.whyRishikesh} />
      <YttHubCoursesSection
        coursesIntro={hub.coursesIntro}
        courses={hub.courses}
        htmlId={resolveSectionHtmlId("courses", sectionIds?.courses)}
      />
      <YttHubEligibilitySection
        eligibility={hub.eligibility}
        htmlId={resolveSectionHtmlId("certification", sectionIds?.eligibility)}
      />
      <TeachersSection teachers={teachers} />
      <TestimonialsSection />
      <FAQSection
        id={resolveSectionHtmlId("faq", sectionIds?.faq)}
        faqs={hub.faqs}
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
