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
 * YTT hub course cards grid — cards resolve from course entities at page load.
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
    <section id={htmlId} className="scroll-mt-28 bg-sand py-20 md:py-28">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-12 max-w-3xl md:mb-16"
        >
          <SectionHeader
            eyebrow={coursesIntro.eyebrow?.trim() || "Programs"}
            title={coursesIntro.title}
            description={description}
            align="left"
            className="max-w-none"
          />
          {supporting.length > 0 ? (
            <div className="mt-5 space-y-4 border-t border-ink/8 pt-5">
              {supporting.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="type-body leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
          {courses.length > 0 ? (
            <p className="mt-6 type-eyebrow text-primary">
              {courses.length} programs
            </p>
          ) : null}
        </motion.div>

        {courses.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {courses.map((course, index) => (
              <motion.div
                key={course.courseSlug || course.href || course.title || index}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
                variants={fadeUp}
                custom={index * 0.06}
              >
                <CourseCard
                  layout="editorial"
                  title={course.title}
                  description={course.description || course.overview}
                  duration={course.duration}
                  level={course.level}
                  certification={course.certification}
                  fee={course.fee}
                  image={course.image}
                  certBadge={course.certBadge}
                  href={course.href}
                  highlights={course.focusAreas}
                  index={index}
                  revealDelay={index * 60}
                />
              </motion.div>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
