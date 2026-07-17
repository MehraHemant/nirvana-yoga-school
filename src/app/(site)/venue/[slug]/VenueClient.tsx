"use client";

import {
  Accommodation,
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
}: SiteClientProps) {
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
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
        {(modules?.flags.showInstagram ?? mapped.showInstagram) ? (
          <InstagramFeed />
        ) : null}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
