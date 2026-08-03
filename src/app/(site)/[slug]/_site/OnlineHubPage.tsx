import { ExamCertification, CourseStickyNav } from "@/components/courses";
import { YttHubCoursesSection } from "@/components/home/ytt-hub";
import {
  OnlineHubBenefits,
  OnlineHubCtaSection,
  OnlineHubHeroSection,
  OnlineHubOverviewSection,
} from "@/components/online";
import { resolveOnlineHubHeroVideo } from "@/content/mappers/online-hub";
import { resolveOnlineHubCourses } from "@/content/mappers/resolve-online-hub-courses";
import { getSiteConfig } from "@/content/repositories/global-settings";
import { getExamCertification } from "@/content/repositories/shared-sections";
import type { PageMinimalHero, SitePageDocument } from "@/content/types";
import {
  hasExamCertificationContent,
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { loadSitePageDataAsync } from "../../_shared/site/data.server";
import { SiteFaq } from "../../_shared/site/shared";
import "@/components/home/ytt-hub/ytt-hub-page.css";

const DEFAULT_COURSES_INTRO = {
  eyebrow: "Online programs",
  title: "Online yoga teacher training courses",
  paragraphs: [
    "Choose a self-paced Yoga Alliance program — from 10-hour specialty courses to full 200-hour teacher trainings — with lifetime access and weekly live Q&A.",
  ],
};

type OnlineHubPageProps = {
  /** Published CMS site page for this hub */
  page: SitePageDocument;
};

/**
 * Online courses hub — homepage-styled hero plus CMS overview/FAQ and courses.
 *
 * @param props - Site page document already loaded by the route
 */
export default async function OnlineHubPage({ page }: OnlineHubPageProps) {
  const [data, courses, examResult, siteConfigResult] = await Promise.all([
    loadSitePageDataAsync(page),
    resolveOnlineHubCourses(),
    getExamCertification().catch(() => null),
    getSiteConfig().catch(() => null),
  ]);

  const examCertification = examResult?.data ?? null;
  const showExam =
    (data.modules?.flags.showExam ?? true) &&
    shouldRenderSection(
      examCertification,
      hasExamCertificationContent(examCertification),
    );

  const coursesIntro = DEFAULT_COURSES_INTRO;

  const whatsappNumber =
    siteConfigResult?.data?.whatsappNumber?.replace(/\D/g, "") || undefined;
  // Keep closing-band enquire separate from the hero CTA (often “Browse courses”).
  const enquireHref =
    page.ctaHref?.trim() ||
    data.mapped.ctaPrimaryHref?.trim() ||
    "/enquire-now";

  const modules = data.modules;
  const heroModule =
    modules?.hero?.type === "page-minimal"
      ? (modules.hero as PageMinimalHero)
      : null;
  const showHero = heroModule ? isSectionLive(heroModule) : false;
  const showStickyNav = modules ? isSectionLive(modules.stickyNav) : false;
  const heroVideo = heroModule ? resolveOnlineHubHeroVideo(heroModule) : null;
  // Welcome-style overview uses `#about` (same as YTT hub); rewrite legacy anchors.
  const stickyNavItems =
    modules?.stickyNav.items.map((item) =>
      item.id === "#overview" ? { ...item, id: "#about" as const } : item,
    ) ?? [];

  return (
    <div className="ytt-hub-page bg-white">
      {showHero && heroModule && heroVideo ? (
        <>
          {heroVideo.mobilePoster || heroModule.heroImage ? (
            <>
              <link
                rel="preload"
                as="image"
                href={heroVideo.mobilePoster || heroModule.heroImage}
                media="(max-width: 767px)"
                fetchPriority="high"
              />
              <link
                rel="preload"
                as="image"
                href={heroVideo.desktopPoster || heroModule.heroImage}
                media="(min-width: 768px)"
                fetchPriority="high"
              />
            </>
          ) : null}
          <OnlineHubHeroSection hero={heroModule} />
        </>
      ) : null}
      {showStickyNav && stickyNavItems.length > 0 ? (
        <CourseStickyNav items={stickyNavItems} />
      ) : null}
      <article className="min-h-screen max-w-full overflow-x-clip">
        {modules && isSectionLive(modules.overview) ? (
          <OnlineHubOverviewSection overview={modules.overview} />
        ) : null}
        <OnlineHubBenefits htmlId="why-online" />
        <YttHubCoursesSection
          coursesIntro={coursesIntro}
          courses={courses}
          htmlId={resolveSectionHtmlId("courses")}
        />
        {showExam && examCertification ? (
          <div className="ytt-hub-shared ytt-hub-exam">
            <ExamCertification content={examCertification} />
          </div>
        ) : null}
        <SiteFaq mapped={data.mapped} modules={data.modules} />
        <OnlineHubCtaSection
          whatsappNumber={whatsappNumber}
          enquireHref={enquireHref}
        />
      </article>
    </div>
  );
}
