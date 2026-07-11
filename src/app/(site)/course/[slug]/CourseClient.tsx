"use client";

import { MapSection } from "@/components";
import {
  AccommodationFood,
  CourseBookingFab,
  CourseEligibility,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  DailySchedule,
  ExamCertification,
  InstagramFeed,
  PageHeroRenderer,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components/courses";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import type { CoursePageData } from "./types";

export default function CourseClient({
  course,
  media,
  videos,
  modules,
}: CoursePageData) {
  const m = modules;
  const heroFee = m?.hero.type === "bento-media" ? m.hero.fee : course.fee;
  const overview = m?.overview;
  const glance = overview?.glance ?? [];
  const level = glance.find((g) => g.label === "Level")?.value ?? course.level;
  const duration =
    glance.find((g) => g.label === "Duration")?.value ?? course.duration;
  const certification =
    glance.find((g) => g.label === "Certification")?.value ??
    course.certification;
  const fee =
    glance.find((g) => g.label === "Program Fee")?.value ?? course.fee;

  return (
    <>
      {m ? (
        <PageHeroRenderer modules={m} />
      ) : (
        <PageHeroRenderer
          modules={{
            hero: {
              type: "bento-media",
              title: course.title,
              subtitle: course.subtitle,
              duration: course.duration,
              level: course.level,
              certification: course.certification,
              fee: course.fee,
              certBadge: course.certBadge,
              heroImages: course.heroImages,
              images: media.images,
              imageDetails: media.imageDetails,
              videos: media.videos,
            },
            stickyNav: { items: [] },
            overview: {
              eyebrow: "",
              title: "",
              lead: course.overview,
              glance: [],
              media: { mode: "image", items: [] },
            },
            inclusions: { items: course.inclusions },
            eligibility: { requirements: [] },
            syllabus: { description: "", chapters: [] },
            schedule: { description: "", items: [] },
            pricing: { description: "", options: [] },
            faqs: { items: [] },
            flags: {
              showExam: true,
              showAccommodation: true,
              showWhyNirvana: true,
              showTravel: true,
              showInstagram: true,
              showMap: true,
            },
          }}
        />
      )}

      <CourseStickyNav items={m?.stickyNav.items} />

      <CourseBookingFab
        fee={heroFee ?? course.fee}
        title={course.title}
        href={`/booking?course=${encodeURIComponent(course.slug)}`}
      />

      <article className="min-h-screen max-w-full overflow-x-clip">
        <CourseOverview
          overview={overview?.lead ?? course.overview}
          level={level}
          duration={duration}
          certification={certification}
          fee={fee}
          videos={videos}
          eyebrow={overview?.eyebrow}
          title={overview?.title}
          supportingCopy={overview?.supportingCopy}
          quoteText={overview?.quote?.text}
          quoteAttribution={overview?.quote?.attribution}
          featureImages={
            overview?.media.mode === "carousel"
              ? overview.media.items
                  .filter((item) => item.type === "image")
                  .map((item) => item.url)
              : undefined
          }
        />

        <WhatIsIncluded
          inclusions={m?.inclusions.items ?? course.inclusions}
          exclusions={m?.inclusions.exclusions ?? course.exclusions}
          eyebrow={m?.inclusions.eyebrow}
          title={m?.inclusions.title}
          description={m?.inclusions.description}
        />

        <CourseEligibility
          requirements={m?.eligibility.requirements}
          eyebrow={m?.eligibility.eyebrow}
          title={m?.eligibility.title}
          description={m?.eligibility.description}
          showAllianceBadge={m?.eligibility.showAllianceBadge}
        />

        <CourseSyllabus
          description={m?.syllabus.description ?? course.syllabusDescription}
          syllabus={m?.syllabus.chapters ?? course.syllabus}
        />

        <DailySchedule
          description={m?.schedule.description ?? course.scheduleDescription}
          schedule={m?.schedule.items ?? course.schedule}
        />

        {(m?.flags.showExam ?? true) ? <ExamCertification /> : null}

        {(m?.flags.showAccommodation ?? true) ? <AccommodationFood /> : null}

        <UpcomingDates
          duration={m?.pricing.duration ?? course.duration}
          pricing={m?.pricing.options ?? course.pricing}
          pricingDescription={
            m?.pricing.description ?? course.pricingDescription
          }
          programSlug={course.slug}
          bookingType="course"
        />

        {(m?.flags.showWhyNirvana ?? true) ? <WhyNirvana /> : null}

        {(m?.flags.showTravel ?? true) ? <TravelGuide /> : null}

        {(m?.flags.showInstagram ?? true) ? <InstagramFeed /> : null}

        {(m?.flags.showMap ?? true) ? (
          <MapSection className="bg-white" />
        ) : null}

        <FAQSection
          faqs={m?.faqs.items ?? course.faqs}
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
