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
  const programs = modules?.programs?.cards ?? mapped.programs;
  const gallery = modules?.gallery?.images ?? mapped.gallery;
  const showGallery = page.slug === "gallery" || gallery.length > 0;

  return (
    <>
      <SiteHero page={page} mapped={mapped} modules={modules} />
      <article className="min-h-screen max-w-full overflow-x-clip">
        <SiteOverview page={page} mapped={mapped} modules={modules} />
        {programs.length > 0 && <PageProgramsSection cards={programs} />}
        {showGallery && gallery.length > 0 && (
          <PageGallerySection images={gallery} />
        )}
        <SiteEditorial mapped={mapped} />
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
