"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Heading } from "@/components/ui";
import { teacherSlug } from "@/content/teachers-slug";

/** Collapsed preview limits for faculty profile cards. */
export type TeacherCardPreview = {
  education: number;
  experience: number;
  expertise: number;
  /** Rough body-length threshold for the bio line-clamp (~64 chars/line). */
  bioChars: number;
  /** Tailwind line-clamp utility count applied when collapsed. */
  bioLines: number;
};

export const TEACHER_PAGE_PREVIEW: TeacherCardPreview = {
  education: 2,
  experience: 2,
  expertise: 5,
  bioChars: 320,
  bioLines: 5,
};

export const HOMEPAGE_TEACHER_PREVIEW: TeacherCardPreview = {
  education: 2,
  experience: 2,
  expertise: 3,
  bioChars: 384,
  bioLines: 6,
};

/** Compact list columns use `line-clamp-4`. */
const COMPACT_LIST_CLAMP_LINES = 4;

/**
 * Rough line count for CSS line-clamp overflow checks.
 *
 * @param items - List strings (or a single joined expertise string)
 * @param charsPerLine - Approx characters per visual line
 */
function estimateListLines(items: string[], charsPerLine = 40): number {
  return items.reduce((sum, item) => {
    const len = item.trim().length;
    if (len === 0) return sum;
    return sum + Math.max(1, Math.ceil(len / charsPerLine));
  }, 0);
}

type TeacherProfileCardProps = {
  teacher: TeacherProfile;
  /** Alternating image side on the teachers page (even → image right). */
  index?: number;
  prefersReducedMotion?: boolean;
  preview?: TeacherCardPreview;
  /**
   * `toggle` — in-place expand (teachers page).
   * `link` — Show more always navigates to `showMoreHref` (homepage / hub).
   */
  showMoreMode?: "toggle" | "link";
  /** Required when `showMoreMode="link"`. */
  showMoreHref?: string;
  /** Optional article id override (defaults to `teacherSlug(name)`). */
  id?: string;
  /** When true (e.g. deep link), start expanded on the teachers page. */
  defaultExpanded?: boolean;
};

/**
 * Alternating faculty profile card with clamped bio/lists and Show more control.
 *
 * @param props - Teacher profile, layout index, preview clamps, and show-more mode
 */
