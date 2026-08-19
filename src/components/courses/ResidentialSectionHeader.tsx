"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type ResidentialSectionHeaderProps = {
  /** Small uppercase label above the section title */
  eyebrow?: string;
  /** Serif H2 title (may include accent spans) */
  title: ReactNode;
};

/**
 * Shared residential section header used by Accommodation and Food.
 *
 * @param props - Optional eyebrow and section title node
 */
export function ResidentialSectionHeader({
  eyebrow = "Residential Life",
  title,
}: ResidentialSectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      className="space-y-4 border-b border-ink/5 pb-5"
    >
      <SectionHeader
        eyebrow={eyebrow.trim() || "Residential Life"}
        title={title}
        align="left"
        className="mb-0"
      />
    </motion.div>
  );
}

type ResidentialSectionIntroProps = {
  /** Small uppercase label above the intro title */
  eyebrow: string;
  /** Intro headline */
  title: ReactNode;
  /** Supporting paragraph */
  description: string;
};

/**
 * Shared accent-rule intro block used under the residential section header.
 *
 * @param props - Eyebrow, title, and description copy
 */
export function ResidentialSectionIntro({
  eyebrow,
  title,
  description,
}: ResidentialSectionIntroProps) {
  return (
    <div className="border-l-2 border-secondary/35 pl-4 sm:pl-5">
      <p className="type-eyebrow mb-1.5 text-secondary">{eyebrow}</p>
      <h3 className="mb-2 font-serif text-lg leading-tight text-ink md:text-2xl">
        {title}
      </h3>
      <p className="type-body leading-relaxed text-muted">{description}</p>
    </div>
  );
}
