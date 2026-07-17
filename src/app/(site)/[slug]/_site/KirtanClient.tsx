"use client";

import {
  Accommodation,
  CourseBookingFab,
  CourseEligibility,
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  Food,
  InstagramFeed,
  PageGallerySection,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import {
  KirtanCertificationSection,
  KirtanHighlightsSection,
} from "@/components/kirtan";
import { FAQSection } from "@/components/ui";
import {
  KIRTAN_SYLLABUS_SIDEBAR,
  kirtanHeroImage,
  parseKirtanContent,
} from "@/content/mappers/kirtan-page";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Dedicated layout for the 5-day kirtan, vocal & instrumental music training page.
 *
 * @param props - Mapped site page content with kirtan-specific overrides
 */
export default function KirtanClient({
  page,
  mapped,
  modules,
  residentialLife,
  whyNirvana,
  reviews,
}: SiteClientProps) {
  const copy = mapped.presentation;
  const kirtan = parseKirtanContent(page);
  const fee = mapped.pricing[0]?.price ?? "$299 USD";
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));

  return (
    <>
      <CourseHero
        variant="page"
        title={page.title}
        subtitle={copy.heroSubtitle}
        image={kirtanHeroImage(page)}
        eyebrow="5-Day Music Training"
        heroImages={mapped.heroImages}
        metaItems={mapped.metaItems}
        ctaPrimary={mapped.ctaPrimary}
        ctaPrimaryHref={mapped.ctaPrimaryHref}
        ctaSecondary={mapped.ctaSecondary}
        ctaSecondaryHref={mapped.ctaSecondaryHref}
      />
      <CourseStickyNav items={mapped.navItems} />
      <CourseBookingFab
        fee={fee}
        title={page.title}
        href={mapped.ctaPrimaryHref}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        <CourseOverview
          htmlId={resolveSectionHtmlId("overview", modules?.overview._id)}
          overview={mapped.overview ?? ""}
          level="Beginners welcome"
          duration={mapped.duration}
          fee={fee}
          certification="Certificate on completion"
          featureImages={
            kirtan.overviewImages.length > 0
              ? kirtan.overviewImages
              : mapped.heroImages.slice(1, 5)
          }
          eyebrow="Program Overview"
          title={
            <>
              Find your voice through{" "}
              <span className="text-primary">sacred sound</span>
            </>
          }
          supportingCopy={copy.overviewSupporting ?? ""}
          quoteText={copy.quoteText}
          quoteAttribution={copy.quoteAttribution}
        />

        <WhatIsIncluded
          htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
          inclusions={mapped.inclusions}
          exclusions={mapped.exclusions}
        />

        <CourseEligibility
          htmlId={resolveSectionHtmlId("eligibility", modules?.eligibility._id)}
          requirements={kirtan.eligibility}
          eyebrow="Who Is This For"
          title={
            <>
              Open to every <span className="text-primary">sincere seeker</span>
            </>
          }
          description="No prior musical training is needed — only curiosity, openness, and a willingness to learn through practice."
          showAllianceBadge={false}
        />

        <CourseSyllabus
          htmlId={resolveSectionHtmlId("syllabus", modules?.syllabus._id)}
          description={kirtan.syllabusDescription}
          syllabus={kirtan.syllabus}
          sidebar={KIRTAN_SYLLABUS_SIDEBAR}
          subtopicsLabel="What you will learn:"
        />

        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}

        <KirtanCertificationSection
          description={kirtan.certification}
          images={kirtan.certificationImages}
        />

        {(modules?.flags.showAccommodation ?? mapped.showAccommodation) ? (
          <>
            <Accommodation content={residentialLife} />
            <Food content={residentialLife} />
          </>
        ) : null}

        <UpcomingDates
          htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
          duration={mapped.duration}
          pricing={mapped.pricing}
          pricingDescription={mapped.pricingDescription}
          batches={mapped.batches}
          datesTitle="Course dates"
          lodgingTitle="Packages (room & food)"
        />

        <KirtanHighlightsSection
          highlights={kirtan.highlights}
          images={kirtan.highlightImages}
        />

        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}

        {(modules?.flags.showInstagram ?? mapped.showInstagram) ? (
          <InstagramFeed />
        ) : null}

        <FAQSection
          id={resolveSectionHtmlId("faq", modules?.faqs._id)}
          faqs={mapped.faqs}
          sectionClassName="bg-white"
          eyebrow="Common Questions"
          title={
            <>
              Kirtan training <span className="text-primary">FAQs</span>
            </>
          }
        />
      </article>
    </>
  );
}
