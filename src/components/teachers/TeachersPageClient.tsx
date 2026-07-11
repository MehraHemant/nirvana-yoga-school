"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Button, Container, Heading, SectionHeader } from "@/components/ui";
import { TEACHERS_HERO_QUOTE, teacherSlug } from "@/content/data/teachers";
import { EASE_OUT, reducedTransition } from "@/lib/motion";

type TeachersPageClientProps = {
  teachers: TeacherProfile[];
  heroImage: string;
};

function getHeaderHeight(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 76;
}

function TeacherArticle({ teacher }: { teacher: TeacherProfile }) {
  const id = teacherSlug(teacher.name);

  return (
    <article
      id={id}
      className="scroll-mt-28 rounded-2xl border border-ink/8 bg-white p-6 sm:p-8"
    >
      <div className="flex items-start gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand sm:h-28 sm:w-28">
          <Image
            src={teacher.image}
            alt={teacher.name}
            fill
            sizes="112px"
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0 pt-1">
          <Heading as="h2" size="h3">
            {teacher.name}
          </Heading>
          <p className="type-eyebrow mt-2 text-secondary">
            {teacher.experienceSummary}
          </p>
        </div>
      </div>

      <p className="type-body mt-6 leading-relaxed text-ink">{teacher.bio}</p>

      <div className="mt-6 space-y-5 border-t border-ink/8 pt-6">
        <div>
          <p className="type-eyebrow mb-2 text-primary">Education</p>
          <ul className="type-body list-disc space-y-1.5 pl-5 text-ink">
            {teacher.education.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="type-eyebrow mb-2 text-secondary">Experience</p>
          <ul className="type-body list-disc space-y-1.5 pl-5 text-ink">
            {teacher.detailedExperience.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="type-eyebrow mb-2 text-muted">Expertise</p>
          <p className="type-body text-ink">{teacher.expertise.join(" · ")}</p>
        </div>
      </div>
    </article>
  );
}

export default function TeachersPageClient({
  teachers,
  heroImage,
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

  return (
    <>
      {/* Full-bleed hero */}
      <section className="relative min-h-[48svh] overflow-hidden bg-ink text-white lg:min-h-[56svh]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/25 to-ink/35"
          aria-hidden="true"
        />
        <Container
          size="2xl"
          className="relative z-10 flex min-h-[48svh] flex-col justify-end py-14 lg:min-h-[56svh] lg:py-20"
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
            <p className="type-eyebrow text-accent">
              Our Spiritual Indian Gurus
            </p>
            <Heading as="h1" size="h1" invert className="mt-4">
              Faculty of{" "}
              <span className="font-normal italic text-accent">Nirvana</span>
            </Heading>
            <p className="type-lead mt-5 max-w-2xl font-sans leading-relaxed text-white/82">
              Twelve lineage teachers guiding Hatha, Vinyasa, Kundalini,
              philosophy, anatomy, and meditation on the banks of the Ganga.
            </p>
            <blockquote className="type-lead mt-6 hidden max-w-xl border-l-2 border-accent/50 pl-4 font-serif italic leading-relaxed text-white/85 md:block">
              {TEACHERS_HERO_QUOTE}
            </blockquote>
          </motion.div>
        </Container>
      </section>


      {/* Magazine layout: sticky TOC + scrollable profiles */}
      <section id="faculty" className="bg-paper py-14 sm:py-16 lg:py-20">
        <Container size="2xl">
          <SectionHeader
            eyebrow="Faculty profiles"
            title="Meet our gurus"
            description="Biography, education, experience, and areas of expertise for every member of our faculty."
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
                      : "border-ink/8 bg-white text-ink"
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
              {teachers.map((teacher) => (
                <TeacherArticle key={teacher.name} teacher={teacher} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
