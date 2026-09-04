"use client";

import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { Container, SectionHeader } from "@/components/ui";
import {
  BookOpen,
  Check,
  Compass,
  Leaf,
  Shield,
  Users,
  YogaAllianceSeal,
} from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type Requirement = {
  title: string;
  desc: string;
  num: string;
  sort?: number;
  icon?: ElementType;
};

/**
 * Orders requirements by `sort`, falling back to list order.
 *
 * @param requirements - Eligibility cards from CMS or defaults
 */
function sortRequirements(requirements: Requirement[]): Requirement[] {
  return requirements
    .map((req, index) => ({ req, index }))
    .sort((a, b) => {
      const sortA = a.req.sort ?? a.index * 10;
      const sortB = b.req.sort ?? b.index * 10;
      return sortA - sortB;
    })
    .map(({ req }) => req);
}

type CourseEligibilityProps = {
  /** Override default YTT prerequisite cards */
  requirements?: Requirement[];
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  /** Hide Yoga Alliance seal badge in sidebar */
  showAllianceBadge?: boolean;
  /** Public section HTML id (defaults to `eligibility`) */
  htmlId?: string;
};

const DEFAULT_REQUIREMENTS: Requirement[] = [
  {
    title: "Practitioner Level",
    desc: "Perfect for beginner to intermediate practitioners wishing to deepen their practice, learn alignment, and obtain credentials to teach. No prior teaching experience required.",
    num: "0",
    icon: BookOpen,
  },
  {
    title: "Sincere Will to Grow",
    desc: "Applicants should nurture a genuine study of and dedication to living by yoga, supporting balance, mindfulness, and inner peace.",
    num: "1",
    icon: Compass,
  },
  {
    title: "Language Proficiency",
    desc: "Courses are conducted fully in English. A basic understanding is required to participate in lectures, philosophy debates, and teaching practicums.",
    num: "2",
    icon: Check,
  },
  {
    title: "Age Guideline",
    desc: "To ensure the maturity, responsibility, and physical preparedness required for intensive ashram living, applicants must be at least 16 years of age.",
    num: "3",
    icon: Shield,
  },
];

const FALLBACK_ICONS = [BookOpen, Compass, Leaf, Users];

type PrerequisiteItemProps = {
  title: string;
  desc: string;
  num: string;
  icon: ElementType;
  delay: number;
};

/**
 * Quiet eligibility row inside the outer section card.
 *
 * @param props - Requirement copy, icon, and motion delay
 */
function PrerequisiteItem({
  title,
  desc,
  num,
  icon: IconComponent,
  delay,
}: PrerequisiteItemProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      transition={{ duration: 0.4, delay }}
      className="space-y-3 rounded-2xl bg-white/55 px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <IconComponent size={14} />
        </div>
        <span className="type-ui text-ink/70">Prerequisite {num}</span>
      </div>
      <h4 className="type-h4 text-ink">{title}</h4>
      <p className="type-body text-ink">{desc}</p>
    </motion.div>
  );
}

/**
 * Eligibility / admissions grid — defaults to YTT prerequisites, overridable per program.
 *
 * @param props - Optional copy and requirement cards
 */
export default function CourseEligibility({
  requirements = DEFAULT_REQUIREMENTS,
  eyebrow = "Admissions Guidelines",
  title = (
    <>
      Admission <br className="hidden lg:block" />
      <span className="text-primary">Standards</span>
    </>
  ),
  description = "We look beyond athletic metrics to ensure students are prepared physically, mentally, and emotionally for intensive ashram living.",
  showAllianceBadge = true,
  htmlId = "eligibility",
}: CourseEligibilityProps) {
  const resolvedRequirements = sortRequirements(requirements).map(
    (req, index) => ({
      ...req,
      icon: req.icon ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length],
    }),
  );

  return (
    <section id={htmlId} className="py-20 sm:py-28 bg-white overflow-hidden">
      <Container size="2xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/12 bg-linear-to-br from-primary/12 via-primary/5 to-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgb(163_36_50/0.1),transparent_55%)]"
            aria-hidden
          />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">
            {/* Column 1 (Left 4-cols): Header & Intro */}
            <div className="lg:col-span-4 space-y-6">
              <SectionHeader eyebrow={eyebrow} title={title} align="left" />
              <p className="type-body text-ink">{description}</p>
              {showAllianceBadge && (
                <div className="pt-4 border-t border-ink/10 flex items-center gap-3">
                  <div className="text-primary/70 select-none">
                    <YogaAllianceSeal size={38} />
                  </div>
                  <div className="type-ui text-ink">
                    <span className="font-semibold text-ink block">
                      RYS 200/300/500
                    </span>
                    Yoga Alliance Certified curriculum and standards.
                  </div>
                </div>
              )}
            </div>

            {/* Column 2 (Middle 4-cols): Req 1 & 2 */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
              {resolvedRequirements.slice(0, 2).map((req, index) => (
                <PrerequisiteItem
                  key={req.title}
                  title={req.title}
                  desc={req.desc}
                  num={req.num}
                  icon={req.icon}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Column 3 (Right 4-cols): Req 3 & 4 */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
              {resolvedRequirements.slice(2, 4).map((req, index) => (
                <PrerequisiteItem
                  key={req.title}
                  title={req.title}
                  desc={req.desc}
                  num={req.num}
                  icon={req.icon}
                  delay={(index + 2) * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
