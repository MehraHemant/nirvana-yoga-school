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
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {schedule.map((day) => {
            const isActive = day.day === activeDay;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setActiveDay(day.day)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-secondary/25 bg-secondary text-white"
                    : "border-secondary/10 bg-secondary/5 text-secondary hover:bg-secondary/10"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 lg:grid-cols-[1fr_0.85fr]"
          >
            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white">
              <div className="border-b border-secondary/10 px-5 py-4 sm:px-6">
                <p className="type-eyebrow text-secondary">Day {active.day}</p>
                <h3 className="mt-1 font-serif text-2xl font-medium text-ink">
                  {active.title}
                </h3>
              </div>
              <ul className="divide-y divide-secondary/8">
                {active.activities.map((item) => (
                  <li
                    key={`${item.time}-${item.activity}`}
                    className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4 sm:px-6"
                  >
                    <span className="type-ui font-semibold tabular-nums text-secondary">
                      {item.time}
                    </span>
                    <span className="type-body text-sm text-ink/85">
                      {item.activity}
                    </span>
                  </li>
                ))}
              </ul>
              {active.note && (
                <p className="border-t border-secondary/8 px-5 py-3 text-xs text-muted sm:px-6">
                  {active.note}
                </p>
              )}
            </div>

            {active.image && (
              <div className="relative min-h-[260px] overflow-hidden rounded-3xl bg-secondary/5 lg:min-h-full">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  sizes="(max-width:1024px) 100vw, 35vw"
                  className="object-cover"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </RetreatSectionShell>
  );
}
