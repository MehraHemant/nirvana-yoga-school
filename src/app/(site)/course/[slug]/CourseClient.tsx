"use client";

import { MapSection } from "@/components";
import {
  AccommodationFood,
  CourseBookingFab,
  CourseEligibility,
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  DailySchedule,
  ExamCertification,
  InstagramFeed,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import { enquireNowHref } from "@/lib/enquire-programs";
import type { CoursePageData } from "./types";

export default function CourseClient({
  course,
  media,
  videos,
}: CoursePageData) {
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
        imageDetails={media.imageDetails}
        videos={media.videos}
      />

      <CourseStickyNav />

      <CourseBookingFab
        fee={course.fee}
        title={course.title}
        href={enquireNowHref(course.title)}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        <CourseOverview
          overview={course.overview}
          level={course.level}
          duration={course.duration}
          certification={course.certification}
          fee={course.fee}
          videos={videos}
        />

        <WhatIsIncluded
          inclusions={course.inclusions}
          exclusions={course.exclusions}
        />

        <CourseEligibility />

        <CourseSyllabus
          description={course.syllabusDescription}
          syllabus={course.syllabus}
        />

        <DailySchedule
          description={course.scheduleDescription}
          schedule={course.schedule}
        />

        <ExamCertification />

        <AccommodationFood />

        <UpcomingDates
          duration={course.duration}
          pricing={course.pricing}
          pricingDescription={course.pricingDescription}
        />

        <WhyNirvana />

        <TravelGuide />

        <InstagramFeed />
        <MapSection className="bg-white" />

        <FAQSection
          faqs={course.faqs}
          categories={COURSE_FAQ_CATEGORIES}
          sectionClassName="bg-white"
          eyebrow="Got Questions?"
          title={
            <>
              Course <span className="text-primary">FAQs</span>
            </>
          }
        />
      </article>
    </>
  );
}
