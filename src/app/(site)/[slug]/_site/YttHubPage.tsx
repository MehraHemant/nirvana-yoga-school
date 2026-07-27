import { ExamCertification, WhyNirvana } from "@/components/courses";
import { MapSection } from "@/components/home";
import {
  YttHubCoursesSection,
  YttHubGallerySection,
  YttHubHeroSection,
  YttHubOverviewSection,
  YttHubTeachersSection,
  YttHubVideoSection,
} from "@/components/home/ytt-hub";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import { resolveYttHubCourses } from "@/content/mappers/resolve-ytt-hub-courses";
import { resolveYttHubNav } from "@/content/mappers/ytt-hub";
import { getHomePageContent } from "@/content/repositories/dedicated-pages";
import {
  getExamCertification,
  getReviews,
  getSiteMap,
  getWhyNirvana,
  getYttHub,
} from "@/content/repositories/shared-sections";
import { getTeachersPage } from "@/content/repositories/teachers";
import { shouldRenderHomeSection } from "@/lib/cms/home-section-visibility";
import {
  hasExamCertificationContent,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId, resolveSectionHtmlId } from "@/lib/html-id";
import YttHubStickyNav from "./YttHubStickyNav";
import "@/components/home/ytt-hub/ytt-hub-page.css";

/**
 * YTT hub page — homepage-styled hero/overview/gallery plus shared course bands.
 * Section HTML ids come from `hub.sectionIds` when set.
 * Videos/gallery reuse homepage CMS (`pages.home` contentData).
 * Course cards resolve from course entities via `hub.courses` refs.
 */
export default async function YttHubPage() {
  const [
    teachersPageResult,
    hubResult,
    homeResult,
    examResult,
    whyNirvanaResult,
    reviewsResult,
    siteMapResult,
  ] = await Promise.all([
    getTeachersPage(),
    getYttHub(),
    getHomePageContent().catch(() => null),
    getExamCertification().catch(() => null),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
  ]);
  const hub = hubResult.data;
  const home = homeResult?.data ?? createEmptyHomePageContent();
  const flags = hub.flags ?? {};
  const sectionIds = hub.sectionIds;
  const stickyNavHtmlId = optionalSectionHtmlId(sectionIds?.stickyNav);
  const teachers = teachersPageResult.data?.teachers ?? [];
  const examCertification = examResult?.data ?? null;
  const whyNirvana = whyNirvanaResult?.data ?? null;
  const reviews = reviewsResult?.data ?? null;
  const siteMap = siteMapResult?.data ?? null;
  const nav = resolveYttHubNav(hub.nav);
  const courses = await resolveYttHubCourses(hub.courses);

  const showVideos =
    flags.showVideos !== false && shouldRenderHomeSection("video", home);
  const showGallery =
    flags.showGallery !== false && shouldRenderHomeSection("gallery", home);
  const showExam =
    flags.showExam !== false &&
    shouldRenderSection(
      examCertification,
      hasExamCertificationContent(examCertification),
    );
  const showWhyNirvana =
    flags.showWhyNirvana !== false &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showTeachers = flags.showTeachers !== false && teachers.length > 0;
  const showMap =
    flags.showMap !== false &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));
  const heroVideo = hub.heroVideo;

  return (
    <div className="ytt-hub-page bg-white">
      {heroVideo?.mobilePoster || hub.heroImage ? (
        <>
          <link
            rel="preload"
            as="image"
            href={heroVideo?.mobilePoster?.trim() || hub.heroImage}
            media="(max-width: 767px)"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="image"
            href={heroVideo?.desktopPoster?.trim() || hub.heroImage}
            media="(min-width: 768px)"
            fetchPriority="high"
          />
        </>
      ) : null}

      <YttHubHeroSection hub={hub} />
      <YttHubStickyNav nav={nav} htmlId={stickyNavHtmlId} />
      <YttHubOverviewSection hub={hub} />
      {showVideos ? <YttHubVideoSection content={home.video} /> : null}
      {showGallery ? <YttHubGallerySection content={home.gallery} /> : null}
      {showExam && examCertification ? (
        <div className="ytt-hub-shared ytt-hub-exam">
          <ExamCertification content={examCertification} />
        </div>
      ) : null}
      <YttHubCoursesSection
        coursesIntro={hub.coursesIntro}
        courses={courses}
        htmlId={resolveSectionHtmlId("courses", sectionIds?.courses)}
      />
      {showWhyNirvana ? (
        <div className="ytt-hub-shared ytt-hub-why-nirvana">
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        </div>
      ) : null}
      {showTeachers ? <YttHubTeachersSection teachers={teachers} /> : null}
      {showMap && siteMap ? (
        <div className="ytt-hub-shared ytt-hub-map">
          <MapSection className="bg-white" content={siteMap} />
        </div>
      ) : null}
      {hub.faqs.length > 0 ? (
        <FAQSection
          id={resolveSectionHtmlId("faq", sectionIds?.faq)}
          faqs={hub.faqs}
          categories={COURSE_FAQ_CATEGORIES}
          sectionClassName="bg-white"
          eyebrow="Got Questions?"
          title={
            <>
              Course <span className="text-primary">FAQs</span>
            </>
          }
        />
      ) : null}
    </div>
  );
}
