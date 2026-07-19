"use client";

import {
  AccommodationFood,
  DailySchedule,
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
  instagram,
  travel,
}: SiteClientProps) {
  const isBooking = page.slug === "retreat-booking";
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showMap =
    (modules?.flags.showMap ?? mapped.showMap) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));
  const showTravel =
    (modules?.flags.showTravel ?? mapped.showTravelGuide) &&
    shouldRenderSection(travel, Boolean(travel?.topics?.length));
  const showInstagram =
    (modules?.flags.showInstagram ?? mapped.showInstagram) &&
    shouldRenderSection(instagram, Boolean(instagram?.media?.length));

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {mapped.inclusions.length > 0 && (
          <WhatIsIncluded inclusions={mapped.inclusions} />
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
          <AccommodationFood content={residentialLife} />
        ) : null}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        {showTravel && travel ? <TravelGuide content={travel} /> : null}
        {showInstagram && instagram ? (
          <InstagramFeed content={instagram} />
        ) : null}
        {showMap && siteMap ? <MapSection content={siteMap} /> : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
