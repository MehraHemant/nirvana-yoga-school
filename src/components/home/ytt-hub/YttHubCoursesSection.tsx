"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import type { YttHubContent } from "@/content/types/shared-sections";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YttHubCoursesSectionProps = {
  coursesIntro: YttHubContent["coursesIntro"];
  courses: YttHubContent["courses"];
  /** Public section HTML id (defaults to `courses`) */
  htmlId?: string;
};

/**
 * YTT hub course cards grid — content from MySQL.
 *
 * @param props - Courses intro copy and course cards
 */
export default function YttHubCoursesSection({
  coursesIntro,
  courses,
  htmlId = "courses",
}: YttHubCoursesSectionProps) {
  return (
    <section id={htmlId} className="scroll-mt-28 bg-paper py-14 md:py-16">
      <Container size="2xl" className="mb-8 md:mb-10">
        <SectionHeader
          title={coursesIntro.title}
          align="left"
          className="max-w-none"
        />
      </Container>

      <Container size="2xl" className="mb-10 space-y-4 md:mb-12">
        {coursesIntro.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="type-body text-muted">
            {paragraph}
          </p>
        ))}
      </Container>

      <Container size="2xl">
        <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.href}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
            >
              <CourseCard
                layout="editorial"
                title={course.title}
                description={course.overview}
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
      </Container>
    </section>
  );
}
