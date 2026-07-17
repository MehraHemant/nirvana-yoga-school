"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeCoursesSectionContent } from "@/content/types/dedicated-pages";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type CoursesSectionProps = {
  /** Full CMS courses section (header + cards) */
  content?: HomeCoursesSectionContent;
};

/**
 * Homepage residential course cards grid driven by CMS content.
 *
 * @param props - Optional CMS courses section
 */
export default function CoursesSection({
  content = DEFAULT_HOME_PAGE_CONTENT.courses,
}: CoursesSectionProps = {}) {
  const cards =
    content.cards?.length > 0
      ? content.cards
      : DEFAULT_HOME_PAGE_CONTENT.courses.cards;

  return (
    <section
      id={resolveSectionHtmlId("courses", content._id)}
      className="scroll-mt-28 bg-paper py-12 sm:py-14 lg:py-16 mb-14"
    >
      <Container size="2xl">
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:mb-10 md:mb-14 lg:flex-row lg:items-end lg:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow={content.eyebrow}
            align="center"
            title={content.title}
            description={content.description}
          />
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 items-start">
          {cards.map((course, index) => {
            const staggerClass =
              index % 3 === 1
                ? "lg:translate-y-12"
                : index % 3 === 2
                  ? "lg:translate-y-6"
                  : "";

            return (
              <CourseCard
                key={course.href}
                {...course}
                index={index}
                revealDelay={index * 100}
                className={staggerClass}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
