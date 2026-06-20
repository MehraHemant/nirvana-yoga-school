import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AccommodationFood,
  CourseEligibility,
  CourseFAQ,
  CourseHero,
  CourseOverview,
  CourseStickyNav,
  CourseSyllabus,
  DailySchedule,
  ExamCertification,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
} from "@/components";
import { COURSES_DATA } from "@/data/coursesData";
import { COURSES_MEDIA } from "@/data/coursesMedia";
import { fetchYouTubeVideos } from "@/lib/youtube";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Statically generate parameters for Next.js build optimization
export async function generateStaticParams() {
  return Object.keys(COURSES_DATA).map((slug) => ({
    slug,
  }));
}

// Generate dynamic SEO metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = COURSES_DATA[slug];

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: course.title,
    description: course.subtitle,
    openGraph: {
      title: `${course.title} | Nirvana Yoga School`,
      description: course.subtitle,
      images: [
        {
          url: course.image,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = COURSES_DATA[slug];

  if (!course) {
    notFound();
  }

  const media = COURSES_MEDIA[slug] || { images: [], videos: [] };
  const videos = await fetchYouTubeVideos(
    media.videos.map((id: string) => `https://www.youtube.com/watch?v=${id}`),
  );

  return (
    <article className="min-h-screen bg-sand">
      {/* 1. Hero banner section with details card */}
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
      />

      {/* Sticky Sub-Navigation */}
      <CourseStickyNav />

      {/* 2. Overview description and key outcomes */}
      <CourseOverview
        overview={course.overview}
        level={course.level}
        duration={course.duration}
        certification={course.certification}
        fee={course.fee}
        videos={videos}
      />

      {/* 3. Inclusions & Exclusions card blocks */}
      <WhatIsIncluded
        inclusions={course.inclusions}
        exclusions={course.exclusions}
      />

      {/* 4. Eligibility rules */}
      <CourseEligibility />

      {/* 5. Syllabus detail accordions */}
      <CourseSyllabus
        description={course.syllabusDescription}
        syllabus={course.syllabus}
      />

      {/* 6. Timetable stepper timeline */}
      <DailySchedule
        description={course.scheduleDescription}
        schedule={course.schedule}
      />

      {/* 7. Exam and certification details */}
      <ExamCertification />

      {/* 8. Ashram accommodation & organic food display */}
      <AccommodationFood />

      {/* 9. Upcoming calendar dates & Room package selection */}
      <UpcomingDates
        duration={course.duration}
        pricing={course.pricing}
        pricingDescription={course.pricingDescription}
      />

      {/* 10. Travel guide logistics */}
      <TravelGuide />

      {/* 11. Course FAQ accordion */}
      <CourseFAQ faqs={course.faqs} />
    </article>
  );
}
