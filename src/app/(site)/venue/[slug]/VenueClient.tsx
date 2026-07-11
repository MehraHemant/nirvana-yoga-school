"use client";

import {
  AccommodationFood,
  InstagramFeed,
  PageGallerySection,
  PageProgramsSection,
  WhyNirvana,
} from "@/components/courses";
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
export default function VenueClient({
  page,
  mapped,
  modules,
}: SiteClientProps) {
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
        <AccommodationFood />
        <InstagramFeed />
        <WhyNirvana />
        <SiteFaq mapped={mapped} />
      </article>
    </>
  );
}
