"use client";

import {
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  DailySchedule,
  UpcomingDates,
  WhatIsIncluded,
} from "@/components/courses";
import { TeachersSection } from "@/components/home";
import { FAQSection } from "@/components/ui";
import { ONLINE_BATCHES } from "./data";
import type { OnlinePageData } from "./types";

export default function OnlineClient({
  course,
  media,
  videos,
}: OnlinePageData) {
  return (
    <>
      <CourseHero
        title={course.title}
        subtitle={course.subtitle}
        duration={course.duration}
        level={course.level}
        certification={course.certification}
        fee={course.fee}
        image={course.image}
        certBadge={course.certBadge}
        heroImages={course.heroImages}
        images={media.images}
        videos={media.videos}
        ctaPrimary={course.ctaPrimary}
        ctaPrimaryHref={course.ctaPrimaryHref}
        ctaSecondary={course.ctaSecondary}
        ctaSecondaryHref={course.ctaSecondaryHref}
      />

      <CourseStickyNav items={course.navItems} />

      <article className="min-h-screen max-w-full overflow-x-clip">
        <CourseOverview
          overview={course.overview}
          level={course.level}
          duration={course.duration}
          certification={course.certification}
          fee={course.fee}
          videos={videos}
          featureImages={course.heroImages?.slice(0, 6)}
          eyebrow="Online YTT"
          title={
            <>
              Learn at your pace,{" "}
              <span className="text-primary">certified</span> from home
            </>
          }
          supportingCopy=""
          quoteText="Traditional yoga wisdom — accessible anywhere in the world."
          quoteAttribution="Online 200-hour program"
        />

        <WhatIsIncluded
          inclusions={course.inclusions}
          exclusions={course.exclusions}
        />

        <CourseSyllabus
          description={course.syllabusDescription}
          syllabus={course.syllabus}
        />

        {course.schedule.length > 0 && (
          <DailySchedule
            description={course.scheduleDescription}
            schedule={course.schedule}
          />
        )}

        {course.teachers.length > 0 && (
          <TeachersSection teachers={course.teachers} />
        )}

        {course.testimonials.length > 0 && (
          <FAQSection
            id="testimonials"
            faqs={course.testimonials.map((item) => ({
              question: item.name,
              answer: item.quote,
            }))}
            sectionClassName="bg-paper"
            eyebrow="Student voices"
            title={
              <>
                Online course <span className="text-primary">reviews</span>
              </>
            }
          />
        )}

        <UpcomingDates
          duration={course.duration}
          pricing={course.pricing}
          pricingDescription={course.pricingDescription}
          batches={ONLINE_BATCHES}
          datesTitle="Enrollment"
          lodgingTitle="Course access"
        />

        <FAQSection
          id="faq"
          faqs={course.faqs}
          sectionClassName="bg-white"
          eyebrow="Got Questions?"
          title={
            <>
              Frequently asked <span className="text-primary">questions</span>
            </>
          }
        />
      </article>
    </>
  );
}
