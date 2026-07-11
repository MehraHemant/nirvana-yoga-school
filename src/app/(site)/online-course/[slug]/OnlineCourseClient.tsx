"use client";

import { CourseStickyNav, PageHeroRenderer } from "@/components/courses";
import {
  OnlineCurriculumSection,
  OnlineFAQSection,
  OnlineInclusionsSection,
  OnlineOverviewSection,
  OnlinePricingCard,
  OnlineTeachersSection,
  OnlineTestimonialsSection,
  OnlineTrustBar,
} from "@/components/online";
import { Container } from "@/components/ui";
import type { OnlineCoursePageData } from "./types";

export default function OnlineCourseClient({
  course,
  media,
  modules,
}: OnlineCoursePageData) {
  const pricing = course.pricing[0];
  const previewVideoId = media.videos[0];

  const pricingCard = pricing ? (
    <OnlinePricingCard
      pricing={pricing}
      pricingDescription={course.pricingDescription}
      certification={course.certification}
      level={course.level}
      ctaPrimary={course.ctaPrimary}
      ctaPrimaryHref={course.ctaPrimaryHref}
      ctaSecondary={course.ctaSecondary}
      ctaSecondaryHref={course.ctaSecondaryHref}
    />
  ) : null;

  return (
    <div className="online-course-theme bg-white">
      {modules ? (
        <PageHeroRenderer modules={modules} />
      ) : (
        <PageHeroRenderer
          modules={{
            hero: {
              type: "split-copy",
              title: course.title,
              subtitle: course.subtitle,
              metaItems: [
                { label: "Duration", value: course.duration },
                { label: "Level", value: course.level },
                { label: "Certification", value: course.certification },
                { label: "Fee", value: course.fee },
              ],
              ctaPrimary: course.ctaPrimary,
              ctaPrimaryHref: course.ctaPrimaryHref,
              ctaSecondary: course.ctaSecondary,
              ctaSecondaryHref: course.ctaSecondaryHref,
              previewType: previewVideoId ? "video" : "image",
              previewUrl: previewVideoId ?? course.image,
            },
            stickyNav: { items: course.navItems },
            overview: {
              eyebrow: "",
              title: "",
              lead: course.overview,
              glance: [],
              media: { mode: "image", items: [] },
            },
            inclusions: { items: course.inclusions },
            eligibility: { requirements: [] },
            syllabus: { description: "", chapters: course.syllabus },
            schedule: { description: "", items: [] },
            pricing: { description: "", options: course.pricing },
            faqs: { items: course.faqs },
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
      )}

      <OnlineTrustBar />

      <CourseStickyNav
        items={modules?.stickyNav.items ?? course.navItems}
        variant="online"
      />

      <Container size="2xl">
        <div className="online-course-layout">
          <main className="online-course-main min-w-0">
            <OnlineOverviewSection overview={course.overview} />
            <OnlineInclusionsSection inclusions={course.inclusions} />

            {pricingCard && (
              <div className="border-b border-secondary/10 py-8 lg:hidden">
                {pricingCard}
              </div>
            )}

            <OnlineCurriculumSection
              description={course.syllabusDescription}
              syllabus={course.syllabus}
            />

            <OnlineTeachersSection teachers={course.teachers} />

            <OnlineTestimonialsSection testimonials={course.testimonials} />

            <OnlineFAQSection faqs={course.faqs} />
          </main>

          {pricingCard && (
            <aside className="online-course-sidebar hidden lg:block">
              {pricingCard}
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
}
