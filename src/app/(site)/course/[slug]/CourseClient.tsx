"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  CourseBookingFab,
  CourseOverview,
  CourseStickyNav,
  PageHeroRenderer,
} from "@/components/courses";
import {
  bookingReserveHref,
  getBatchDates,
} from "@/components/courses/upcomingDatesShared";
import { publicPricingOptionsWithFees } from "@/content/mappers/page-room-fees";
import {
  hasExamCertificationContent,
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { CoursePageData } from "./types";

/**
 * Lightweight placeholder so layout doesn’t jump while a section chunk loads.
 *
 * @param props - Optional min-height utility class
 */
function SectionSkeleton({
  minHeight = "min-h-[40vh]",
}: {
  minHeight?: string;
}) {
  return <div className={`w-full ${minHeight}`} aria-hidden="true" />;
}

const WhatIsIncluded = dynamic(
  () => import("@/components/courses/WhatIsIncluded"),
  { loading: () => <SectionSkeleton /> },
);
const CourseEligibility = dynamic(
  () => import("@/components/courses/CourseEligibility"),
  { loading: () => <SectionSkeleton minHeight="min-h-[30vh]" /> },
);
const CourseSyllabus = dynamic(
  () => import("@/components/courses/CourseSyllabus"),
  { loading: () => <SectionSkeleton /> },
);
const DailySchedule = dynamic(
  () => import("@/components/courses/DailySchedule"),
  { loading: () => <SectionSkeleton minHeight="min-h-[30vh]" /> },
);
const ExamCertification = dynamic(
  () => import("@/components/courses/ExamCertification"),
  { loading: () => <SectionSkeleton minHeight="min-h-[30vh]" /> },
);
const AccommodationFood = dynamic(
  () => import("@/components/courses/AccommodationFood"),
  { loading: () => <SectionSkeleton /> },
);
const UpcomingDates = dynamic(
  () => import("@/components/courses/UpcomingDates"),
  { loading: () => <SectionSkeleton /> },
);
const WhyNirvana = dynamic(() => import("@/components/courses/WhyNirvana"), {
  loading: () => <SectionSkeleton />,
});
const TravelGuide = dynamic(() => import("@/components/courses/TravelGuide"), {
  loading: () => <SectionSkeleton minHeight="min-h-[30vh]" />,
});
const InstagramFeed = dynamic(
  () => import("@/components/courses/InstagramFeed"),
  { loading: () => <SectionSkeleton minHeight="min-h-[30vh]" /> },
);
const MapSection = dynamic(() => import("@/components/home/MapSection"), {
  loading: () => <SectionSkeleton minHeight="min-h-[50vh]" />,
});
const FAQSection = dynamic(() => import("@/components/ui/FAQSection"), {
  loading: () => <SectionSkeleton minHeight="min-h-[30vh]" />,
});

/**
 * Interactive course page composition.
 * Hero + sticky nav stay in the critical path; below-fold sections are code-split.
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

  const faqItems =
    (m?.faqs?.items?.length ?? 0) > 0 ? (m?.faqs.items ?? []) : course.faqs;
  const publicPricing = publicPricingOptionsWithFees(
    m?.pricing.options ?? course.pricing,
  );
  const pricingDuration = m?.pricing.duration ?? course.duration;
  const pricingBatches = useMemo(
    () =>
      m?.pricing.batches?.length
        ? m.pricing.batches
        : getBatchDates(pricingDuration),
    [m?.pricing.batches, pricingDuration],
  );
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(
    () => pricingBatches[0]?.dates ?? "",
  );
  const selectedRoom = publicPricing.find(
    (option) => option.roomType === selectedRoomType,
  );
  const bookingReady = Boolean(selectedRoomType && selectedBatch);
  const bookingHref = bookingReady
    ? bookingReserveHref("course", course.slug, selectedRoomType, selectedBatch)
    : `#${resolveSectionHtmlId("pricing", m?.pricing._id)}`;
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
  const showPricing = shouldRenderSection(m?.pricing, publicPricing.length > 0);
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
      hasExamCertificationContent(examCertification),
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
        href={bookingHref}
        selectedPrice={selectedRoom?.price}
        selectedDate={selectedBatch}
        ready={bookingReady}
        pricingAnchor={`#${resolveSectionHtmlId("pricing", m?.pricing._id)}`}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        {showOverview ? (
          <CourseOverview
            htmlId={resolveSectionHtmlId("overview", m?.overview._id)}
            overview={overview?.lead ?? course.overview}
            description={overview?.description}
            level={course.level}
            duration={course.duration}
            certification={course.certification}
            fee={course.fee}
            glance={overview?.glance ?? []}
            heading={overview?.heading}
            saying={overview?.saying}
            videos={videos}
            eyebrow={overview?.eyebrow}
            title={overview?.title}
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
            arrivalSupport={m?.inclusions.arrivalSupport}
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
            duration={pricingDuration}
            pricing={publicPricing}
            pricingDescription={
              m?.pricing.description ?? course.pricingDescription
            }
            batches={pricingBatches}
            programSlug={course.slug}
            bookingType="course"
            selectedRoomType={selectedRoomType}
            selectedBatch={selectedBatch}
            onRoomSelect={setSelectedRoomType}
            onBatchSelect={setSelectedBatch}
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
