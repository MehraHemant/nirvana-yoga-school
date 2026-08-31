"use client";

import dynamic from "next/dynamic";
import {
  CourseBookingFab,
  CourseOverview,
  CourseStickyNav,
  PageHeroRenderer,
} from "@/components/courses";
import { RetreatHighlightsBar } from "@/components/retreat";
import { filterItemsWithPrice } from "@/content/mappers/residential-life-utils";
import { retreatWhatsAppHref } from "@/content/mappers/retreat-page";
import {
  hasExamCertificationContent,
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { RetreatPageData } from "./types";

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
const RetreatScheduleSection = dynamic(
  () => import("@/components/retreat/RetreatScheduleSection"),
  { loading: () => <SectionSkeleton /> },
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
 * Retreat product page — hero, highlights, sticky nav stay eager;
 * below-fold sections are code-split.
 *
 * @param props - Retreat document, modules, and shared section content
 */
export default function RetreatClient({
  retreat,
  mapped,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
  siteMap,
  instagram,
  travel,
  examCertification,
}: RetreatPageData) {
  const publicPricing = filterItemsWithPrice(
    modules?.pricing.options?.length ? modules.pricing.options : mapped.pricing,
  );
  const showHero = isSectionLive(modules?.hero);
  const showStickyNav = isSectionLive(modules?.stickyNav);
  const showOverview = isSectionLive(modules?.overview);
  const showInclusions = shouldRenderSection(
    modules?.inclusions,
    (modules?.inclusions.items ?? retreat.inclusions).length > 0,
  );
  const showPricing = shouldRenderSection(
    modules?.pricing,
    publicPricing.length > 0,
  );
  const faqItems = modules?.faqs.items?.length
    ? modules.faqs.items
    : (retreat.faqs ?? []);
  const showFaqs = shouldRenderSection(modules?.faqs, faqItems.length > 0);
  const showAccommodation = modules?.flags.showAccommodation ?? true;
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? true) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showMap =
    (modules?.flags.showMap ?? true) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));
  const showTravel =
    (modules?.flags.showTravel ?? true) &&
    shouldRenderSection(travel, Boolean(travel?.topics?.length));
  const showInstagram =
    (modules?.flags.showInstagram ?? true) &&
    shouldRenderSection(instagram, Boolean(instagram?.media?.length));
  const showExam =
    (modules?.flags.showExam ?? false) &&
    shouldRenderSection(
      examCertification,
      hasExamCertificationContent(examCertification),
    );

  return (
    <div className="retreat-product-theme bg-white">
      {showHero ? (
        modules ? (
          <PageHeroRenderer modules={modules} />
        ) : (
          <PageHeroRenderer
            modules={{
              hero: {
                type: "bento-media",
                title: retreat.title,
                subtitle: retreat.description,
                duration: retreat.duration,
                certification: "Yoga & Meditation",
                fee: mapped.fee,
                heroImages: mapped.heroImages,
              },
              stickyNav: { items: [] },
              overview: {
                eyebrow: "",
                title: "",
                lead: "",
                glance: [],
                media: { mode: "image", items: [] },
              },
              inclusions: { items: [] },
              eligibility: { requirements: [] },
              syllabus: { description: "", chapters: [] },
              schedule: { description: "", items: [] },
              pricing: { description: "", options: [] },
              faqs: { items: [] },
              flags: {
                showExam: false,
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

      <RetreatHighlightsBar highlights={retreat.highlights} />

      {showStickyNav ? (
        <CourseStickyNav
          items={modules?.stickyNav.items ?? mapped.navItems}
          variant="retreat"
        />
      ) : null}

      <CourseBookingFab
        fee={mapped.fee}
        title={retreat.title}
        href={`/retreat-booking?course=${encodeURIComponent(retreat.slug)}`}
      />

      <article className="min-h-screen max-w-full overflow-x-clip bg-white">
        {showOverview ? (
          <CourseOverview
            htmlId={resolveSectionHtmlId("overview", modules?.overview._id)}
            overview={modules?.overview.lead ?? retreat.overview}
            description={modules?.overview.description}
            level=""
            duration={retreat.duration}
            certification=""
            fee={mapped.fee}
            glance={modules?.overview.glance ?? []}
            heading={modules?.overview.heading}
            saying={modules?.overview.saying}
            featureImages={
              modules?.overview.media.items
                .filter((item) => item.type === "image")
                .map((item) => item.url) ?? retreat.overviewImages
            }
            eyebrow={modules?.overview.eyebrow ?? retreat.eyebrow}
            title={modules?.overview.title ?? retreat.title}
            supportingCopy={modules?.overview.supportingCopy ?? ""}
          />
        ) : null}

        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
            inclusions={modules?.inclusions.items ?? retreat.inclusions}
            eyebrow={modules?.inclusions.eyebrow}
            title={modules?.inclusions.title}
            description={modules?.inclusions.description}
            arrivalSupport={modules?.inclusions.arrivalSupport}
          />
        ) : null}

        {retreat.schedule?.length ? (
          <RetreatScheduleSection schedule={retreat.schedule} />
        ) : null}

        {showExam && examCertification ? (
          <ExamCertification content={examCertification} />
        ) : null}

        {showAccommodation ? (
          <AccommodationFood content={residentialLife} />
        ) : null}

        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={modules?.pricing.duration ?? retreat.duration}
            pricing={publicPricing}
            pricingDescription={
              modules?.pricing.description ?? mapped.pricingDescription
            }
            batches={modules?.pricing.batches ?? mapped.batches}
            lodgingTitle="Retreat packages"
            datesTitle="Retreat dates"
            programSlug={retreat.slug}
            bookingType="retreat"
            buildWhatsAppHref={retreatWhatsAppHref}
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
          <div className="bg-white">
            <FAQSection
              id={resolveSectionHtmlId("faq", modules?.faqs._id)}
              faqs={faqItems}
              sectionClassName="bg-white border-t border-secondary/10"
              eyebrow="Retreat Details"
              title={
                <>
                  Retreat <span className="text-primary">FAQs</span>
                </>
              }
            />
          </div>
        ) : null}
      </article>
    </div>
  );
}
