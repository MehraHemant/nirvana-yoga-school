"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Container, SectionHeader } from "@/components/ui";
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
  /** Footer CTA label */
  ctaLabel?: string;
  /** Footer CTA href */
  ctaHref?: string;
  /** Optional CMS section `_id` (falls back to `teachers`) */
  sectionId?: string;
};

/**
 * Homepage / hub teachers strip — profiles must be passed from a server loader.
 *
 * @param props - Teachers list and optional section header / CTA from CMS
 */
export default function TeachersSection({
  teachers: teachersProp = [],
  eyebrow = "Our Spiritual Indian Gurus",
  title,
  description = "Meet our experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh.",
  ctaLabel = "Meet All Gurus",
  ctaHref = "/teacher",
  sectionId,
}: TeachersSectionProps) {
  const teachers = teachersProp;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const resolvedTitle = title ?? (
    <>
      Lineage Teachers,{" "}
      <span className="font-normal text-primary">Guided by Compassion</span>
    </>
  );

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 350, damping: 30 } as const);

  useEffect(() => {
    if (isHovered || teachers.length === 0) return;

    const timer = setInterval(() => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setSelectedIdx((prev) => (prev + 1) % teachers.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isHovered, teachers.length]);

  if (teachers.length === 0) return null;

  return (
    <section
      id={resolveSectionHtmlId("teachers", sectionId)}
      className="relative overflow-x-hidden bg-white py-12 sm:py-14 lg:py-16 w-full"
    >
      <Container size="2xl" className="w-full relative z-10">
        {/* Section Header */}
        <div className="w-full text-center mb-12 sm:mb-16 lg:mb-10">
          <SectionHeader
            eyebrow={eyebrow}
            title={resolvedTitle}
            description={description}
            align="center"
            className="mx-auto max-w-3xl"
          />
        </div>

        {/* 1. Desktop Layout (lg and above): Split Selector Directory + Detail Spotlight Card */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover trigger to pause directory auto-rotation */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden lg:grid grid-cols-[1fr_2.2fr] gap-8 items-start lg:min-h-[480px]"
        >
          {/* List Selector (Left) */}
          <div className="flex flex-col gap-2.5 bg-white/50 p-3.5 pr-2.5 rounded-2xl border border-ink/5 lg:h-[480px] overflow-y-auto scrollbar-thin-primary shrink-0 w-full lg:max-w-md">
            <span className="type-eyebrow text-muted text-left mb-2 px-2">
              Faculty Directory
            </span>
            {teachers.map((teacher, index) => {
              const isSelected = selectedIdx === index;
              return (
                <button
                  key={`spotlight-btn-${teacher.name}`}
                  onClick={() => setSelectedIdx(index)}
                  type="button"
                  className={`relative w-full p-4 rounded-xl flex items-center gap-4.5 transition-all duration-300 border text-left cursor-pointer ${
                    isSelected
                      ? "text-white border-primary shadow-sm scale-102"
                      : "bg-white text-ink border-ink/5 hover:border-primary/20 hover:scale-[1.01]"
                  }`}
                  style={{
                    transform:
                      isSelected && !prefersReducedMotion
                        ? "scale(1.02)"
                        : "none",
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTeacherBg"
                      className="absolute inset-0 bg-primary rounded-xl z-0"
                      transition={springTransition}
                    />
                  )}
                  <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden shrink-0 border border-ink/10 shadow-2xs">
                    <Image
                      src={teacher.image}
                      alt={teacher.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 relative z-10">
                    <h4 className="font-serif text-sm sm:text-base md:text-lg font-bold leading-tight truncate">
                      {teacher.name}
                    </h4>
                    <p
                      className={`text-[10px] sm:text-[11px] font-sans uppercase font-semibold tracking-wider mt-1.5 truncate ${
                        isSelected ? "text-white/80" : "text-muted"
                      }`}
                    >
                      {teacher.experienceSummary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabular Spotlight Details Card (Right) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-ink/5 hover:border-primary/10 transition-colors duration-500 w-full min-w-0 lg:min-h-[480px] flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Left side inside details card: Image */}
            <div className="relative w-full lg:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden bg-sand border border-ink/5 shrink-0 shadow-2xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={teachers[selectedIdx].image}
                    alt={teachers[selectedIdx].name}
                    fill
                    sizes="(max-width: 1024px) 350px, 220px"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side inside details card: Details & Biography */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full flex flex-col justify-between text-left"
                >
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-ink leading-tight">
                      {teachers[selectedIdx].name}
                    </h3>
                    <p className="text-[10px] font-sans uppercase font-extrabold tracking-wider text-muted mt-1 mb-2.5">
                      {teachers[selectedIdx].experienceSummary}
                    </p>

                    {/* Credentials Table */}
                    <div className="border border-ink/5 rounded-2xl overflow-hidden bg-sand/20">
                      <div className="flex flex-col border-b border-ink/5 p-2 md:p-2.5">
                        <span className="text-[9px] uppercase tracking-wider text-muted font-bold mb-0.5">
                          Education
                        </span>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5 list-disc pl-4 text-[10px] md:text-[11px] text-ink font-medium">
                          {teachers[selectedIdx].education.map((edu) => (
                            <li key={edu}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col border-b border-ink/5 p-2 md:p-2.5">
                        <span className="text-[9px] uppercase tracking-wider text-muted font-bold mb-0.5">
                          Experience Details
                        </span>
                        <ul className="list-disc pl-4 text-[10px] md:text-[11px] text-ink font-medium space-y-0.5">
                          {teachers[selectedIdx].detailedExperience.map(
                            (exp) => (
                              <li key={exp}>{exp}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="flex flex-col p-2 md:p-2.5">
                        <span className="text-[9px] uppercase tracking-wider text-muted font-bold mb-1">
                          Area of Expertise
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {teachers[selectedIdx].expertise.map((exp) => (
                            <span
                              key={exp}
                              className="bg-primary/5 text-primary text-[8px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-primary/10"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-ink/5 mt-2.5 pt-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted font-bold block mb-1">
                        Biography
                      </span>
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">
                        {teachers[selectedIdx].bio}
                      </p>
                    </div>
                  </div>

                  {/* Biography */}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 2. Mobile/Tablet Accordion Layout (lg-hidden): In-place Expanding Details */}
        <div className="flex flex-col gap-4 lg:hidden w-full">
          {teachers.map((teacher, index) => {
            const isOpen = selectedIdx === index;
            return (
              <div
                key={`mobile-accordion-${teacher.name}`}
                className="bg-white rounded-2xl border border-ink/5 overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => setSelectedIdx(isOpen ? -1 : index)}
                  type="button"
                  className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors duration-300 ${
                    isOpen
                      ? "bg-primary/80 text-white border-b border-primary/10"
                      : "bg-white text-ink"
                  }`}
                >
                  <div className="flex items-center gap-4.5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-ink/10 shadow-2xs">
                      <Image
                        src={teacher.image}
                        alt={teacher.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`font-serif text-base font-bold leading-tight truncate ${isOpen ? "text-white" : "text-ink"}`}
                      >
                        {teacher.name}
                      </h4>
                      <p
                        className={`text-[10px] sm:text-[11px] font-sans uppercase font-normal tracking-wider mt-1.5 truncate ${
                          isOpen ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {teacher.experienceSummary}
                      </p>
                    </div>
                  </div>
                  {/* Custom Chevron Indicator */}
                  <span
                    className={`text-xs transition-transform duration-300 font-bold ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen
                      ? " opacity-100 p-5 border-t border-ink /5"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col gap-6">
                    {/* Portrait */}
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-sand border border-ink/5 shadow-2xs">
                      <Image
                        src={teacher.image}
                        alt={teacher.name}
                        fill
                        sizes="350px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Credentials Table */}
                      <div className="border border-ink/5 rounded-2xl overflow-hidden bg-sand/20 text-left">
                        <div className="flex flex-col border-b border-ink/5 p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                            Education
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-4 text-xs text-ink font-medium">
                            {teacher.education.map((edu) => (
                              <li key={edu}>{edu}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col border-b border-ink/5 p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                            Experience Details
                          </span>
                          <ul className="list-disc pl-4 text-xs text-ink font-medium space-y-1">
                            {teacher.detailedExperience.map((exp) => (
                              <li key={exp}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-2">
                            Area of Expertise
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.expertise.map((exp) => (
                              <span
                                key={exp}
                                className="bg-primary/5 text-primary text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-primary/10"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="pt-2 text-left">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-1.5">
                          Biography
                        </span>
                        <p className="text-xs sm:text-sm text-muted leading-relaxed">
                          {teacher.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Footer Button */}
        <div className="mt-16 lg:mt-8 flex justify-center w-full select-none">
          <Button
            href={ctaHref}
            variant="ghost"
            size="md"
            responsive
            className="border border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
          >
            {ctaLabel}
          </Button>
        </div>
      </Container>
    </section>
  );
}
