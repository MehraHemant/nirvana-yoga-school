"use client";

import {
  CourseOverview,
  CourseStickyNav,
  PageEditorialSection,
  PageHeroRenderer,
} from "@/components/courses";
import { FAQSection } from "@/components/ui";
import type { OverviewTitleKey } from "@/content/mappers/site-page-copy";
import { isSectionLive, shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import type { SiteClientProps } from "./types";

export type { SiteClientProps };

function siteOverviewTitle(key: OverviewTitleKey, eyebrow: string) {
  switch (key) {
    case "retreat-3":
      return (
        <>
          A short <span className="text-primary">Himalayan</span> reset
        </>
      );
    case "retreat-5":
      return (
        <>
          Five days to <span className="text-primary">restore</span> & renew
        </>
      );
    case "retreat-7":
      return (
        <>
          A week of <span className="text-primary">deep</span> immersion
        </>
      );
    case "ytt-hub":
      return (
        <>
          Train where yoga <span className="text-primary">began</span>
        </>
      );
    case "teachers":
      return (
        <>
          Lineage teachers, <span className="text-primary">living</span>{" "}
          tradition
        </>
      );
    case "about":
      return (
        <>
          Our story in <span className="text-primary">Rishikesh</span>
        </>
      );
    default:
      return (
        <>
          Discover <span className="text-primary">{eyebrow.toLowerCase()}</span>{" "}
          at Nirvana
        </>
      );
  }
}

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
        level="All levels welcome"
        duration={mapped.duration}
        featureImages={overview.media.items
          .filter((item) => item.type === "image")
          .map((item) => item.url)}
        eyebrow={overview.eyebrow}
        title={overview.title}
        supportingCopy={overview.supportingCopy ?? ""}
        quoteText={overview.quote?.text}
        quoteAttribution={overview.quote?.attribution}
      />
    );
  }

  if (!mapped.overview) return null;

  const copy = mapped.presentation;

  return (
    <CourseOverview
      overview={mapped.overview}
      level="All levels welcome"
      duration={mapped.duration}
      featureImages={mapped.heroImages.slice(1, 5)}
      eyebrow={copy.overviewEyebrow}
      title={siteOverviewTitle(copy.overviewTitleKey, page.eyebrow)}
      supportingCopy={copy.overviewSupporting ?? ""}
      quoteText={copy.quoteText}
      quoteAttribution={copy.quoteAttribution}
    />
  );
}

export function SiteEditorial({ mapped }: Pick<SiteClientProps, "mapped">) {
  return mapped.editorialSections.map((section, index) => (
    <PageEditorialSection
      key={section.title}
      section={section}
      tone={index % 2 === 0 ? "white" : "paper"}
    />
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
