"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { RetreatScheduleDay } from "@/content/types/retreat-page";
import RetreatSectionShell from "./RetreatSectionShell";

type RetreatScheduleSectionProps = {
  schedule: RetreatScheduleDay[];
};

export default function RetreatScheduleSection({
  schedule,
}: RetreatScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState(schedule[0]?.day ?? 1);
  const active = schedule.find((day) => day.day === activeDay) ?? schedule[0];

  if (!active) return null;

  return (
    <RetreatSectionShell id="schedule" title="Day-wise Schedule">
      <div className="space-y-8">
        {/* Day selector tabs */}
        <div className="flex flex-wrap gap-2.5 rounded-2xl bg-sand/40 p-2 border border-secondary/10 w-fit">
          {schedule.map((day) => {
            const isActive = day.day === activeDay;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setActiveDay(day.day)}
                className={`rounded-xl px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-secondary text-white shadow-sm"
                    : "text-muted hover:bg-secondary/10 hover:text-secondary"
                }`}
              >
                Day {day.day}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.day}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            {/* Timeline Card */}
            <div className="overflow-hidden rounded-3xl border border-secondary/15 bg-white shadow-xs p-6 md:p-8">
              <div className="border-b border-secondary/10 pb-6 mb-6">
                <span className="type-eyebrow text-secondary font-semibold tracking-wider">
                  Day 0{active.day} focus
                </span>
                <h3 className="mt-1 font-serif text-2xl md:text-3xl font-medium text-ink leading-tight">
                  {active.title}
                </h3>
              </div>

              {/* Timeline layout */}
              <div className="relative pl-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary/15">
                <div className="space-y-7">
                  {active.activities.map((item) => (
                    <div
                      key={`${item.time}-${item.activity}`}
                      className="relative grid grid-cols-1 gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-4"
                    >
                      {/* Timeline dot */}
                      <span
                        className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-secondary outline outline-4 outline-white"
                        aria-hidden="true"
                      />

                      <span className="type-ui font-semibold text-secondary tracking-wide uppercase tabular-nums">
                        {item.time}
                      </span>
                      <span className="type-body text-sm leading-relaxed text-ink/85">
                        {item.activity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {active.note && (
                <div className="mt-8 border-t border-secondary/10 pt-4 text-xs text-muted/80 italic leading-relaxed">
                  💡 {active.note}
                </div>
              )}
            </div>

            {/* Day Image */}
            {active.image && (
              <div className="group relative min-h-[300px] overflow-hidden rounded-3xl border border-secondary/15 bg-secondary/5 lg:min-h-full">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  sizes="(max-width:1024px) 100vw, 35vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent opacity-80" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </RetreatSectionShell>
  );
}
