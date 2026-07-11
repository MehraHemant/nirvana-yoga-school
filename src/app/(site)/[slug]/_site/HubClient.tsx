"use client";

import {
  AccommodationFood,
  InstagramFeed,
  PageGallerySection,
  PageProgramsSection,
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

export default function HubClient({
  page,
  mapped,
  teachers,
  modules,
}: SiteClientProps) {
  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {(modules?.inclusions.items.length ?? mapped.inclusions.length) > 0 && (
          <WhatIsIncluded
            inclusions={modules?.inclusions.items ?? mapped.inclusions}
            exclusions={modules?.inclusions.exclusions ?? mapped.exclusions}
            eyebrow={modules?.inclusions.eyebrow}
            title={modules?.inclusions.title}
            description={modules?.inclusions.description}
          />
        )}
        {mapped.pricing.length > 0 && (
          <UpcomingDates
            duration={mapped.duration}
            pricing={mapped.pricing}
            pricingDescription={mapped.pricingDescription}
            batches={mapped.batches}
            datesTitle="Training dates"
            lodgingTitle="Lodging packages"
          />
        )}
        {teachers.length > 0 && <TeachersSection teachers={teachers} />}
        {mapped.programs.length > 0 && (
          <PageProgramsSection cards={mapped.programs} />
        )}
        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
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
