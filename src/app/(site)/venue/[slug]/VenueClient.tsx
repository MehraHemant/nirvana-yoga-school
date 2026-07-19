"use client";

import {
  Accommodation,
  ExamCertification,
  Food,
  InstagramFeed,
  PageGallerySection,
  PageProgramsSection,
  WhyNirvana,
} from "@/components/courses";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Composes dedicated venue pages from shared hero, overview, gallery,
 * accommodation, editorial, and FAQ sections.
 *
 * @param props - Mapped static venue page content
 */
/**
 * Venue page composition with shared Why Nirvana / lodging live gates.
 *
 * @param props - Mapped venue content and shared CMS sections
 */
export default function VenueClient({
  page,
  mapped,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
  instagram,
  examCertification,
}: SiteClientProps) {
  const programs = modules?.programs?.cards ?? mapped.programs;
  const gallery = modules?.gallery?.images ?? mapped.gallery;
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
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
        {showInstagram && instagram ? (
          <InstagramFeed content={instagram} />
        ) : null}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
