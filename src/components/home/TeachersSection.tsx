"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import TeacherProfileCard, {
  HOMEPAGE_TEACHER_PREVIEW,
} from "@/components/teachers/TeacherProfileCard";
import { Container, SectionHeader } from "@/components/ui";
import { teacherPageHref, teacherSlug } from "@/content/teachers-slug";
import { resolveSectionHtmlId } from "@/lib/html-id";

export type TeacherProfile = {
  name: string;
  experienceSummary: string;
  image: string;
  bio: string;
  education: string[];
  detailedExperience: string[];
  expertise: string[];
};

type TeachersSectionProps = {
  /** Faculty profiles from MySQL (`page_people` on the teacher page) */
  teachers?: TeacherProfile[];
  /** Homepage section eyebrow */
  eyebrow?: string;
  /** Homepage section title (plain; accent span stays in markup when default) */
  title?: React.ReactNode;
  /** Homepage section description */
  description?: string;
  /** Optional CMS section `_id` (falls back to `teachers`) */
  sectionId?: string;
};

/**
 * Scrolls `item` into view inside `container` only — never the window.
 * Prefer this over `scrollIntoView`, which scrolls every ancestor scrollport.
 *
 * @param container - Scrollable faculty directory / chip row
 * @param item - Selected control
 */
function scrollChildIntoContainer(
  container: HTMLElement,
  item: HTMLElement,
): void {
  const cRect = container.getBoundingClientRect();
  const iRect = item.getBoundingClientRect();

  if (iRect.top < cRect.top) {
    container.scrollTop -= cRect.top - iRect.top;
  } else if (iRect.bottom > cRect.bottom) {
    container.scrollTop += iRect.bottom - cRect.bottom;
  }

  if (iRect.left < cRect.left) {
    container.scrollLeft -= cRect.left - iRect.left;
  } else if (iRect.right > cRect.right) {
    container.scrollLeft += iRect.right - cRect.right;
  }
}

/**
 * Homepage / hub teachers strip — profiles must be passed from a server loader.
 * Directory selection is click-only (no auto-rotate) to keep page scroll stable.
 * Show more links to `/teacher#slug`.
 *
 * @param props - Teachers list and optional section header from CMS
 */
export default function TeachersSection({
  teachers: teachersProp = [],
  eyebrow = "Our Spiritual Indian Gurus",
  title,
  description = "Meet our experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh.",
  sectionId,
}: TeachersSectionProps) {
  const teachers = teachersProp;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const directoryNavRef = useRef<HTMLElement>(null);

  const resolvedTitle = title ?? (
    <>
      Lineage Teachers,{" "}
      <span className="font-normal text-primary">Guided by Compassion</span>
    </>
  );

  if (teachers.length === 0) return null;

  const selected = teachers[selectedIdx] ?? teachers[0];
  const selectedSlug = teacherSlug(selected.name);

  /**
   * Manual directory selection — updates the card and keeps the row visible
   * inside the directory scroller without moving the page.
   *
   * @param index - Teacher index in `teachers`
   * @param button - Clicked directory button
   */
  const selectTeacher = (index: number, button: HTMLButtonElement) => {
    setSelectedIdx(index);
    button.focus({ preventScroll: true });
    const nav = directoryNavRef.current;
    if (nav) scrollChildIntoContainer(nav, button);
  };

  return (
    <section
      id={resolveSectionHtmlId("teachers", sectionId)}
      className="relative overflow-x-hidden bg-white py-12 sm:py-14 lg:py-16 w-full [overflow-anchor:none]"
    >
      <Container size="2xl" className="w-full relative z-10">
        <div className="w-full text-center mb-12 sm:mb-16 lg:mb-10">
          <SectionHeader
            eyebrow={eyebrow}
            title={resolvedTitle}
            description={description}
            align="center"
            className="mx-auto max-w-3xl"
          />
        </div>

        {/* Desktop: directory + single selected profile card (click-only; no auto-rotate) */}
        <div className="hidden lg:grid h-[min(560px,calc(100svh-var(--site-header-height,4.75rem)-3rem))] grid-cols-[minmax(240px,0.9fr)_minmax(0,2.2fr)] items-stretch gap-8">
          <aside className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white">
            <p className="type-eyebrow shrink-0 border-b border-ink/6 px-4 pb-2.5 pt-3.5 text-left text-muted">
              Faculty Directory
            </p>
            <nav
              ref={directoryNavRef}
              aria-label="Faculty directory"
              className="scrollbar-thin-primary min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain p-2 pr-1.5 [overflow-anchor:none]"
            >
              {teachers.map((teacher, index) => {
                const isSelected = selectedIdx === index;
                return (
                  <button
                    key={`spotlight-btn-${index}-${teacher.name}`}
                    onClick={(event) =>
                      selectTeacher(index, event.currentTarget)
                    }
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    className={`relative flex w-full cursor-pointer items-center gap-3 rounded-r-xl py-2.5 pr-3 pl-3 text-left transition-colors duration-200 ${
                      isSelected
                        ? "bg-primary/8 text-ink"
                        : "text-ink hover:bg-ink/3"
                    }`}
                  >
                    {isSelected ? (
                      <span
                        className="absolute top-2.5 bottom-2.5 left-0 w-0.5 rounded-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    <div
                      className={`relative z-10 h-10 w-10 shrink-0 overflow-hidden rounded-full border shadow-2xs ${
                        isSelected
                          ? "border-primary/30 ring-2 ring-primary/12"
                          : "border-ink/10"
                      }`}
                    >
                      <Image
                        src={teacher.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="relative z-10 min-w-0">
                      <h4
                        className={`type-ui truncate ${
                          isSelected
                            ? "font-semibold text-primary"
                            : "font-medium text-ink"
                        }`}
                      >
                        {teacher.name}
                      </h4>
                      <p className="type-eyebrow mt-0.5 truncate text-muted">
                        {teacher.experienceSummary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* overflow-visible so Show more is not clipped; card manages its own clip. */}
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSlug}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex h-full min-h-0 flex-col"
              >
                <TeacherProfileCard
                  teacher={selected}
                  index={0}
                  prefersReducedMotion={prefersReducedMotion}
                  preview={HOMEPAGE_TEACHER_PREVIEW}
                  showMoreMode="link"
                  showMoreHref={teacherPageHref(selected.name)}
                  id="home-teacher-profile"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile / tablet: chip directory + single selected card */}
        <div className="flex flex-col gap-5 lg:hidden w-full">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 [overflow-anchor:none]">
            {teachers.map((teacher, index) => {
              const isSelected = selectedIdx === index;
              return (
                <button
                  key={`mobile-chip-${index}-${teacher.name}`}
                  type="button"
                  onClick={(event) => {
                    setSelectedIdx(index);
                    event.currentTarget.focus({ preventScroll: true });
                    const row = event.currentTarget.parentElement;
                    if (row) scrollChildIntoContainer(row, event.currentTarget);
                  }}
                  className={`type-ui shrink-0 rounded-full border px-3.5 py-2 font-semibold transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "surface-panel border-ink/8 text-ink"
                  }`}
                >
                  {teacher.name.replace(/^Dr\.\s/, "").split(" ")[0]}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-${selectedSlug}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <TeacherProfileCard
                teacher={selected}
                index={0}
                prefersReducedMotion={prefersReducedMotion}
                preview={HOMEPAGE_TEACHER_PREVIEW}
                showMoreMode="link"
                showMoreHref={teacherPageHref(selected.name)}
                id="home-m-teacher-profile"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
