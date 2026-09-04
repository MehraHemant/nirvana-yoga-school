"use client";

import type { GlanceItem } from "@/content/types/page-modules";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import { motion } from "framer-motion";

/** Normalized glance fact used by Soft Wash Grid. */
export type OverviewSpec = {
  index: string;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
};

/** Props for the Soft Wash Grid glance sheet. */
export type GlanceSoftWashGridProps = {
  /** Normalized fact rows (CMS glance or legacy fallback) */
  specs: OverviewSpec[];
  /** Section eyebrow — defaults to “Course at a glance” */
  eyebrow?: string;
  /** Section title — defaults to “Program essentials” */
  title?: string;
};

/**
 * Maps CMS glance rows into overview fact-sheet specs.
 *
 * @param glance - Overview glance items from page modules
 */
export function glanceToSpecs(glance: GlanceItem[]): OverviewSpec[] {
  return glance
    .filter((item) => Boolean(item.value?.trim()))
    .map((item, index) => ({
      index: String(index + 1).padStart(2, "0"),
      label: item.label,
      value: item.value,
      hint: item.hint?.trim() ? item.hint : undefined,
      highlight: /fee|price|tuition|cost/i.test(item.label),
    }));
}

/**
 * Legacy fallback when no glance rows exist in page modules.
 *
 * @param level - Focus level
 * @param duration - Program duration
 * @param certification - Certification line
 * @param fee - Fee display
 */
export function legacyOverviewSpecs(
  level: string,
  duration: string,
  certification: string,
  fee: string,
): OverviewSpec[] {
  return [
    {
      index: "01",
      label: "Focus Level",
      value: level,
      hint: "All training experience welcome",
    },
    {
      index: "02",
      label: "Immersive Duration",
      value: duration,
      hint: "Full-time ashram residency",
    },
    {
      index: "03",
      label: "Certification",
      value: certification,
      hint: "Worldwide standard credentials",
    },
    {
      index: "04",
      label: "Course Fee",
      value: fee,
      hint: "All-inclusive tuition & board",
      highlight: true,
    },
  ].filter((spec) => Boolean(spec.value?.trim()));
}

/**
 * Responsive column classes so the glance sheet stays even for common counts.
 *
 * @param count - Number of fact cells
 */
function glanceGridClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    case 5:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
    case 6:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }
}

/**
 * Soft Wash Grid cell — elegant primary-to-white full-card wash.
 *
 * @param props - Spec row and stagger index
 */
function WashCell({
  spec,
  index,
}: {
  spec: OverviewSpec;
  index: number;
}) {
  const highlighted = Boolean(spec.highlight);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      custom={index * 0.05}
      variants={fadeUp}
      className={`relative overflow-hidden rounded-2xl border px-5 py-6 sm:px-6 sm:py-7 ${
        highlighted
          ? "border-primary/25 bg-linear-to-br from-primary/18 via-primary/8 to-white"
          : "border-ink/6 bg-linear-to-br from-primary/12 via-primary/5 to-white"
      }`}
    >
      <span
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] ${
          highlighted
            ? "from-primary/20 via-primary/6 to-transparent"
            : "from-primary/14 via-primary/4 to-transparent"
        }`}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] ${
          highlighted
            ? "from-primary/10 via-transparent to-white/80"
            : "from-primary/6 via-transparent to-white/90"
        }`}
        aria-hidden
      />
      <dt
        className={`relative type-eyebrow mb-3 ${
          highlighted ? "text-primary" : "text-ink/45"
        }`}
      >
        {spec.label}
      </dt>
      <dd className="relative flex flex-col gap-1.5">
        <span
          className={`type-display-sm tracking-tight ${
            highlighted
              ? "font-semibold text-primary-dark"
              : "font-semibold text-ink"
          }`}
        >
          {spec.value}
        </span>
        {spec.hint ? (
          <span className="text-sm leading-relaxed text-ink/45">{spec.hint}</span>
        ) : null}
      </dd>
    </motion.div>
  );
}

/**
 * Soft Wash Grid — production course glance sheet with primary/white washes.
 *
 * @param props - Glance sheet props
 */
export default function GlanceSoftWashGrid({
  specs,
  eyebrow = "Course at a glance",
  title = "Program essentials",
}: GlanceSoftWashGridProps) {
  if (specs.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        className="flex flex-col gap-1"
      >
        <p className="type-eyebrow text-primary">{eyebrow}</p>
        <h3 className="type-h3 text-ink">{title}</h3>
      </motion.div>
      <dl className={`grid gap-3 sm:gap-4 ${glanceGridClass(specs.length)}`}>
        {specs.map((spec, index) => (
          <WashCell
            key={`${spec.label}-${spec.index}`}
            spec={spec}
            index={index}
          />
        ))}
      </dl>
    </div>
  );
}
