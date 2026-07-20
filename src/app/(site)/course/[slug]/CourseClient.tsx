"use client";

import { MapSection } from "@/components";
import {
  AccommodationFood,
  CourseBookingFab,
  CourseEligibility,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  DailySchedule,
  ExamCertification,
  InstagramFeed,
  PageHeroRenderer,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import {
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { CoursePageData } from "./types";

/**
 * Interactive course page composition.
 *
 * @param props - Course document, modules, media, and shared section content
 */
export default function CourseClient({
  course,
  media,
  videos,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
  siteMap,
  instagram,
  travel,
  examCertification,
}: CoursePageData) {
  const m = modules;
  const heroFee = m?.hero.type === "bento-media" ? m.hero.fee : course.fee;
  const overview = m?.overview;
  const glance = overview?.glance ?? [];
  const level = glance.find((g) => g.label === "Level")?.value ?? course.level;
  const duration =
    glance.find((g) => g.label === "Duration")?.value ?? course.duration;
  const certification =
    glance.find((g) => g.label === "Certification")?.value ??
    course.certification;
  const fee =
    glance.find((g) => g.label === "Program Fee")?.value ?? course.fee;

  const faqItems = m?.faqs.items ?? course.faqs;
  const showHero = isSectionLive(m?.hero);
  const showStickyNav = isSectionLive(m?.stickyNav);
  const showOverview = isSectionLive(m?.overview);
  const showInclusions = shouldRenderSection(
    m?.inclusions,
    (m?.inclusions.items ?? course.inclusions).length > 0,
  );
  const showEligibility = isSectionLive(m?.eligibility);
  const showSyllabus = shouldRenderSection(
    m?.syllabus,
    (m?.syllabus.chapters ?? course.syllabus).length > 0,
  );
  const showSchedule = shouldRenderSection(
    m?.schedule,
    (m?.schedule.items ?? course.schedule).length > 0,
  );
  const showPricing = shouldRenderSection(
    m?.pricing,
    (m?.pricing.options ?? course.pricing).length > 0,
  );
  const showFaqs = shouldRenderSection(m?.faqs, faqItems.length > 0);
  const showAccommodation = m?.flags.showAccommodation ?? true;
  const showWhyNirvana =
    (m?.flags.showWhyNirvana ?? true) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showMap =
    (m?.flags.showMap ?? true) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));
  const showTravel =
    (m?.flags.showTravel ?? true) &&
    shouldRenderSection(travel, Boolean(travel?.topics?.length));
  const showInstagram =
    (m?.flags.showInstagram ?? true) &&
    shouldRenderSection(instagram, Boolean(instagram?.media?.length));
  const showExam =
    (m?.flags.showExam ?? true) &&
    shouldRenderSection(
      examCertification,
      Boolean(
        examCertification?.steps.length &&
          examCertification.certificates.length,
      ),
    );

  return (
    <>
      {showHero ? (
        m ? (
          <PageHeroRenderer modules={m} />
        ) : (
          <PageHeroRenderer
            modules={{
              hero: {
                type: "bento-media",
                title: course.title,
                subtitle: course.subtitle,
                duration: course.duration,
                level: course.level,
                certification: course.certification,
                fee: course.fee,
                certBadge: course.certBadge,
                heroImages: course.heroImages,
                videos: media.videos,
              },
              stickyNav: { items: [] },
              overview: {
                eyebrow: "",
                title: "",
                lead: course.overview,
                glance: [],
                media: { mode: "image", items: [] },
              },
              inclusions: { items: course.inclusions },
              eligibility: { requirements: [] },
              syllabus: { description: "", chapters: [] },
              schedule: { description: "", items: [] },
              pricing: { description: "", options: [] },
              faqs: { items: [] },
              flags: {
                showExam: true,
                showAccommodation: true,
                showWhyNirvana: true,
                showTravel: true,
                showInstagram: true,
                showMap: true,
              },
            }}
          />
        )
      ) : null}

      {showStickyNav ? <CourseStickyNav items={m?.stickyNav.items} /> : null}

      <CourseBookingFab
        fee={heroFee ?? course.fee}
        title={course.title}
        href={`/booking?course=${encodeURIComponent(course.slug)}`}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        {showOverview ? (
          <CourseOverview
            htmlId={resolveSectionHtmlId("overview", m?.overview._id)}
            overview={overview?.lead ?? course.overview}
            level={level}
            duration={duration}
            certification={certification}
            fee={fee}
            videos={videos}
            eyebrow={overview?.eyebrow}
            title={overview?.title}
            supportingCopy={overview?.supportingCopy}
            featureImages={
              overview?.media.mode === "carousel"
                ? overview.media.items
                    .filter((item) => item.type === "image")
                    .map((item) => item.url)
                : undefined
            }
            overviewImages={
              overview?.media.mode === "carousel" ||
              overview?.media.mode === "image"
                ? overview.media.items
                    .filter((item) => item.type === "image")
                    .map((item) => ({
                      url: item.url,
                      alt: item.alt ?? item.title,
                      clickAction: item.clickAction,
                      redirectUrl: item.redirectUrl,
                    }))
                : undefined
            }
          />
        ) : null}

        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", m?.inclusions._id)}
            inclusions={m?.inclusions.items ?? course.inclusions}
            eyebrow={m?.inclusions.eyebrow}
            title={m?.inclusions.title}
            description={m?.inclusions.description}
          />
        ) : null}

        {showEligibility ? (
          <CourseEligibility
            htmlId={resolveSectionHtmlId("eligibility", m?.eligibility._id)}
            requirements={m?.eligibility.requirements}
            eyebrow={m?.eligibility.eyebrow}
            title={m?.eligibility.title}
            description={m?.eligibility.description}
            showAllianceBadge={m?.eligibility.showAllianceBadge}
          />
        ) : null}

        {showSyllabus ? (
          <CourseSyllabus
            htmlId={resolveSectionHtmlId("syllabus", m?.syllabus._id)}
            description={m?.syllabus.description ?? course.syllabusDescription}
            syllabus={m?.syllabus.chapters ?? course.syllabus}
          />
        ) : null}

        {showSchedule ? (
          <DailySchedule
            htmlId={resolveSectionHtmlId("schedule", m?.schedule._id)}
            description={m?.schedule.description ?? course.scheduleDescription}
            schedule={m?.schedule.items ?? course.schedule}
          />
        ) : null}

        {showExam && examCertification ? (
          <ExamCertification content={examCertification} />
        ) : null}

        {showAccommodation ? (
          <AccommodationFood content={residentialLife} />
        ) : null}

        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", m?.pricing._id)}
            duration={m?.pricing.duration ?? course.duration}
            pricing={m?.pricing.options ?? course.pricing}
            pricingDescription={
              m?.pricing.description ?? course.pricingDescription
            }
            batches={m?.pricing.batches}
            programSlug={course.slug}
            bookingType="course"
          />
        ) : null}

        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}

        {showTravel && travel ? <TravelGuide content={travel} /> : null}

        {showInstagram && instagram ? (
          <InstagramFeed content={instagram} />
        ) : null}

        {showMap && siteMap ? (
          <MapSection className="bg-white" content={siteMap} />
        ) : null}

        {showFaqs ? (
          <FAQSection
            id={resolveSectionHtmlId("faq", m?.faqs._id)}
            faqs={faqItems}
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
      </article>
    </>
  );
}
