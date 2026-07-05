"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { ChevronDown } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineTeachersSectionProps = {
  teachers: TeacherProfile[];
};

function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const [expanded, setExpanded] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <article className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-card">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
        <div className="relative mx-auto aspect-square w-28 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-32">
          <Image
            src={teacher.image}
            alt={teacher.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="font-serif text-xl text-ink">{teacher.name}</h3>
            <p className="mt-1 text-sm font-medium text-secondary">
              {teacher.experienceSummary}
            </p>
          </div>
          <p className="type-body text-muted line-clamp-3">{teacher.bio}</p>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { duration: 0.2, ease: EASE_OUT }
              }
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={
              prefersReduced
                ? { opacity: 1, height: "auto" }
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0, height: 0 }
                : { height: 0, opacity: 0 }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.3, ease: EASE_OUT }
            }
            className="overflow-hidden"
          >
            <div className="grid gap-6 border-t border-secondary/10 px-5 py-5 sm:grid-cols-3 sm:px-6 sm:py-6">
              {teacher.education.length > 0 && (
                <div>
                  <h4 className="type-eyebrow mb-3 text-secondary">
                    Education
                  </h4>
                  <ul className="space-y-2 text-sm text-ink/85">
                    {teacher.education.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {teacher.detailedExperience.length > 0 && (
                <div>
                  <h4 className="type-eyebrow mb-3 text-secondary">
                    Experience
                  </h4>
                  <ul className="space-y-2 text-sm text-ink/85">
                    {teacher.detailedExperience.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {teacher.expertise.length > 0 && (
                <div>
                  <h4 className="type-eyebrow mb-3 text-secondary">
                    Expertise
                  </h4>
                  <ul className="space-y-2 text-sm text-ink/85">
                    {teacher.expertise.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default function OnlineTeachersSection({
  teachers,
}: OnlineTeachersSectionProps) {
  if (teachers.length === 0) return null;

  return (
    <OnlineSectionShell id="teachers" title="Teachers">
      <div className="space-y-5">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.name} teacher={teacher} />
        ))}
      </div>
    </OnlineSectionShell>
  );
}
