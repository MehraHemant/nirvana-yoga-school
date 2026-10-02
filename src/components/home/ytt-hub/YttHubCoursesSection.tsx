"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import type {
  ResolvedYttHubCourse,
  YttHubContent,
} from "@/content/types/shared-sections";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YttHubCoursesSectionProps = {
  coursesIntro: YttHubContent["coursesIntro"];
  /** Resolved course cards (entity fields + optional placement description) */
  courses: ResolvedYttHubCourse[];
  /** Public section HTML id (defaults to `courses`) */
  htmlId?: string;
};

/**
 * Hub course cards grid (YTT + online) — same stacked cards as the homepage.
 *
 * @param props - Courses intro copy and resolved course cards
 */
export default function YttHubCoursesSection({
  coursesIntro,
  courses,
  htmlId = "courses",
}: YttHubCoursesSectionProps) {
  const paragraphs = coursesIntro.paragraphs.filter((p) => p.trim());
  const description = paragraphs[0] || undefined;
  const supporting = paragraphs.slice(1);

  if (!coursesIntro.title.trim() && courses.length === 0) return null;

  return (
    <section id={htmlId} className="scroll-mt-28 bg-white section-padding-y-courses">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-10 max-w-7xl md:mb-12"
        >
          <SectionHeader
            eyebrow={coursesIntro.eyebrow?.trim() || "Programs"}
            title={coursesIntro.title}
            description={description}
            align="left"
            descriptionClassName="text-ink"
            className="max-w-none"
          />
          {supporting.length > 0 ? (
            <div className="mt-5 space-y-4 border-t border-ink/8 pt-3">
              {supporting.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="type-body text-ink"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
          {courses.length > 0 ? (
            <p className="mt-5 type-eyebrow mb-4 text-primary">
              {courses.length} programs
            </p>
          ) : null}
        </motion.div>

        {courses.length > 0 ? (
          <div className="grid items-start gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6 xl:gap-7">
            {courses.map((course, index) => {
              const staggerClass =
                index % 3 === 1
                  ? "lg:translate-y-10 xl:translate-y-8 2xl:translate-y-12"
                  : index % 3 === 2
                    ? "lg:translate-y-5 xl:translate-y-4 2xl:translate-y-6"
                    : "";

              return (
                <CourseCard
                  key={course.courseSlug || course.href || course.title || index}
                  title={course.title}
                  duration={course.duration}
                  level={course.level}
                  certification={course.certification}
                  fee={course.fee}
                  image={course.image}
                  certBadge={course.certBadge}
                  href={course.href}
                  highlights={course.focusAreas}
                  index={index}
                  revealDelay={index * 100}
                  className={staggerClass}
                />
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
