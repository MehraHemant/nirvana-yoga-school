"use client";

import dynamic from "next/dynamic";
import {
  CourseBookingFab,
  CourseOverview,
  CourseStickyNav,
  PageHeroRenderer,
} from "@/components/courses";
import { resolveOverviewStillFromModule } from "@/components/courses/overview-layouts/resolve";
import { RetreatHighlightsBar } from "@/components/retreat";
import { filterItemsWithPrice } from "@/content/mappers/residential-life-utils";
import {
  filterRetreatNavItems,
  retreatWhatsAppHref,
} from "@/content/mappers/retreat-page";
import { isSectionLive, shouldRenderSection } from "@/lib/cms/section-visibility";
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
const AccommodationFood = dynamic(
  () => import("@/components/courses/AccommodationFood"),
  { loading: () => <SectionSkeleton /> },
);
const UpcomingDates = dynamic(
  () => import("@/components/courses/UpcomingDates"),
  { loading: () => <SectionSkeleton /> },
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection"),
  { loading: () => <SectionSkeleton minHeight="min-h-[30vh]" /> },
);
const FAQSection = dynamic(() => import("@/components/ui/FAQSection"), {
  loading: () => <SectionSkeleton minHeight="min-h-[30vh]" />,
});

/**
 * Retreat product page — only sections that exist on the live retreat pages.
 *
 * @param props - Retreat document, modules, and shared section content
 */
export default function RetreatClient({
  retreat,
  mapped,
  modules,
  residentialLife,
  reviews,
}: RetreatPageData) {
  const modulePricing = filterItemsWithPrice(modules?.pricing.options ?? []);
  const publicPricing =
    modulePricing.length > 0
      ? modulePricing
      : filterItemsWithPrice(mapped.pricing);
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
  const showReviews = shouldRenderSection(
    reviews,
    Boolean(reviews?.reviews?.length),
  );
  const navItems = filterRetreatNavItems(
    modules?.stickyNav.items ?? mapped.navItems,
    { showFaqs, showReviews },
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
                showWhyNirvana: false,
                showTravel: false,
                showInstagram: false,
                showMap: false,
              },
            }}
          />
        )
      ) : null}

      <RetreatHighlightsBar highlights={retreat.highlights} />

      {showStickyNav && navItems.length > 0 ? (
        <CourseStickyNav items={navItems} variant="retreat" />
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
            // featureImages={
            //   modules?.overview.media.items
            //     .filter((item) => item.type === "image")
            //     .map((item) => item.url) ?? retreat.overviewImages
            // }
            stillImage={resolveOverviewStillFromModule(modules?.overview)}
            eyebrow={modules?.overview.eyebrow ?? retreat.eyebrow}
            title={modules?.overview.title ?? retreat.title}
            supportingCopy={modules?.overview.supportingCopy ?? ""}
          />
        ) : null}

        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
            inclusions={modules?.inclusions.items ?? retreat.inclusions}
            eyebrow={modules?.inclusions.eyebrow || "Inclusions"}
            title={modules?.inclusions.title || "What is Included"}
            description={
              modules?.inclusions.description ||
              "Yoga, meditation, healing sessions, excursions, stay, and sattvic meals listed here are part of this retreat."
            }
            arrivalSupport={modules?.inclusions.arrivalSupport}
          />
        ) : null}

        {retreat.schedule?.length ? (
          <RetreatScheduleSection schedule={retreat.schedule} />
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
            variant="retreat"
          />
        ) : null}

        {showReviews ? (
          <TestimonialsSection
            reviews={reviews}
            content={{
              eyebrow: "Reviews",
              title: "Testimonials",
              description: "",
            }}
          />
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
