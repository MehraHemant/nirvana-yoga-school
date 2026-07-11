"use client";

import { PageGallerySection, PageProgramsSection } from "@/components/courses";
import {
  SiteEditorial,
  SiteFaq,
  SiteHero,
  SiteOverview,
} from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

export default function SiteClient({ page, mapped, modules }: SiteClientProps) {
  const showGallery = page.slug === "gallery" || mapped.gallery.length > 0;

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {mapped.programs.length > 0 && (
          <PageProgramsSection cards={mapped.programs} />
        )}
        {showGallery && mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
        <SiteEditorial mapped={mapped} />
        <SiteFaq mapped={mapped} />
      </article>
    </>
  );
}
