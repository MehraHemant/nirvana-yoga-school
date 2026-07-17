"use client";

import { PageGallerySection, WhyNirvana } from "@/components/courses";
import { TeachersSection } from "@/components/home";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { SiteFaq, SiteHero, SiteOverview } from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Teachers listing page with shared Why Nirvana live gate.
 *
 * @param props - Mapped teacher page content and shared sections
 */
export default function TeachersClient({
  page,
  mapped,
  teachers,
  modules,
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
        {teachers.length > 0 && <TeachersSection teachers={teachers} />}
        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
