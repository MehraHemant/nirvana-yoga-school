"use client";

import { useState, type ReactNode } from "react";
import { CourseStickyNav, PageHeroRenderer } from "@/components/courses";
import { bookingReserveHref } from "@/components/courses/upcomingDatesShared";
import {
  RetreatHighlightsBar,
  RetreatProductAccommodationSection,
  RetreatProductDatesFeesSection,
  RetreatProductFAQSection,
  RetreatProductFoodSection,
  RetreatProductInclusionsSection,
  RetreatProductOfferCard,
  RetreatProductOverviewSection,
  RetreatProductScheduleSection,
  RetreatProductTestimonialsSection,
} from "@/components/retreat";
import { Container } from "@/components/ui";
import { filterRetreatNavItems } from "@/content/mappers/retreat-page";
import { isSectionLive } from "@/lib/cms/section-visibility";
import type { RetreatPageData } from "./types";

/**
 * Two-column product grid (main + sticky offer sidebar) inside Container 2xl.
 *
 * @param main - Sections that share the narrow main column with the sidebar
 * @param sidebar - Sticky offer card (desktop)
 */
function RetreatProductGrid({
  main,
  sidebar,
}: {
  main: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <Container size="2xl">
      <div className="retreat-product-layout">
        <main className="retreat-product-main min-w-0">{main}</main>
        {sidebar}
      </div>
    </Container>
  );
}

/**
 * Retreat product page — hero, highlights, sticky nav, two-column body with offer sidebar.
 *
 * @param props - Retreat document, modules, and shared section content
 */
export default function RetreatClient({
  retreat,
  product,
  modules,
}: RetreatPageData) {
  const [selectedRoomId, setSelectedRoomId] = useState(
    () => product.dates?.packages[0]?.roomId ?? "",
  );
  const [selectedBatch, setSelectedBatch] = useState(
    () => product.dates?.batches[0]?.dates ?? "",
  );

  const selectedPackage = product.dates?.packages.find(
    (pkg) => pkg.roomId === selectedRoomId,
  );
  const bookingReady = Boolean(selectedRoomId && selectedBatch);
  const pricingAnchor = "#pricing";
  const bookingHref = bookingReady
    ? bookingReserveHref(
        "retreat",
        retreat.slug,
        selectedPackage?.roomType ?? "",
        selectedBatch,
      )
    : pricingAnchor;

  const showHero = modules != null && isSectionLive(modules.hero);
  const showStickyNav =
    modules != null && isSectionLive(modules.stickyNav);
  const showReviews =
    isSectionLive(modules?.testimonials) &&
    (product.testimonials?.items.length ?? 0) > 0;
  const showFaqs = (product.faqs?.items.length ?? 0) > 0;
  const showOffer = product.offer != null;

  const navItems = filterRetreatNavItems(modules?.stickyNav.items ?? [], {
    showFaqs,
    showReviews,
  });

  const offerCard = showOffer ? (
    <RetreatProductOfferCard
      offer={product.offer!}
      selection={{
        price: selectedPackage?.price,
        originalPrice: selectedPackage?.originalPrice,
        roomLabel: selectedPackage?.roomType,
        batch: selectedBatch,
      }}
      bookingHref={bookingHref}
      ready={bookingReady}
      pricingAnchor={pricingAnchor}
    />
  ) : null;

  const desktopSidebar =
    offerCard != null ? (
      <aside className="retreat-product-sidebar hidden lg:block">
        {offerCard}
      </aside>
    ) : null;

  function handleSelectionChange(selection: { roomId: string; batch: string }) {
    setSelectedRoomId(selection.roomId);
    setSelectedBatch(selection.batch);
  }

  return (
    <div className="retreat-product-theme bg-white">
      {showHero && modules ? <PageHeroRenderer modules={modules} /> : null}

      <RetreatHighlightsBar highlights={retreat.highlights} />

      {showStickyNav && navItems.length > 0 ? (
        <CourseStickyNav items={navItems} variant="retreat" />
      ) : null}

      <RetreatProductGrid
        sidebar={desktopSidebar}
        main={
          <>
            {product.overview ? (
              <RetreatProductOverviewSection content={product.overview} />
            ) : null}
            {product.inclusions ? (
              <RetreatProductInclusionsSection content={product.inclusions} />
            ) : null}

            {offerCard ? (
              <div className="border-b border-ink/8 section-padding-y lg:hidden">
                <div className="retreat-product-mobile-offer mx-auto max-w-md">
                  {offerCard}
                </div>
              </div>
            ) : null}

            {product.schedule ? (
              <RetreatProductScheduleSection content={product.schedule} />
            ) : null}
            {product.accommodation ? (
              <RetreatProductAccommodationSection
                content={product.accommodation}
              />
            ) : null}
            {product.food ? (
              <RetreatProductFoodSection content={product.food} />
            ) : null}
            {product.dates ? (
              <RetreatProductDatesFeesSection
                content={product.dates}
                selectedRoomId={selectedRoomId}
                selectedBatch={selectedBatch}
                onSelectionChange={handleSelectionChange}
              />
            ) : null}
            {showReviews && product.testimonials ? (
              <RetreatProductTestimonialsSection
                content={product.testimonials}
              />
            ) : null}
            {showFaqs && product.faqs ? (
              <RetreatProductFAQSection content={product.faqs} />
            ) : null}
          </>
        }
      />
    </div>
  );
}
