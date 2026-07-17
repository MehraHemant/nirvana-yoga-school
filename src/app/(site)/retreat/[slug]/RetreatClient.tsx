"use client";

import {
  CourseBookingFab,
  CourseOverview,
  CourseStickyNav,
  PageHeroRenderer,
  UpcomingDates,
  WhatIsIncluded,
} from "@/components/courses";
import { TestimonialsSection } from "@/components/home";
import {
  RetreatAccommodationSection,
  RetreatHighlightsBar,
  RetreatScheduleSection,
} from "@/components/retreat";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { retreatWhatsAppHref } from "@/content/mappers/retreat-page";
import { isSectionLive, shouldRenderSection } from "@/lib/cms/section-visibility";
import type { RetreatPageData } from "./types";

const RETREAT_OVERVIEW_DETAILS: Record<
  string,
  {
    title: React.ReactNode;
    supportingCopy: string;
    level: string;
    certification: string;
    quoteText: string;
    quoteAttribution: string;
  }
> = {
  "3-day-yoga-retreat-in-rishikesh-india": {
    title: (
      <>
        Experience a Restorative{" "}
        <span className="text-primary">Himalayan Escape</span>
      </>
    ),
    supportingCopy:
      "Our 3-day short yoga and meditation retreat is designed specifically for individuals looking to step away from busy routines and reset their energy in a quiet environment. Located near the sacred Ganges river, this program provides a gentle introduction to traditional Hatha yoga postures, pranayama breathing, and holistic ayurvedic massages. It is the perfect weekend getaway or travel extension to experience the spiritual atmosphere of Rishikesh without a long-term commitment.",
    level: "Beginner Friendly",
    certification: "Sound & Yoga Wellness",
    quoteText:
      "Sometimes the most productive thing you can do is relax and let your mind drift in the lap of nature.",
    quoteAttribution: "Himalayan Wisdom",
  },
  "5-day-yoga-retreat-in-rishikesh-india": {
    title: (
      <>
        Reconnect, Rebalance &amp; <span className="text-primary">Heal</span> in
        Rishikesh
      </>
    ),
    supportingCopy:
      "The 5-day yoga and meditation retreat is a complete immersive experience that allows you to dive deeper into traditional wellness practices. Throughout the five days, you will experience daily Hatha and Yin classes, interactive sound healing therapies, and traditional cleansing ceremonies. With freshly prepared organic meals and excursions to nearby mountain shrines, this program offers a supportive, nurturing container to release accumulated stress, process emotional blocks, and carry a deep sense of peace back home.",
    level: "All Experience Levels",
    certification: "Ayurveda & Yoga Wellness",
    quoteText: "An experience that enriches your soul — not just your memory.",
    quoteAttribution: "Nirvana Wellness Guide",
  },
  "7-day-yoga-retreat-in-rishikesh-india": {
    title: (
      <>
        A Transformative Week of{" "}
        <span className="text-primary">Spiritual Renewal</span>
      </>
    ),
    supportingCopy:
      "Our 7-day retreat is a week-long journey of self-reflection, detoxification, and alignment. This comprehensive program blends daily dynamic asana sessions with restorative afternoon practices, detailed pranayama studies, and ancient mantra chanting. In addition to ashram-based classes, you will embark on guided hikes to scenic temple peaks and attend evening prayer ceremonies on the banks of the Ganga. It is an ideal sanctuary for students, yoga teachers, and wellness seekers seeking a profound reset of their body, mind, and spirit.",
    level: "Beginner to Intermediate",
    certification: "Holistic Yoga & Meditation",
    quoteText:
      "Yoga is a light, which once lit, will never dim. The better your practice, the brighter the flame.",
    quoteAttribution: "B.K.S. Iyengar",
  },
};

export default function RetreatClient({
  retreat,
  mapped,
  modules,
  lodging,
}: RetreatPageData) {
  const details =
    RETREAT_OVERVIEW_DETAILS[retreat.slug] ??
    RETREAT_OVERVIEW_DETAILS["5-day-yoga-retreat-in-rishikesh-india"];

  const showHero = isSectionLive(modules?.hero);
  const showStickyNav = isSectionLive(modules?.stickyNav);
  const showOverview = isSectionLive(modules?.overview);
  const showInclusions = shouldRenderSection(
    modules?.inclusions,
    (modules?.inclusions.items ?? retreat.inclusions).length > 0,
  );
  const showPricing = shouldRenderSection(
    modules?.pricing,
    mapped.pricing.length > 0,
  );
  const showFaqs = shouldRenderSection(
    modules?.faqs,
    (modules?.faqs.items ?? retreat.faqs ?? []).length > 0,
  );
  const showAccommodation =
    (modules?.flags.showAccommodation ?? true) &&
    shouldRenderSection(
      lodging,
      lodging.roomGalleries.length > 0 ||
        lodging.foodGallery.length > 0 ||
        lodging.mealHighlights.length > 0,
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
            level={details.level}
            duration={retreat.duration}
            certification={details.certification}
            fee={mapped.fee}
            featureImages={
              modules?.overview.media.items
                .filter((item) => item.type === "image")
                .map((item) => item.url) ?? retreat.overviewImages
            }
            eyebrow={modules?.overview.eyebrow ?? "The Retreat Experience"}
            title={modules?.overview.title ?? details.title}
            supportingCopy={
              modules?.overview.supportingCopy ?? details.supportingCopy
            }
            quoteText={modules?.overview.quote?.text ?? details.quoteText}
            quoteAttribution={
              modules?.overview.quote?.attribution ?? details.quoteAttribution
            }
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

        {/* Section 4: Accommodation & Food (CMS lodging + page flag) */}
        {showAccommodation ? (
          <RetreatAccommodationSection
            accommodation={retreat.accommodation}
            facilities={mapped.accommodationFacilities}
            roomGalleries={lodging.roomGalleries}
            foodGallery={lodging.foodGallery}
            mealHighlights={lodging.mealHighlights}
            lodgingContent={lodging}
          />
        ) : null}

        {/* Section 5: Packages & Dates — shared UpcomingDates UI, retreat rooms only */}
        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={retreat.duration}
            pricing={mapped.pricing}
            pricingDescription={mapped.pricingDescription}
            batches={mapped.batches}
            lodgingTitle="Retreat packages"
            datesTitle="Retreat dates"
            programSlug={retreat.slug}
            bookingType="retreat"
            buildWhatsAppHref={retreatWhatsAppHref}
          />
        ) : null}

        {/* Section 6: Testimonials */}
        <TestimonialsSection />

        {/* Section 7: FAQs (if available) */}
        {showFaqs ? (
          <div className="bg-white">
            <FAQSection
              id={resolveSectionHtmlId("faq", modules?.faqs._id)}
              faqs={modules?.faqs.items ?? retreat.faqs ?? []}
              categories={COURSE_FAQ_CATEGORIES}
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
