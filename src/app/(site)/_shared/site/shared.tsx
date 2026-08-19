"use client";

import {
  CourseOverview,
  CourseStickyNav,
  PageEditorialSection,
  PageHeroRenderer,
} from "@/components/courses";
import { FAQSection } from "@/components/ui";
import {
  isSectionLive,
  shouldRenderSection,
} from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { SiteClientProps } from "./types";

export type { SiteClientProps };

/**
 * Site page hero + sticky nav, gated by module live flags.
 *
 * @param props - Page, mapped copy, and modules
 */
export function SiteHero({
  page,
  mapped,
  modules,
}: Pick<SiteClientProps, "page" | "mapped" | "modules">) {
  if (modules) {
    const showHero = isSectionLive(modules.hero);
    const showStickyNav = isSectionLive(modules.stickyNav);
    return (
      <>
        {showHero ? <PageHeroRenderer modules={modules} /> : null}
        {showStickyNav ? (
          <CourseStickyNav items={modules.stickyNav.items} />
        ) : null}
      </>
    );
  }

  const copy = mapped.presentation;

  return (
    <>
      <PageHeroRenderer
        modules={{
          hero: {
            type: "page-minimal",
            eyebrow: page.eyebrow,
            title: page.title,
            subtitle: copy.heroSubtitle,
            heroImage: page.image,
            ctaLabel: mapped.ctaPrimary,
            ctaHref: mapped.ctaPrimaryHref,
          },
          stickyNav: { items: mapped.navItems },
          overview: {
            eyebrow: "",
            title: "",
            lead: "",
            glance: [],
            media: { mode: "image", items: [] },
          },
          inclusions: { items: [] },
          eligibility: { requirements: [] },
          syllabus: { description: "", chapters: [] },
          schedule: { description: "", items: [] },
          pricing: { description: "", options: [] },
          faqs: { items: [] },
          flags: {
            showExam: false,
            showAccommodation: false,
            showWhyNirvana: false,
            showTravel: false,
            showInstagram: false,
            showMap: false,
          },
        }}
      />
      <CourseStickyNav items={mapped.navItems} />
    </>
  );
}

/**
 * Site overview section, gated by module live flag.
 *
 * @param props - Page, mapped copy, and modules
 */
export function SiteOverview({
  page,
  mapped,
  modules,
}: Pick<SiteClientProps, "page" | "mapped" | "modules">) {
  if (modules) {
    if (!isSectionLive(modules.overview)) return null;
    const overview = modules.overview;

    return (
      <CourseOverview
        htmlId={resolveSectionHtmlId("overview", overview._id)}
        overview={overview.lead}
        description={overview.description}
        level=""
        duration={mapped.duration}
        certification=""
        fee=""
        glance={overview.glance}
        heading={overview.heading}
        saying={overview.saying}
        featureImages={overview.media.items
          .filter((item) => item.type === "image")
          .map((item) => item.url)}
        eyebrow={overview.eyebrow}
        title={overview.title}
        supportingCopy={overview.supportingCopy ?? ""}
      />
    );
  }

  if (!mapped.overview) return null;

  const copy = mapped.presentation;

  return (
    <CourseOverview
      overview={mapped.overview}
      level=""
      duration={mapped.duration}
      certification=""
      fee=""
      featureImages={mapped.heroImages.slice(1, 5)}
      eyebrow={copy.overviewEyebrow}
      title={page.title}
      supportingCopy={copy.overviewSupporting ?? ""}
    />
  );
}

export function SiteEditorial({ mapped }: Pick<SiteClientProps, "mapped">) {
  return mapped.editorialSections.map((section, _index) => (
    <PageEditorialSection key={section.title} section={section} />
  ));
}

/**
 * Site FAQ accordion, gated by module live + data.
 *
 * @param props - Mapped FAQs and optional modules
 */
export function SiteFaq({
  mapped,
  modules,
}: Pick<SiteClientProps, "mapped" | "modules">) {
  const faqs = modules?.faqs.items?.length ? modules.faqs.items : mapped.faqs;
  if (!shouldRenderSection(modules?.faqs, faqs.length > 0)) return null;

  return (
    <FAQSection
      id={resolveSectionHtmlId("faq", modules?.faqs._id)}
      faqs={faqs}
      sectionClassName="bg-white"
      eyebrow="Got Questions?"
      title={
        <>
          Frequently asked <span className="text-primary">questions</span>
        </>
      }
    />
  );
}
