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
import { TeachersSection } from "@/components/home";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

export default function RetreatClient({
  page,
  mapped,
  teachers,
}: SiteClientProps) {
  const isBooking = page.slug === "retreat-booking";

  return (
    <>
      <SiteHero page={page} mapped={mapped} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} />
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
        <AccommodationFood />
        <WhyNirvana />
        <TravelGuide />
        <InstagramFeed />
        <SiteFaq mapped={mapped} />
      </article>
    </>
  );
}
