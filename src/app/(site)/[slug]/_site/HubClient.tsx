"use client";

import {
  Accommodation,
  Food,
  InstagramFeed,
  PageGallerySection,
  PageProgramsSection,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { TeachersSection } from "@/components/home";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Marketing hub page composition with shared section live gates.
 *
 * @param props - Mapped hub content and shared CMS sections
 */
export default function HubClient({
  page,
  mapped,
  teachers,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
}: SiteClientProps) {
  const inclusionItems = modules?.inclusions.items ?? mapped.inclusions;
  const showInclusions = shouldRenderSection(
    modules?.inclusions,
    inclusionItems.length > 0,
  );
  const showPricing = shouldRenderSection(
    modules?.pricing,
    mapped.pricing.length > 0,
  );
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
            inclusions={inclusionItems}
            exclusions={modules?.inclusions.exclusions ?? mapped.exclusions}
            eyebrow={modules?.inclusions.eyebrow}
            title={modules?.inclusions.title}
            description={modules?.inclusions.description}
          />
        ) : null}
        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={mapped.duration}
            pricing={mapped.pricing}
            pricingDescription={mapped.pricingDescription}
            batches={mapped.batches}
            datesTitle="Training dates"
            lodgingTitle="Lodging packages"
          />
        ) : null}
        {teachers.length > 0 && <TeachersSection teachers={teachers} />}
        {mapped.programs.length > 0 && (
          <PageProgramsSection cards={mapped.programs} />
        )}
        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
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
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
