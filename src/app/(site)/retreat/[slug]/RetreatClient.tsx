"use client";

import { CourseStickyNav } from "@/components/courses";
import {
  RetreatAccommodationSection,
  RetreatHero,
  RetreatHighlightsBar,
  RetreatInclusionsSection,
  RetreatOverviewSection,
  RetreatPackagesSection,
  RetreatPricingCard,
  RetreatScheduleSection,
  RetreatTestimonialsSection,
} from "@/components/retreat";
import { Container } from "@/components/ui";
import type { RetreatPageData } from "./types";

export default function RetreatClient({ retreat, mapped }: RetreatPageData) {
  const pricingCard = (
    <RetreatPricingCard
      title={retreat.title}
      fee={mapped.fee}
      offer={retreat.offer}
      pricing={mapped.pricing}
    />
  );

  return (
    <div className="retreat-product-theme bg-white">
      <RetreatHero
        title={retreat.title}
        description={retreat.description}
        duration={retreat.duration}
        fee={mapped.fee}
        image={retreat.heroImage}
        ctaLabel={retreat.ctaLabel}
        ctaHref={retreat.ctaHref}
      />

      <RetreatHighlightsBar highlights={retreat.highlights} />

      <CourseStickyNav items={mapped.navItems} variant="retreat" />

      <Container size="2xl">
        <div className="retreat-product-layout">
          <main className="retreat-product-main min-w-0">
            <RetreatOverviewSection
              overview={retreat.overview}
              images={retreat.overviewImages}
            />

            <RetreatInclusionsSection inclusions={retreat.inclusions} />

            <div className="border-b border-secondary/10 py-8 lg:hidden">
              {pricingCard}
            </div>

            <RetreatScheduleSection schedule={retreat.schedule} />

            <RetreatAccommodationSection
              accommodation={retreat.accommodation}
              facilities={mapped.accommodationFacilities}
            />

            <RetreatPackagesSection
              duration={retreat.duration}
              pricing={mapped.pricing}
              batches={mapped.batches}
            />

            <RetreatTestimonialsSection />
          </main>

          <aside className="retreat-product-sidebar hidden lg:block">
            {pricingCard}
          </aside>
        </div>
      </Container>
    </div>
  );
}
