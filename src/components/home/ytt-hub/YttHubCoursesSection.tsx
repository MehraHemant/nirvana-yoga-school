"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import { YTT_HUB_COURSES, YTT_HUB_COURSES_INTRO } from "@/data/yttHubPage";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function YttHubCoursesSection() {
  return (
    <section id="courses" className="scroll-mt-28 bg-paper py-14 md:py-16">
      <Container size="2xl" className="mb-8 md:mb-10">
        <SectionHeader
          title={YTT_HUB_COURSES_INTRO.title}
          align="left"
          className="max-w-none"
        />
      </Container>

      <Container size="2xl" className="mb-10 space-y-4 md:mb-12">
        {YTT_HUB_COURSES_INTRO.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="type-body text-muted">
            {paragraph}
          </p>
        ))}
      </Container>

      <Container size="2xl">
        <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
          {YTT_HUB_COURSES.map((course, index) => (
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
