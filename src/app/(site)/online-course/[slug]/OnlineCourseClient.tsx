"use client";

import { CourseStickyNav } from "@/components/courses";
import {
  OnlineCourseHero,
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
      <OnlineCourseHero
        title={course.title}
        subtitle={course.subtitle}
        duration={course.duration}
        level={course.level}
        certification={course.certification}
        fee={course.fee}
        image={course.image}
        previewVideoId={previewVideoId}
        ctaPrimary={course.ctaPrimary}
        ctaPrimaryHref={course.ctaPrimaryHref}
        ctaSecondary={course.ctaSecondary}
        ctaSecondaryHref={course.ctaSecondaryHref}
      />

      <OnlineTrustBar />

      <CourseStickyNav items={course.navItems} variant="online" />

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
