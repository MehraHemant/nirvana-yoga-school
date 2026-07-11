"use client";

import { PageGallerySection, WhyNirvana } from "@/components/courses";
import { TeachersSection } from "@/components/home";
import { SiteFaq, SiteHero, SiteOverview } from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

export default function TeachersClient({
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
        {teachers.length > 0 && <TeachersSection teachers={teachers} />}
        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}
        <WhyNirvana />
        <SiteFaq mapped={mapped} />
      </article>
    </>
  );
}
