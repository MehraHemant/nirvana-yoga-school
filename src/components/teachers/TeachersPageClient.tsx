"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import TeacherProfileCard, {
  TEACHER_PAGE_PREVIEW,
} from "@/components/teachers/TeacherProfileCard";
import { Container, SectionHeader } from "@/components/ui";
import { readTeacherDeepLink, teacherSlug } from "@/content/teachers-slug";
import { resolveSectionHtmlId } from "@/lib/html-id";

type TeachersPageClientProps = {
  teachers: TeacherProfile[];
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  /** Optional CMS `_id` for the faculty section (default `faculty`) */
  facultyId?: string;
};

/**
 * Header height used when offsetting in-page teacher scroll targets.
 *
 * @returns Pixel height of the site header, or a safe default
 */
function getHeaderHeight(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 76;
}

/**
 * Faculty magazine layout for `/teacher` — sticky TOC + alternating profile cards.
 * Honors `#slug` / `?teacher=` deep links from teaser “Show more” CTAs.
 *
 * @param props - Teachers, CMS section copy, optional faculty section id
 */
export default function TeachersPageClient({
  teachers,
  sectionEyebrow,
  sectionTitle,
  sectionDescription,
  facultyId,
}: TeachersPageClientProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeSlug, setActiveSlug] = useState(
    () => teacherSlug(teachers[0]?.name ?? ""),
  );
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);
  const sectionClassName =
    "bg-white pb-14 pt-[calc(var(--site-header-height)+3.5rem)] sm:pb-16 sm:pt-[calc(var(--site-header-height)+4rem)] lg:pb-20 lg:pt-[calc(var(--site-header-height)+5rem)]";

  const scrollToTeacher = useCallback(
    (slug: string, behavior?: ScrollBehavior) => {
      const node = document.getElementById(slug);
      if (!node) return;

      const top = Math.max(
        0,
        node.getBoundingClientRect().top +
          window.scrollY -
          getHeaderHeight() -
          24,
      );
      window.scrollTo({
        top,
        behavior: behavior ?? (prefersReducedMotion ? "auto" : "smooth"),
      });
    },
    [prefersReducedMotion],
  );

  /**
   * Applies hash/query deep link: activate TOC, expand profile, scroll into view.
   *
   * @param smooth - When false, jump instantly (initial load)
   */
  const applyDeepLink = useCallback(
    (smooth: boolean) => {
      const ids = teachers.map((t) => teacherSlug(t.name));
      const target = readTeacherDeepLink(ids);
      if (!target) return;
      setActiveSlug(target);
      setOpenedSlug(target);
      scrollToTeacher(target, smooth ? undefined : "auto");
    },
    [scrollToTeacher, teachers],
  );

  useLayoutEffect(() => {
    applyDeepLink(false);
  }, [applyDeepLink]);

  useEffect(() => {
    const onHashChange = () => applyDeepLink(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [applyDeepLink]);

  useEffect(() => {
    const ids = teachers.map((t) => teacherSlug(t.name));
    const line = getHeaderHeight() + 32;

    const onScroll = () => {
      let active = ids[0] ?? "";
      let mostVisible = 0;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        const visible = Math.max(
          0,
          Math.min(bottom, window.innerHeight) - Math.max(top, line),
        );
        if (visible >= mostVisible) {
          mostVisible = visible;
          active = id;
        }
      }
      setActiveSlug(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [teachers]);

  /**
   * TOC / chip selection — scroll to profile and sync the URL hash.
   *
   * @param slug - Faculty profile id
   */
  const selectTeacher = (slug: string) => {
    setActiveSlug(slug);
    scrollToTeacher(slug);
    if (window.location.hash !== `#${slug}`) {
      history.replaceState(null, "", `#${slug}`);
    }
  };

  const facultyHtmlId = resolveSectionHtmlId("faculty", facultyId);

  return (
    <>
      {/* Magazine layout: sticky TOC + scrollable profiles */}
      <section id={facultyHtmlId} className={sectionClassName}>
        <Container size="2xl">
          <SectionHeader
            eyebrow={sectionEyebrow}
            title={sectionTitle}
            description={sectionDescription}
            align="left"
            className="max-w-2xl"
          />

          {/* Mobile TOC */}
          <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {teachers.map((teacher) => {
              const slug = teacherSlug(teacher.name);
              const isActive = activeSlug === slug;
              return (
                <button
                  key={teacher.name}
                  type="button"
                  onClick={() => selectTeacher(slug)}
                  aria-current={isActive ? "true" : undefined}
                  className={`type-ui shrink-0 rounded-full border px-3.5 py-2 font-semibold transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "surface-panel border-ink/8 text-ink"
                  }`}
                >
                  {teacher.name.replace(/^Dr\.\s/, "").split(" ")[0]}
                </button>
              );
            })}
          </div>

          <div className="mt-10 lg:mt-12 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-12 xl:grid-cols-[220px_1fr]">
            {/*
              Sticky must be on the grid item itself (not a nested child of a
              self-start wrapper). Sticky is clipped to its parent; a short
              aside leaves zero travel room for an inner sticky node.
            */}
            <aside className="sticky top-[calc(var(--site-header-height,4.75rem)+1.5rem)] z-10 hidden max-h-[calc(100svh-var(--site-header-height,4.75rem)-3rem)] w-full flex-col overflow-hidden lg:flex">
              <p className="type-eyebrow mb-3 shrink-0 text-muted">Jump to</p>
              <nav
                aria-label="Faculty profiles"
                className="scrollbar-thin-primary min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain pr-1"
              >
                {teachers.map((teacher) => {
                  const slug = teacherSlug(teacher.name);
                  const isActive = activeSlug === slug;
                  return (
                    <button
                      key={teacher.name}
                      type="button"
                      onClick={() => selectTeacher(slug)}
                      aria-current={isActive ? "true" : undefined}
                      className={`type-ui block w-full border-l-2 py-2 pl-3 text-left transition-colors ${
                        isActive
                          ? "border-primary font-semibold text-primary"
                          : "border-transparent text-muted hover:border-ink/20 hover:text-ink"
                      }`}
                    >
                      {teacher.name.replace(/^Dr\.\s/, "")}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Profile stream */}
            <div className="min-w-0 space-y-6">
              {teachers.map((teacher, i) => {
                const slug = teacherSlug(teacher.name);
                return (
                  <TeacherProfileCard
                    key={teacher.name}
                    teacher={teacher}
                    index={i}
                    prefersReducedMotion={prefersReducedMotion}
                    preview={TEACHER_PAGE_PREVIEW}
                    showMoreMode="toggle"
                    defaultExpanded={openedSlug === slug}
                  />
                );
              })}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
