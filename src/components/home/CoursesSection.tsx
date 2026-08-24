"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import type { HomeCoursesSectionContent } from "@/content/types/dedicated-pages";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
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
  content = createEmptyHomePageContent().courses,
}: CoursesSectionProps = {}) {
  const cards = content.cards?.length ? content.cards : [];
  if (cards.length === 0) return null;

  return (
    <section
      id={resolveSectionHtmlId("courses", content._id)}
      className="scroll-mt-28 bg-white section-padding-y mb-14"
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
            descriptionClassName="text-ink"
          />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6 xl:gap-7 items-start">
          {cards.map((course, index) => {
            const staggerClass =
              index % 3 === 1
                ? "lg:translate-y-10 xl:translate-y-8 2xl:translate-y-12"
                : index % 3 === 2
                  ? "lg:translate-y-5 xl:translate-y-4 2xl:translate-y-6"
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
