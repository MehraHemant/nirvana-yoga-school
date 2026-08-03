"use client";

import { MapSection } from "@/components";
import {
  AccommodationFood,
  CourseBookingFab,
  CourseOverview,
  CourseStickyNav,
  ExamCertification,
  InstagramFeed,
  PageHeroRenderer,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import {
  RetreatHighlightsBar,
  RetreatScheduleSection,
} from "@/components/retreat";
import { FAQSection } from "@/components/ui";
import { retreatWhatsAppHref } from "@/content/mappers/retreat-page";
import {
  hasExamCertificationContent,
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { RetreatPageData } from "./types";

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
  /** Glance value from CMS modules, else empty (no improvised filler). */
  const overviewValue = (label: string, fallback = "") =>
    modules?.overview.glance.find((item) => item.label === label)?.value ??
    fallback;

  const showHero = isSectionLive(modules?.hero);
  const showStickyNav = isSectionLive(modules?.stickyNav);
  const showOverview = isSectionLive(modules?.overview);
  const showInclusions = shouldRenderSection(
    modules?.inclusions,
    (modules?.inclusions.items ?? retreat.inclusions).length > 0,
  );
  const showPricing = shouldRenderSection(
    modules?.pricing,
    (modules?.pricing.options ?? mapped.pricing).length > 0,
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

      {/* Highlights Bar */}
      <RetreatHighlightsBar highlights={retreat.highlights} />

      {/* Sticky Navigation */}
      {showStickyNav ? (
        <CourseStickyNav
          items={modules?.stickyNav.items ?? mapped.navItems}
          variant="retreat"
        />
      ) : null}

      {/* Floating Booking Button (triggers after scroll) */}
      <CourseBookingFab
        fee={mapped.fee}
        title={retreat.title}
        href={`/retreat-booking?course=${encodeURIComponent(retreat.slug)}`}
      />

      {/* Spacious Full-Width Editorial Sections */}
      <article className="min-h-screen max-w-full bg-white">
        {showOverview ? (
          <CourseOverview
            htmlId={resolveSectionHtmlId("overview", modules?.overview._id)}
            overview={modules?.overview.lead ?? retreat.overview}
            level={overviewValue("Level")}
            duration={overviewValue("Duration", retreat.duration)}
            certification={overviewValue("Certification")}
            fee={
              overviewValue("Program Fee") ||
              overviewValue("Fee") ||
              mapped.fee
            }
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
          />
        ) : null}

        {/* Section 3: Day-Wise Schedule Timeline */}
        {retreat.schedule?.length ? (
          <RetreatScheduleSection schedule={retreat.schedule} />
        ) : null}

        {showExam && examCertification ? (
          <ExamCertification content={examCertification} />
        ) : null}

        {/* Section 4: Accommodation & Food — shared with yoga courses */}
        {showAccommodation ? (
          <AccommodationFood content={residentialLife} />
        ) : null}

        {/* Section 5: Packages & Dates — shared UpcomingDates UI, retreat rooms only */}
        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={modules?.pricing.duration ?? retreat.duration}
            pricing={modules?.pricing.options ?? mapped.pricing}
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

        {/* Section 7: FAQs (if available) */}
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
