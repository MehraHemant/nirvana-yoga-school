"use client";

import {
  Accommodation,
  DailySchedule,
  Food,
  InstagramFeed,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { MapSection, TeachersSection } from "@/components/home";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Fallback for retreat-booking and other site-page retreats without dedicated JSON.
 *
 * @param props - Mapped site content and shared CMS sections
 */
export default function LegacyRetreatClient({
  page,
  mapped,
  teachers,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
  siteMap,
}: SiteClientProps) {
  const isBooking = page.slug === "retreat-booking";
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showMap =
    (modules?.flags.showMap ?? mapped.showMap) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {mapped.inclusions.length > 0 && (
          <WhatIsIncluded
            inclusions={mapped.inclusions}
            exclusions={mapped.exclusions}
          />
        )}
        {mapped.schedule.length > 0 && (
          <DailySchedule
            description={mapped.scheduleDescription}
            schedule={mapped.schedule}
          />
        )}
        {mapped.pricing.length > 0 && (
          <UpcomingDates
            duration={mapped.duration}
            pricing={mapped.pricing}
            pricingDescription={mapped.pricingDescription}
            batches={mapped.batches}
            datesTitle={isBooking ? "Book a retreat" : "Retreat dates"}
            lodgingTitle="Retreat packages"
          />
        )}
        {teachers.length > 0 && <TeachersSection teachers={teachers} />}
        <SiteEditorial mapped={mapped} />
        {(modules?.flags.showAccommodation ?? mapped.showAccommodation) ? (
          <>
            <Accommodation content={residentialLife} />
            <Food content={residentialLife} />
          </>
        ) : null}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        {(modules?.flags.showTravel ?? mapped.showTravelGuide) ? (
          <TravelGuide />
        ) : null}
        {(modules?.flags.showInstagram ?? mapped.showInstagram) ? (
          <InstagramFeed />
        ) : null}
        {showMap && siteMap ? <MapSection content={siteMap} /> : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
