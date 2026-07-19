"use client";

import {
  Accommodation,
  ExamCertification,
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
  instagram,
  travel,
  examCertification,
}: SiteClientProps) {
  const inclusionItems = modules?.inclusions.items ?? mapped.inclusions;
  const programs = modules?.programs?.cards ?? mapped.programs;
  const gallery = modules?.gallery?.images ?? mapped.gallery;
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
  const showTravel =
    (modules?.flags.showTravel ?? mapped.showTravelGuide) &&
    shouldRenderSection(travel, Boolean(travel?.topics?.length));
  const showInstagram =
    (modules?.flags.showInstagram ?? mapped.showInstagram) &&
    shouldRenderSection(instagram, Boolean(instagram?.media?.length));
  const showExam =
    (modules?.flags.showExam ?? false) &&
    shouldRenderSection(
      examCertification,
      Boolean(
        examCertification?.steps.length &&
          examCertification.certificates.length,
      ),
    );

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
            inclusions={inclusionItems}
            eyebrow={modules?.inclusions.eyebrow}
            title={modules?.inclusions.title}
            description={modules?.inclusions.description}
          />
        ) : null}
        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={modules?.pricing.duration ?? mapped.duration}
            pricing={
              modules?.pricing.options?.length
                ? modules.pricing.options
                : mapped.pricing
            }
            pricingDescription={
              modules?.pricing.description ?? mapped.pricingDescription
            }
            batches={
              modules?.pricing.batches?.length
                ? modules.pricing.batches
                : mapped.batches
            }
            datesTitle="Training dates"
            lodgingTitle="Lodging packages"
          />
        ) : null}
        {teachers.length > 0 &&
        shouldRenderSection(modules?.teachers, teachers.length > 0) ? (
          <TeachersSection teachers={teachers} />
        ) : null}
        {programs.length > 0 && <PageProgramsSection cards={programs} />}
        {gallery.length > 0 && <PageGallerySection images={gallery} />}
        <SiteEditorial mapped={mapped} />
        {showExam && examCertification ? (
          <ExamCertification content={examCertification} />
        ) : null}
        {(modules?.flags.showAccommodation ?? mapped.showAccommodation) ? (
          <>
            <Accommodation content={residentialLife} />
            <Food content={residentialLife} />
          </>
        ) : null}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        {showTravel && travel ? <TravelGuide content={travel} /> : null}
        {showInstagram && instagram ? (
          <InstagramFeed content={instagram} />
        ) : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
