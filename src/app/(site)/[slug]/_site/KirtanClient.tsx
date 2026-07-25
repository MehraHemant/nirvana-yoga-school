"use client";

import {
  AccommodationFood,
  CourseBookingFab,
  CourseEligibility,
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  ExamCertification,
  InstagramFeed,
  PageGallerySection,
  PageHeroRenderer,
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
import {
  hasExamCertificationContent,
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
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
  instagram,
  examCertification,
}: SiteClientProps) {
  const copy = mapped.presentation;
  const kirtan = parseKirtanContent(page);
  const fee = mapped.pricing[0]?.price ?? "$299 USD";
  const showHero = isSectionLive(modules?.hero);
  const showStickyNav = isSectionLive(modules?.stickyNav);
  const showOverview = isSectionLive(modules?.overview);
  const showInclusions = shouldRenderSection(
    modules?.inclusions,
    (modules?.inclusions.items ?? mapped.inclusions).length > 0,
  );
  const showEligibility = isSectionLive(modules?.eligibility);
  const showSyllabus = shouldRenderSection(
    modules?.syllabus,
    (modules?.syllabus.chapters ?? kirtan.syllabus).length > 0,
  );
  const showPricing = shouldRenderSection(
    modules?.pricing,
    (modules?.pricing.options ?? mapped.pricing).length > 0,
  );
  const showFaqs = shouldRenderSection(
    modules?.faqs,
    (modules?.faqs.items ?? mapped.faqs).length > 0,
  );
  const gallery = modules?.gallery?.images ?? mapped.gallery;
  const showWhyNirvana =
    (modules?.flags.showWhyNirvana ?? mapped.showWhyNirvana) &&
    shouldRenderSection(whyNirvana, Boolean(whyNirvana?.highlights?.length));
  const showInstagram =
    (modules?.flags.showInstagram ?? mapped.showInstagram) &&
    shouldRenderSection(instagram, Boolean(instagram?.media?.length));
  const showExam =
    (modules?.flags.showExam ?? false) &&
    shouldRenderSection(
      examCertification,
      hasExamCertificationContent(examCertification),
    );

  return (
    <>
      {showHero ? (
        modules ? (
          <PageHeroRenderer modules={modules} />
        ) : (
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
        )
      ) : null}
      {showStickyNav ? (
        <CourseStickyNav items={modules?.stickyNav.items ?? mapped.navItems} />
      ) : null}
      <CourseBookingFab
        fee={fee}
        title={page.title}
        href={mapped.ctaPrimaryHref}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        {showOverview ? (
          <CourseOverview
            htmlId={resolveSectionHtmlId("overview", modules?.overview._id)}
            overview={modules?.overview.lead ?? mapped.overview ?? ""}
            level={
              modules?.overview.glance.find((item) => item.label === "Level")
                ?.value ?? ""
            }
            duration={
              modules?.overview.glance.find((item) => item.label === "Duration")
                ?.value ?? mapped.duration
            }
            fee={
              modules?.overview.glance.find(
                (item) => item.label === "Program Fee",
              )?.value ??
              modules?.overview.glance.find((item) => item.label === "Fee")
                ?.value ??
              fee
            }
            certification={
              modules?.overview.glance.find(
                (item) => item.label === "Certification",
              )?.value ?? ""
            }
            featureImages={
              modules?.overview.media.items
                .filter((item) => item.type === "image")
                .map((item) => item.url) ??
              (kirtan.overviewImages.length > 0
                ? kirtan.overviewImages
                : mapped.heroImages.slice(1, 5))
            }
            eyebrow={modules?.overview.eyebrow ?? page.eyebrow}
            title={modules?.overview.title ?? page.title}
            supportingCopy={modules?.overview.supportingCopy ?? ""}
          />
        ) : null}

        {showInclusions ? (
          <WhatIsIncluded
            htmlId={resolveSectionHtmlId("inclusions", modules?.inclusions._id)}
            inclusions={modules?.inclusions.items ?? mapped.inclusions}
            eyebrow={modules?.inclusions.eyebrow}
            title={modules?.inclusions.title}
            description={modules?.inclusions.description}
          />
        ) : null}

        {showEligibility ? (
          <CourseEligibility
            htmlId={resolveSectionHtmlId(
              "eligibility",
              modules?.eligibility._id,
            )}
            requirements={
              modules?.eligibility.requirements ?? kirtan.eligibility
            }
            eyebrow={modules?.eligibility.eyebrow ?? "Who Is This For"}
            title={modules?.eligibility.title ?? "Open to every sincere seeker"}
            description={modules?.eligibility.description}
            showAllianceBadge={modules?.eligibility.showAllianceBadge ?? false}
          />
        ) : null}

        {showSyllabus ? (
          <CourseSyllabus
            htmlId={resolveSectionHtmlId("syllabus", modules?.syllabus._id)}
            description={
              modules?.syllabus.description ?? kirtan.syllabusDescription
            }
            syllabus={modules?.syllabus.chapters ?? kirtan.syllabus}
            sidebar={KIRTAN_SYLLABUS_SIDEBAR}
            subtopicsLabel="What you will learn:"
          />
        ) : null}

        {gallery.length > 0 && <PageGallerySection images={gallery} />}

        {examCertification ? (
          showExam ? (
            <ExamCertification content={examCertification} />
          ) : null
        ) : (
          <KirtanCertificationSection
            description={kirtan.certification}
            images={kirtan.certificationImages}
          />
        )}

        {(modules?.flags.showAccommodation ?? mapped.showAccommodation) ? (
          <>
            <AccommodationFood content={residentialLife} />
          </>
        ) : null}

        {showPricing ? (
          <UpcomingDates
            htmlId={resolveSectionHtmlId("pricing", modules?.pricing._id)}
            duration={modules?.pricing.duration ?? mapped.duration}
            pricing={modules?.pricing.options ?? mapped.pricing}
            pricingDescription={
              modules?.pricing.description ?? mapped.pricingDescription
            }
            batches={modules?.pricing.batches ?? mapped.batches}
            datesTitle="Course dates"
            lodgingTitle="Packages (room & food)"
          />
        ) : null}

        <KirtanHighlightsSection
          highlights={kirtan.highlights}
          images={kirtan.highlightImages}
        />

        {showWhyNirvana ? (
          <WhyNirvana content={whyNirvana} reviews={reviews} />
        ) : null}

        {showInstagram && instagram ? (
          <InstagramFeed content={instagram} />
        ) : null}

        {showFaqs ? (
          <FAQSection
            id={resolveSectionHtmlId("faq", modules?.faqs._id)}
            faqs={modules?.faqs.items ?? mapped.faqs}
            sectionClassName="bg-white"
            eyebrow="Common Questions"
            title={
              <>
                Kirtan training <span className="text-primary">FAQs</span>
              </>
            }
          />
        ) : null}
      </article>
    </>
  );
}
