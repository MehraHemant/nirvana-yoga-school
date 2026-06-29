"use client";

import {
  AccommodationFood,
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  DailySchedule,
  InstagramFeed,
  PageEditorialSection,
  PageGallerySection,
  PageProgramsSection,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { TeachersSection } from "@/components/home";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { FAQSection } from "@/components/ui";
import type { SitePageDocument } from "@/content/types";
import {
  refineTeacherBio,
  refineTeacherSummary,
  type OverviewTitleKey,
} from "@/content/mappers/site-page-copy";
import { mapSitePage } from "@/content/mappers/site-page";

function overviewTitle(key: OverviewTitleKey, eyebrow: string) {
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
          Discover{" "}
          <span className="text-primary">{eyebrow.toLowerCase()}</span> at
          Nirvana
        </>
      );
  }
}

function mapTeachers(people: SitePageDocument["people"]): TeacherProfile[] {
  return (people ?? []).map((person) => ({
    name: person.name,
    experienceSummary: refineTeacherSummary(
      person.summary ?? "Experienced faculty",
    ),
    image:
      person.image ??
      "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=600&auto=format&fit=crop&q=80",
    bio: refineTeacherBio(person.bio ?? ""),
    education: person.education ?? [],
    detailedExperience: person.experience ?? [],
    expertise: person.expertise ?? [],
  }));
}

export default function SitePageLayout({ page }: { page: SitePageDocument }) {
  const mapped = mapSitePage(page);
  const teachers = mapTeachers(page.people);
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

      <article className="min-h-screen max-w-full overflow-x-clip">
        {mapped.overview && (
          <CourseOverview
            overview={mapped.overview}
            level="All levels welcome"
            duration={mapped.duration}
            featureImages={mapped.heroImages.slice(1, 5)}
            eyebrow={copy.overviewEyebrow}
            title={overviewTitle(copy.overviewTitleKey, page.eyebrow)}
            supportingCopy={copy.overviewSupporting ?? ""}
            quoteText={copy.quoteText}
            quoteAttribution={copy.quoteAttribution}
          />
        )}

        {mapped.inclusions.length > 0 && (
          <WhatIsIncluded
            inclusions={mapped.inclusions}
            exclusions={mapped.exclusions}
          />
        )}

        {mapped.schedule.length > 0 && (
          <DailySchedule
            description={mapped.scheduleDescription}
            schedule={mapped.schedule}
          />
        )}

        {mapped.pricing.length > 0 && (
          <UpcomingDates
            duration={mapped.duration}
            pricing={mapped.pricing}
            pricingDescription={mapped.pricingDescription}
            batches={mapped.batches}
            datesTitle={
              page.slug.includes("retreat") ? "Retreat dates" : "Training dates"
            }
            lodgingTitle={
              page.slug.includes("retreat")
                ? "Retreat packages"
                : "Lodging packages"
            }
          />
        )}

        {teachers.length > 0 && <TeachersSection teachers={teachers} />}

        {mapped.programs.length > 0 && (
          <PageProgramsSection cards={mapped.programs} />
        )}

        {mapped.gallery.length > 0 && (
          <PageGallerySection images={mapped.gallery} />
        )}

        {mapped.editorialSections.map((section, index) => (
          <PageEditorialSection
            key={section.title}
            section={section}
            tone={index % 2 === 0 ? "white" : "paper"}
          />
        ))}

        {mapped.showAccommodation && <AccommodationFood />}

        {mapped.showWhyNirvana && <WhyNirvana />}

        {mapped.showTravelGuide && <TravelGuide />}

        {mapped.showInstagram && <InstagramFeed />}

        {mapped.faqs.length > 0 && (
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
        )}
      </article>
    </>
  );
}
