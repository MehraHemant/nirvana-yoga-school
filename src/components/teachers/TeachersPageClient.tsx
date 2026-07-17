"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Container, Heading, SectionHeader } from "@/components/ui";
import { teacherSlug } from "@/content/teachers-slug";
import {
  optionalSectionHtmlId,
  resolveSectionHtmlId,
} from "@/lib/html-id";
import { EASE_OUT, reducedTransition } from "@/lib/motion";

type TeachersPageClientProps = {
  teachers: TeacherProfile[];
  heroImage: string;
  eyebrow: string;
  title: string;
  lead: string;
  quote: string;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  /** Optional CMS `_id` for the hero band */
  heroId?: string;
  /** Optional CMS `_id` for the faculty section (default `faculty`) */
  facultyId?: string;
};

function getHeaderHeight(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 76;
}

function TeacherArticle({
  teacher,
  index,
  prefersReducedMotion,
}: {
  teacher: TeacherProfile;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const id = teacherSlug(teacher.name);
  // Even index (0,2,4…) → name/bio LEFT, image RIGHT
  // Odd index  (1,3,5…) → image LEFT,   name/bio RIGHT
  const imageRight = index % 2 === 0;

  const imageCell = (
    <div className="relative h-72 w-full sm:h-80 md:h-96">
      <Image
        src={teacher.image}
        alt={teacher.name}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover object-top"
      />
    </div>
  );

  const textCell = (
    <div className="flex flex-col justify-center p-7 sm:p-8 md:p-10">
      <Heading as="h2" size="h3">
        {teacher.name}
      </Heading>
      <p className="type-eyebrow mt-2 text-muted">
        {teacher.experienceSummary}
      </p>
      <p className="type-body mt-5 leading-relaxed text-ink">{teacher.bio}</p>
    </div>
  );

  return (
    <motion.article
      id={id}
      className="scroll-mt-28 surface-card overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-soft"
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/*
        2 × 2 grid on sm+:
          top row  → [text | image]  or  [image | text]  (alternates by index)
          bottom   → spans full width: Education / Experience / Expertise
        Mobile: stacked (image always on top for visual impact).
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Top row — swap DOM order to achieve alternating layout */}
        {imageRight ? (
          <>
            {textCell}
            {imageCell}
          </>
        ) : (
          <>
            {imageCell}
            {textCell}
          </>
        )}

        {/* Bottom row: 3-column details strip, no inner cards */}
        <div className="col-span-1 border-t border-ink/8 bg-white sm:col-span-2">
          <div className="grid divide-y divide-secondary/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Education */}
            <div className="px-7 py-6 md:px-9 md:py-7 bg-white transition-colors duration-300 hover:bg-primary/[0.02]">
              <p className="type-eyebrow mb-4 font-semibold tracking-widest text-primary">
                Education
              </p>
              <ul className="space-y-2.5">
                {teacher.education.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                      aria-hidden="true"
                    />
                    <span className="type-body leading-snug text-ink/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience */}
            <div className="px-7 py-6 md:px-9 md:py-7 bg-white transition-colors duration-300 hover:bg-primary/[0.02]">
              <p className="type-eyebrow mb-4 font-semibold tracking-widest text-primary">
                Experience
              </p>
              <ul className="space-y-2.5">
                {teacher.detailedExperience.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50"
                      aria-hidden="true"
                    />
                    <span className="type-body leading-snug text-ink/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expertise */}
            <div className="px-7 py-6 md:px-9 md:py-7 bg-white transition-colors duration-300 hover:bg-accent/[0.03]">
              <p className="type-eyebrow mb-4 font-semibold tracking-widest text-primary/80">
                Expertise
              </p>
              <div className="flex flex-wrap gap-2">
                {teacher.expertise.map((item) => (
                  <span
                    key={item}
                    className="type-ui inline-flex items-center rounded-full border border-accent/35 bg-white px-3 py-1 text-ink/90 transition-all duration-150 hover:border-primary/35 hover:bg-white hover:shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * TeachersPageClient renders the dynamic view for the faculty page,
 * including a full-bleed quote header, sticky table of contents, and biographies.
 *
 * @param props - Component properties conforming to TeachersPageClientProps
 */
export default function TeachersPageClient({
  teachers,
  heroImage,
  eyebrow,
  title,
  lead,
  quote,
  sectionEyebrow,
  sectionTitle,
  sectionDescription,
  heroId,
  facultyId,
}: TeachersPageClientProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeSlug, setActiveSlug] = useState(
    teacherSlug(teachers[0]?.name ?? ""),
  );

  const scrollToTeacher = useCallback(
    (slug: string) => {
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
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

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

  const heroHtmlId = optionalSectionHtmlId(heroId);
  const facultyHtmlId = resolveSectionHtmlId("faculty", facultyId);

  return (
    <>
      {/* Full-bleed hero */}
      <section
        id={heroHtmlId}
        className="relative min-h-[56svh] overflow-hidden bg-ink text-white lg:min-h-[65svh] pt-[var(--site-header-height)]"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/55 to-ink/20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent"
          aria-hidden="true"
        />
        <Container
          size="2xl"
          className="relative z-10 flex min-h-[calc(56svh-var(--site-header-height))] flex-col justify-end py-14 lg:min-h-[calc(65svh-var(--site-header-height))] lg:py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedTransition(prefersReducedMotion, {
              duration: 0.65,
              ease: EASE_OUT,
            })}
            className="max-w-3xl"
          >
            <p className="type-eyebrow text-accent">{eyebrow}</p>
            <Heading as="h1" size="h1" invert className="mt-4">
              {title}
            </Heading>
            <p className="type-lead mt-5 max-w-2xl font-sans leading-relaxed text-white/75">
              {lead}
            </p>
            {quote ? (
              <blockquote className="type-lead mt-6 hidden max-w-xl border-l-2 border-accent/50 pl-4 font-serif italic leading-relaxed text-white/70 md:block">
                {quote}
              </blockquote>
            ) : null}
          </motion.div>
        </Container>
      </section>

      {/* Magazine layout: sticky TOC + scrollable profiles */}
      <section
        id={facultyHtmlId}
        className="bg-white py-14 sm:py-16 lg:py-20"
      >
        <Container size="2xl">
          <SectionHeader
            eyebrow={sectionEyebrow}
            title={sectionTitle}
            description={sectionDescription}
            align="left"
            className="max-w-2xl"
          />

          {/* Mobile TOC */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
            {teachers.map((teacher) => {
              const slug = teacherSlug(teacher.name);
              const isActive = activeSlug === slug;
              return (
                <button
                  key={teacher.name}
                  type="button"
                  onClick={() => scrollToTeacher(slug)}
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

          <div className="mt-10 lg:mt-12 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12 xl:grid-cols-[220px_1fr]">
            {/* Desktop sticky TOC */}
            <aside className="hidden lg:block">
              <div
                className="sticky flex max-h-[calc(100svh-var(--site-header-height,4.75rem)-3rem)] flex-col"
                style={{
                  top: "calc(var(--site-header-height, 4.75rem) + 1.5rem)",
                }}
              >
                <p className="type-eyebrow mb-3 text-muted">Jump to</p>
                <nav
                  aria-label="Faculty profiles"
                  className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain pr-1 scrollbar-thin-primary"
                >
                  {teachers.map((teacher) => {
                    const slug = teacherSlug(teacher.name);
                    const isActive = activeSlug === slug;
                    return (
                      <button
                        key={teacher.name}
                        type="button"
                        onClick={() => scrollToTeacher(slug)}
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
              </div>
            </aside>

            {/* Profile stream */}
            <div className="min-w-0 space-y-6">
              {teachers.map((teacher, i) => (
                <TeacherArticle
                  key={teacher.name}
                  teacher={teacher}
                  index={i}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
