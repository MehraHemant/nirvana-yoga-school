import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  MapSection,
  SimplePage,
  TravelGuide,
  UpcomingDates,
  WhatIsIncluded,
  WhyNirvana,
} from "@/components";
import { TeachersSection } from "@/components/home";
import { COURSE_FAQ_CATEGORIES, FAQSection } from "@/components/ui";
import { getAllPageSlugs, getCourseMedia, getPageBySlug } from "@/content";
import type {
  OnlineCourseDocument,
  ResidentialCourseDocument,
} from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

function courseMetadata(
  title: string,
  description: string,
  image: string,
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Nirvana Yoga School`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageDoc = await getPageBySlug(slug);

  if (pageDoc?.kind === "online") {
    return courseMetadata(
      pageDoc.course.title,
      pageDoc.course.subtitle,
      pageDoc.course.image,
    );
  }

  if (pageDoc?.kind === "residential") {
    return courseMetadata(
      pageDoc.course.title,
      pageDoc.course.subtitle,
      pageDoc.course.image,
    );
  }

  if (pageDoc?.kind === "site") {
    return courseMetadata(
      pageDoc.page.title,
      pageDoc.page.description,
      pageDoc.page.image,
    );
  }

  return { title: "Course Not Found" };
}

const ONLINE_BATCHES = [
  {
    dates: "Start anytime",
    spaces: "Lifetime access · self-paced",
    status: "Open",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    tone: "open" as const,
  },
];

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pageDoc = await getPageBySlug(slug);

  if (!pageDoc) {
    notFound();
  }

  if (pageDoc.kind === "online") {
    const onlineCourse = pageDoc.course as OnlineCourseDocument;
    const media = await getCourseMedia(slug);
    const videos = await fetchYouTubeVideos(
      media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
    );

    return (
      <>
        <CourseHero
          title={onlineCourse.title}
          subtitle={onlineCourse.subtitle}
          duration={onlineCourse.duration}
          level={onlineCourse.level}
          certification={onlineCourse.certification}
          fee={onlineCourse.fee}
          image={onlineCourse.image}
          certBadge={onlineCourse.certBadge}
          heroImages={onlineCourse.heroImages}
          images={media.images}
          videos={media.videos}
          ctaPrimary={onlineCourse.ctaPrimary}
          ctaPrimaryHref={onlineCourse.ctaPrimaryHref}
          ctaSecondary={onlineCourse.ctaSecondary}
          ctaSecondaryHref={onlineCourse.ctaSecondaryHref}
        />

        <CourseStickyNav items={onlineCourse.navItems} />

        <article className="min-h-screen max-w-full overflow-x-clip">
          <CourseOverview
            overview={onlineCourse.overview}
            level={onlineCourse.level}
            duration={onlineCourse.duration}
            certification={onlineCourse.certification}
            fee={onlineCourse.fee}
            videos={videos}
            featureImages={onlineCourse.heroImages?.slice(0, 6)}
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
            inclusions={onlineCourse.inclusions}
            exclusions={onlineCourse.exclusions}
          />

          <CourseSyllabus
            description={onlineCourse.syllabusDescription}
            syllabus={onlineCourse.syllabus}
          />

          {onlineCourse.schedule.length > 0 && (
            <DailySchedule
              description={onlineCourse.scheduleDescription}
              schedule={onlineCourse.schedule}
            />
          )}

          {onlineCourse.teachers.length > 0 && (
            <TeachersSection teachers={onlineCourse.teachers} />
          )}

          {onlineCourse.testimonials.length > 0 && (
            <FAQSection
              id="testimonials"
              faqs={onlineCourse.testimonials.map((item) => ({
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
            duration={onlineCourse.duration}
            pricing={onlineCourse.pricing}
            pricingDescription={onlineCourse.pricingDescription}
            batches={ONLINE_BATCHES}
            datesTitle="Enrollment"
            lodgingTitle="Course access"
          />

          <FAQSection
            id="faq"
            faqs={onlineCourse.faqs}
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

  if (pageDoc.kind === "site") {
    return (
      <>
        <SimplePage page={pageDoc.page} />
        <MapSection />
      </>
    );
  }

  const course = pageDoc.course as ResidentialCourseDocument;
  const media = await getCourseMedia(slug);
  const videos = await fetchYouTubeVideos(
    media.videos.map((id: string) => `https://www.youtube.com/watch?v=${id}`),
  );

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
      />

      <CourseStickyNav />

      <CourseBookingFab fee={course.fee} title={course.title} />

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

        <FAQSection
          faqs={course.faqs}
          categories={COURSE_FAQ_CATEGORIES}
          sectionClassName="bg-paper"
          eyebrow="Got Questions?"
          title={
            <>
              Course <span className="text-primary">FAQs</span>
            </>
          }
        />
      </article>

      <MapSection />
    </>
  );
}
