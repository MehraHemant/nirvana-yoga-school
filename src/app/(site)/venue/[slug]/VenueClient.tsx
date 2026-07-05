"use client";

import {
  AccommodationFood,
  PageGallerySection,
  PageProgramsSection,
} from "@/components/courses";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

export default function VenueClient({ page, mapped }: SiteClientProps) {
  return (
    <>
      <SiteHero page={page} mapped={mapped} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} />
        {mapped.programs.length > 0 && (
          <PageProgramsSection cards={mapped.programs} />
        )}
        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
        <SiteEditorial mapped={mapped} />
        <AccommodationFood />
        <SiteFaq mapped={mapped} />
      </article>
    </>
  );
}
