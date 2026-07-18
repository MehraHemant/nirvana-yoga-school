"use client";

import { CourseStickyNav, PageHeroRenderer } from "@/components/courses";
import {
  OnlineCurriculumSection,
  OnlineFAQSection,
  OnlineInclusionsSection,
  OnlineOverviewSection,
  OnlinePricingCard,
  OnlineTeachersSection,
  OnlineTestimonialsSection,
  OnlineTrustBar,
} from "@/components/online";
import { Container } from "@/components/ui";
import {
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { OnlineCoursePageData } from "./types";

export default function OnlineCourseClient({
  course,
  media,
  modules,
}: OnlineCoursePageData) {
  const overview = modules?.overview;
  const inclusions = modules?.inclusions;
  const syllabus = modules?.syllabus;
  const pricingModule = modules?.pricing;
  const faqs = modules?.faqs;
  const pricing = pricingModule?.options[0] ?? course.pricing[0];
  const previewVideoId = media.videos[0];
  const showHero = isSectionLive(modules?.hero);
  const showStickyNav = isSectionLive(modules?.stickyNav);
  const showOverview = isSectionLive(overview);
  const showInclusions = shouldRenderSection(
    inclusions,
    (inclusions?.items ?? course.inclusions).length > 0,
  );
  const showSyllabus = shouldRenderSection(
    syllabus,
    (syllabus?.chapters ?? course.syllabus).length > 0,
  );
  const showPricing = shouldRenderSection(
    pricingModule,
    (pricingModule?.options ?? course.pricing).length > 0,
  );
  const showFaqs = shouldRenderSection(
    faqs,
    (faqs?.items ?? course.faqs).length > 0,
  );

  const pricingCard =
    showPricing && pricing ? (
      <OnlinePricingCard
        pricing={pricing}
        pricingDescription={
          pricingModule?.description ?? course.pricingDescription
        }
        certification={course.certification}
        level={course.level}
        ctaPrimary={course.ctaPrimary}
        ctaPrimaryHref={course.ctaPrimaryHref}
        ctaSecondary={course.ctaSecondary}
        ctaSecondaryHref={course.ctaSecondaryHref}
      />
    ) : null;

  return (
    <div className="online-course-theme bg-white">
      {showHero && modules ? (
        <PageHeroRenderer modules={modules} />
      ) : !modules ? (
        <PageHeroRenderer
          modules={{
            hero: {
              type: "split-copy",
              title: course.title,
              subtitle: course.subtitle,
              metaItems: [
                { label: "Duration", value: course.duration },
                { label: "Level", value: course.level },
                { label: "Certification", value: course.certification },
                { label: "Fee", value: course.fee },
              ],
              ctaPrimary: course.ctaPrimary,
              ctaPrimaryHref: course.ctaPrimaryHref,
              ctaSecondary: course.ctaSecondary,
              ctaSecondaryHref: course.ctaSecondaryHref,
              previewType: previewVideoId ? "video" : "image",
              previewUrl: previewVideoId ?? course.image,
            },
            stickyNav: { items: course.navItems },
            overview: {
              eyebrow: "",
              title: "",
              lead: course.overview,
              glance: [],
              media: { mode: "image", items: [] },
            },
            inclusions: { items: course.inclusions },
            eligibility: { requirements: [] },
            syllabus: { description: "", chapters: course.syllabus },
            schedule: { description: "", items: [] },
            pricing: { description: "", options: course.pricing },
            faqs: { items: course.faqs },
            flags: {
              showExam: false,
              showAccommodation: false,
              showWhyNirvana: false,
              showTravel: false,
              showInstagram: false,
              showMap: false,
            },
          }}
        />
      ) : null}

      <OnlineTrustBar />

      {showStickyNav ? (
        <CourseStickyNav
          items={modules?.stickyNav.items ?? course.navItems}
          variant="online"
        />
      ) : null}

      <Container size="2xl">
        <div className="online-course-layout">
          <main className="online-course-main min-w-0">
            {showOverview ? (
              <OnlineOverviewSection
                id={resolveSectionHtmlId("overview", overview?._id)}
                title={overview?.title}
                description={overview?.supportingCopy}
                overview={overview?.lead ?? course.overview}
              />
            ) : null}
            {showInclusions ? (
              <OnlineInclusionsSection
                id={resolveSectionHtmlId("inclusions", inclusions?._id)}
                title={inclusions?.title}
                description={inclusions?.description}
                inclusions={inclusions?.items ?? course.inclusions}
              />
            ) : null}

            {pricingCard && (
              <div className="border-b border-secondary/10 py-8 lg:hidden">
                {pricingCard}
              </div>
            )}

            {showSyllabus ? (
              <OnlineCurriculumSection
                id={resolveSectionHtmlId("syllabus", syllabus?._id)}
                description={
                  syllabus?.description ?? course.syllabusDescription
                }
                syllabus={syllabus?.chapters ?? course.syllabus}
              />
            ) : null}

            <OnlineTeachersSection teachers={course.teachers} />

            <OnlineTestimonialsSection testimonials={course.testimonials} />

            {showFaqs ? (
              <OnlineFAQSection
                id={resolveSectionHtmlId("faq", faqs?._id)}
                faqs={faqs?.items ?? course.faqs}
              />
            ) : null}
          </main>

          {pricingCard && (
            <aside className="online-course-sidebar hidden lg:block">
              {pricingCard}
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
}