export default function TeacherProfileCard({
  teacher,
  index = 0,
  prefersReducedMotion: prefersReducedMotionProp,
  preview = TEACHER_PAGE_PREVIEW,
  showMoreMode = "toggle",
  showMoreHref,
  id: idProp,
  defaultExpanded = false,
}: TeacherProfileCardProps) {
  const prefersReducedMotionHook = useReducedMotion();
  const prefersReducedMotion =
    prefersReducedMotionProp ?? prefersReducedMotionHook ?? false;
  const id = idProp ?? teacherSlug(teacher.name);
  const detailsId = `${id}-details`;
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  const imageRight = index % 2 === 0;
  const isLinked = showMoreMode === "link";
  const isExpanded = !isLinked && expanded;

  /** Homepage / hub: compact preview — fixed-size photo, not stretch-fill. */
  const compactMedia = preview === HOMEPAGE_TEACHER_PREVIEW;
  /** Homepage / hub collapsed: clamp Education/Experience/Expertise to 4 lines total. */
  const clampListBlock = compactMedia && !isExpanded;

  const imageSrc = teacher.image.trim();

  const bioNeedsMore = teacher.bio.trim().length > preview.bioChars;
  const listsNeedMoreByCount =
    teacher.education.length > preview.education ||
    teacher.detailedExperience.length > preview.experience ||
    teacher.expertise.length > preview.expertise;
  // Compact CSS line-clamp can ellipsize even when item counts fit the preview.
  const listsNeedMoreByClamp =
    compactMedia &&
    (estimateListLines(teacher.education) > COMPACT_LIST_CLAMP_LINES ||
      estimateListLines(teacher.detailedExperience) >
        COMPACT_LIST_CLAMP_LINES ||
      estimateListLines(
        teacher.expertise.length > 0 ? [teacher.expertise.join(", ")] : [],
      ) > COMPACT_LIST_CLAMP_LINES);

  const canExpand =
    bioNeedsMore || listsNeedMoreByCount || listsNeedMoreByClamp;

  // Homepage/hub: show all list items (line-clamp handles overflow). Teachers page: slice when collapsed.
  const educationItems =
    isExpanded || compactMedia
      ? teacher.education
      : teacher.education.slice(0, preview.education);
  const experienceItems =
    isExpanded || compactMedia
      ? teacher.detailedExperience
      : teacher.detailedExperience.slice(0, preview.experience);
  const expertiseItems =
    isExpanded || compactMedia
      ? teacher.expertise
      : teacher.expertise.slice(0, preview.expertise);

  const bioClampClass =
    isExpanded || !canExpand
      ? ""
      : preview.bioLines >= 6
        ? "line-clamp-6"
        : "line-clamp-5";

  // Compact: definite aspect box (same reliability as directory `h-10 w-10`).
  // Never use `h-full` / `self-stretch` alone — those collapse in min-h-0 flex chains.
  const imageCell = compactMedia ? (
    <div className="relative mx-auto aspect-4/5 w-full max-w-72 shrink-0 overflow-hidden bg-sand sm:mx-0 sm:max-w-64 md:max-w-72">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={teacher.name}
          fill
          sizes="288px"
          className="object-cover object-top"
        />
      ) : null}
    </div>
  ) : (
    <div className="relative h-72 w-full sm:h-80 md:h-96">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={teacher.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-sand" aria-hidden />
      )}
    </div>
  );

  const textCell = (
    <div
      className={
        compactMedia
          ? "flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6"
          : "flex flex-col justify-center p-7 sm:p-8 md:p-10"
      }
    >
      <Heading as="h2" size="h3">
        {teacher.name}
      </Heading>
      <p className="type-eyebrow mt-2 text-ink">{teacher.experienceSummary}</p>
      <p
        className={`type-body leading-relaxed text-ink ${compactMedia ? "mt-3" : "mt-5"} ${bioClampClass}`}
      >
        {teacher.bio}
      </p>
    </div>
  );

  const headerRow = imageRight ? (
    <>
      {textCell}
      {imageCell}
    </>
  ) : (
    <>
      {imageCell}
      {textCell}
    </>
  );

  const showMorePad = compactMedia
    ? "border-t border-ink/8 px-5 py-3 md:px-6"
    : "border-t border-ink/8 px-7 py-4 md:px-9";
  const detailsPad = compactMedia
    ? "px-5 py-4 md:px-6 md:py-5 bg-white transition-colors duration-300"
    : "px-7 py-6 md:px-9 md:py-7 bg-white transition-colors duration-300";

  const showMoreControl =
    isLinked && showMoreHref ? (
      <div className={`shrink-0 ${showMorePad}`}>
        <Link
          href={showMoreHref}
          className="type-ui font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Show more
        </Link>
      </div>
    ) : canExpand && !isLinked ? (
      <div className={`shrink-0 ${showMorePad}`}>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="type-ui font-semibold text-primary transition-colors hover:text-primary/80"
          aria-expanded={expanded}
          aria-controls={detailsId}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    ) : null;

  /**
   * Education / Experience list — bullets always; homepage/hub clamps to 4 lines.
   *
   * @param items - Full list (UI may clip via line-clamp)
   * @param bulletClass - Dot / marker color class
   */
  const detailList = (items: string[], bulletClass: string) => (
    <ul
      className={
        clampListBlock
          ? `line-clamp-4 list-disc space-y-0.5 pl-4 ${bulletClass}`
          : compactMedia
            ? "space-y-1.5"
            : "space-y-2.5"
      }
    >
      {items.map((item) =>
        clampListBlock ? (
          <li key={item} className="type-body leading-snug text-ink">
            {item}
          </li>
        ) : (
          <li key={item} className="flex items-start gap-2.5">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`}
              aria-hidden="true"
            />
            <span className="type-body leading-snug text-ink">{item}</span>
          </li>
        ),
      )}
    </ul>
  );

  const detailsColumns = (
    <div className="grid divide-y divide-secondary/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className={`${detailsPad} hover:bg-primary/2`}>
        <p
          className={`type-eyebrow font-semibold tracking-widest text-primary ${compactMedia ? "mb-2.5" : "mb-4"}`}
        >
          Education
        </p>
        {detailList(
          educationItems,
          clampListBlock ? "marker:text-primary/60" : "bg-primary/60",
        )}
      </div>

      <div className={`${detailsPad} hover:bg-primary/2`}>
        <p
          className={`type-eyebrow font-semibold tracking-widest text-primary ${compactMedia ? "mb-2.5" : "mb-4"}`}
        >
          Experience
        </p>
        {detailList(
          experienceItems,
          clampListBlock ? "marker:text-primary/50" : "bg-primary/50",
        )}
      </div>

      <div className={`${detailsPad} hover:bg-accent/3`}>
        <p
          className={`type-eyebrow font-semibold tracking-widest text-primary/80 ${compactMedia ? "mb-2.5" : "mb-4"}`}
        >
          Expertise
        </p>
        {clampListBlock ? (
          <p className="type-body line-clamp-4 leading-snug text-ink">
            {expertiseItems.join(", ")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {expertiseItems.map((item) => (
              <span
                key={item}
                className="type-ui inline-flex items-center rounded-full border border-accent/35 bg-white px-3 py-1 text-ink transition-all duration-150 hover:border-primary/35 hover:bg-white hover:shadow-2xs"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const detailsBlock = (
    <div
      id={detailsId}
      className={
        compactMedia
          ? "bg-white"
          : "col-span-1 border-t border-ink/8 bg-white sm:col-span-2"
      }
    >
      {detailsColumns}
      {/* Teachers page: Show more stays with details (no fixed-height clip). */}
      {!compactMedia ? showMoreControl : null}
    </div>
  );

  return (
    <motion.article
      id={id}
      className={
        compactMedia
          ? "scroll-mt-28 flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-ink/9 bg-white shadow-card [overflow-anchor:none]"
          : "scroll-mt-28 surface-card overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-soft"
      }
      whileHover={compactMedia || prefersReducedMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {compactMedia ? (
        <>
          {/* shrink-0 header: aspect image has real height; text flexes beside it. */}
          <div className="flex shrink-0 flex-col border-b border-ink/8 sm:flex-row sm:items-center">
            {headerRow}
          </div>
          {/* Lists may clip; Show more is pinned below outside this region. */}
          <div className="min-h-0 flex-1 overflow-hidden bg-white">
            {detailsBlock}
          </div>
          {showMoreControl}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {headerRow}
          {detailsBlock}
        </div>
      )}
    </motion.article>
  );
}
