import { CourseStickyNav } from "@/components/courses";
import { YttHubCoursesSection } from "@/components/home/ytt-hub";
import {
  OnlineHubBenefits,
  OnlineHubHeroSection,
  OnlineHubOverviewSection,
} from "@/components/online";
import { buildOnlineHubStickyNav } from "@/content/mappers/hub-sticky-nav";
import {
  mapOnlineHubToHomeHero,
  onlineHubHeroHasData,
} from "@/content/mappers/online-hub";
import { resolveOnlineHubCourses } from "@/content/mappers/resolve-online-hub-courses";
import type { PageMinimalHero, SitePageDocument } from "@/content/types";
import {
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
  const [data, courses] = await Promise.all([
    loadSitePageDataAsync(page),
    resolveOnlineHubCourses(),
  ]);

  const coursesIntro = DEFAULT_COURSES_INTRO;

  const modules = data.modules;
  const heroModule =
    modules?.hero?.type === "page-minimal"
      ? (modules.hero as PageMinimalHero)
      : null;
  const heroContent = heroModule ? mapOnlineHubToHomeHero(heroModule) : null;
  const showHero =
    heroModule && heroContent
      ? shouldRenderSection(heroModule, onlineHubHeroHasData(heroContent))
      : false;
  const showStickyNav = modules ? isSectionLive(modules.stickyNav) : false;
  const heroVideo = heroContent?.video ?? null;
  const showOverview = modules ? isSectionLive(modules.overview) : false;
  const showWhyOnline =
    modules?.whyOnline != null ? isSectionLive(modules.whyOnline) : true;
  const faqItems = modules?.faqs.items ?? data.mapped.faqs;
  const showFaqs = faqItems.length > 0;
  const stickyNavItems =
    modules && showStickyNav
      ? buildOnlineHubStickyNav(modules, {
          showOverview,
          showWhyOnline,
          showFaqs,
        })
      : [];

  return (
    <div className="ytt-hub-page bg-white">
      {showHero && heroModule && heroVideo ? (
        <>
          {heroVideo.mobilePoster || heroVideo.desktopPoster ? (
            <>
              {heroVideo.mobilePoster ? (
                <link
                  rel="preload"
                  as="image"
                  href={heroVideo.mobilePoster}
                  media="(max-width: 767px)"
                  fetchPriority="high"
                />
              ) : null}
              {heroVideo.desktopPoster ? (
                <link
                  rel="preload"
                  as="image"
                  href={heroVideo.desktopPoster}
                  media="(min-width: 768px)"
                  fetchPriority="high"
                />
              ) : null}
            </>
          ) : null}
          <OnlineHubHeroSection hero={heroModule} />
        </>
      ) : null}
      {showStickyNav && stickyNavItems.length > 0 ? (
        <CourseStickyNav items={stickyNavItems} />
      ) : null}
      <article className="max-w-full overflow-x-clip">
        {modules && isSectionLive(modules.overview) ? (
          <OnlineHubOverviewSection overview={modules.overview} />
        ) : null}
        {modules?.whyOnline && isSectionLive(modules.whyOnline) ? (
          <OnlineHubBenefits content={modules.whyOnline} />
        ) : !modules?.whyOnline ? (
          <OnlineHubBenefits />
        ) : null}
        <YttHubCoursesSection
          coursesIntro={coursesIntro}
          courses={courses}
          htmlId={resolveSectionHtmlId("courses")}
        />
        <SiteFaq mapped={data.mapped} modules={data.modules} />
      </article>
    </div>
  );
}
