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

type PrerequisiteCardProps = {
  title: string;
  desc: string;
  num: string;
  icon: ElementType;
  delay: number;
};

function PrerequisiteCard({
  title,
  desc,
  num,
  icon: IconComponent,
  delay,
}: PrerequisiteCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      transition={{ duration: 0.4, delay }}
      className="space-y-3 shadow p-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <IconComponent size={14} />
        </div>
        <span className="type-ui text-ink">
          Prerequisite {num}
        </span>
      </div>
      <h4 className="type-h4 text-ink">
        {title}
      </h4>
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
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Column 1 (Left 4-cols): Header & Intro */}
          <div className="lg:col-span-4 space-y-6">
            <SectionHeader eyebrow={eyebrow} title={title} align="left" />
            <p className="type-body text-ink">
              {description}
            </p>
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
          <div className="lg:col-span-4 space-y-10">
            {resolvedRequirements.slice(0, 2).map((req, index) => (
              <PrerequisiteCard
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
          <div className="lg:col-span-4 space-y-10">
            {resolvedRequirements.slice(2, 4).map((req, index) => (
              <PrerequisiteCard
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
      </Container>
    </section>
  );
}
