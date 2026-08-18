import { ExamCertification } from "@/components/courses";
import { MapSection } from "@/components/home";
import {
  YttHubCoursesSection,
  YttHubGallerySection,
  YttHubHeroSection,
  YttHubOverviewSection,
  YttHubTeachersSection,
  YttHubTestimonialsSection,
  YttHubVideoSection,
  YttHubWhyRishikeshSection,
} from "@/components/home/ytt-hub";
import { FAQSection } from "@/components/ui";
import { resolveYttHubCourses } from "@/content/mappers/resolve-ytt-hub-courses";
import { getHomePageContent } from "@/content/repositories/dedicated-pages";
import {
  getExamCertification,
  getReviews,
  getSiteMap,
  getYttHub,
} from "@/content/repositories/shared-sections";
import { getTeachersPage } from "@/content/repositories/teachers";
import { shouldRenderHomeSection } from "@/lib/cms/home-section-visibility";
import {
  hasExamCertificationContent,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { resolveSectionHtmlId } from "@/lib/html-id";
import "@/components/home/ytt-hub/ytt-hub-page.css";

/**
 * YTT hub page — homepage-styled hero/overview/gallery plus hub CMS bands.
 * Public section order: Hero → Overview → Video → Gallery → Why Rishikesh →
 * Courses → Certification → Teachers → Reviews → Map → FAQ.
 * Sticky nav is not rendered on this page.
 * Section HTML ids come from `hub.sectionIds` when set.
 * Videos/gallery/Why Rishikesh/reviews reuse homepage CMS (`pages.home`).
 * Certification reuses shared exam content (`global_settings.examCertification`).
 * Course cards resolve from course entities via `hub.courses` refs.
 * Visibility for shared/optional bands uses existing `hub.flags`.
 */
export default async function YttHubPage() {
  const [
    teachersPageResult,
    hubResult,
    homeResult,
    reviewsResult,
    siteMapResult,
    examResult,
  ] = await Promise.all([
    getTeachersPage(),
    getYttHub(),
    getHomePageContent().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getExamCertification().catch(() => null),
  ]);
  const hub = hubResult.data;
  const home = homeResult?.data ?? createEmptyHomePageContent();
  const flags = hub.flags ?? {};
  const sectionIds = hub.sectionIds;
  const teachers = teachersPageResult.data?.teachers ?? [];
  const reviews = reviewsResult?.data ?? null;
  const siteMap = siteMapResult?.data ?? null;
  const examCertification = examResult?.data ?? null;
  const courses = await resolveYttHubCourses(hub.courses);

  const showVideos =
    flags.showVideos !== false && shouldRenderHomeSection("video", home);
  const showGallery =
    flags.showGallery !== false && shouldRenderHomeSection("gallery", home);
  const showWhyRishikesh =
    flags.showWhyRishikesh !== false &&
    shouldRenderHomeSection("whyRishikesh", home);
  const showEligibility =
    flags.showEligibility !== false &&
    shouldRenderSection(
      examCertification,
      hasExamCertificationContent(examCertification),
    );
  const showTeachers = flags.showTeachers !== false && teachers.length > 0;
  const showReviews =
    flags.showReviews !== false &&
    (shouldRenderHomeSection("testimonials", home) ||
      Boolean(reviews?.reviews?.length));
  const showMap =
    flags.showMap !== false &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));
  const heroVideo = hub.heroVideo;
  const reviewContent = {
    _id: home.testimonials._id,
    eyebrow: home.testimonials.eyebrow,
    title: home.testimonials.title,
    description: home.testimonials.description,
  };
  const reviewRows =
    home.testimonials.reviews?.length > 0
      ? { reviews: home.testimonials.reviews }
      : reviews;

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
      <YttHubOverviewSection hub={hub} />
      {showVideos ? <YttHubVideoSection content={home.video} /> : null}
      {showGallery ? <YttHubGallerySection content={home.gallery} /> : null}
      {showWhyRishikesh ? (
        <YttHubWhyRishikeshSection
          content={home.whyRishikesh}
          sectionId={sectionIds?.whyRishikesh}
        />
      ) : null}
      <YttHubCoursesSection
        coursesIntro={hub.coursesIntro}
        courses={courses}
        htmlId={resolveSectionHtmlId("courses", sectionIds?.courses)}
      />
      {showEligibility && examCertification ? (
        <div className="ytt-hub-shared ytt-hub-exam">
          <ExamCertification content={examCertification} />
        </div>
      ) : null}
      {showTeachers ? <YttHubTeachersSection teachers={teachers} /> : null}
      {showReviews ? (
        <YttHubTestimonialsSection
          reviews={reviewRows}
          content={reviewContent}
        />
      ) : null}
      {showMap && siteMap ? (
        <div className="ytt-hub-shared ytt-hub-map">
          <MapSection className="bg-white" content={siteMap} />
        </div>
      ) : null}
      {hub.faqs.length > 0 ? (
        <FAQSection
          id={resolveSectionHtmlId("faq", sectionIds?.faq)}
          faqs={hub.faqs}
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
