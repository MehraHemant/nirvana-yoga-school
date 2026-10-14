"use client";

import { motion, type Variants } from "framer-motion";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import OnlineSectionShell from "./OnlineSectionShell";
import { OnlineTeacherCard } from "./OnlineTeacherCards";

const TEACHERS_DESCRIPTION =
  "Learn from experienced faculty rooted in traditional lineages — available throughout your self-paced training.";

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

type OnlineTeachersSectionProps = {
  teachers: TeacherProfile[];
};

/**
 * Faculty count label for the section eyebrow.
 *
 * @param count - Number of selected teachers
 */
function facultyEyebrow(count: number): string {
  return `${String(count).padStart(2, "0")} faculty`;
}

/**
 * Online course teachers band — quiet header and compact equal-size cards.
 *
 * @param teachers - Faculty list for this course (CMS selected slugs)
 */
export default function OnlineTeachersSection({
  teachers,
}: OnlineTeachersSectionProps) {
  if (teachers.length === 0) return null;

  return (
    <OnlineSectionShell
      id="teachers"
      eyebrow={facultyEyebrow(teachers.length)}
      title="Teachers who guide this course"
      description={TEACHERS_DESCRIPTION}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={listVariants}
        className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
      >
        {teachers.map((teacher, index) => (
          <OnlineTeacherCard
            key={teacher.name}
            teacher={teacher}
            priority={index === 0}
          />
        ))}
      </motion.div>
    </OnlineSectionShell>
  );
}
