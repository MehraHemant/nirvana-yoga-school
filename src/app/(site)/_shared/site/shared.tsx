"use client";

import {
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  PageEditorialSection,
} from "@/components/courses";
import { FAQSection } from "@/components/ui";
import type { OverviewTitleKey } from "@/content/mappers/site-page-copy";
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

export function SiteHero({
  page,
  mapped,
}: Pick<SiteClientProps, "page" | "mapped">) {
  const copy = mapped.presentation;

  return (
    <>
      <CourseHero
        variant="page"
        title={page.title}
        subtitle={copy.heroSubtitle}
        image={page.image}
        eyebrow={page.eyebrow}
        heroImages={mapped.heroImages}
        metaItems={mapped.metaItems}
        ctaPrimary={mapped.ctaPrimary}
        ctaPrimaryHref={mapped.ctaPrimaryHref}
        ctaSecondary={mapped.ctaSecondary}
        ctaSecondaryHref={mapped.ctaSecondaryHref}
      />
      <CourseStickyNav items={mapped.navItems} />
    </>
  );
}

export function SiteOverview({
  page,
  mapped,
}: Pick<SiteClientProps, "page" | "mapped">) {
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

export function SiteFaq({ mapped }: Pick<SiteClientProps, "mapped">) {
  if (mapped.faqs.length === 0) return null;

  return (
    <FAQSection
      id="faq"
      faqs={mapped.faqs}
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
