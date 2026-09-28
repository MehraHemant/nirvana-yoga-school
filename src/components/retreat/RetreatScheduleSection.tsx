"use client";

import { useState } from "react";
import DailySchedule from "@/components/courses/DailySchedule";
import type { RetreatScheduleDay } from "@/content/types/retreat-page";

type RetreatScheduleSectionProps = {
  /** Day-by-day retreat activities from CMS */
  schedule: RetreatScheduleDay[];
};

/**
 * Retreat schedule — course DailySchedule chrome with CMS day tabs.
 *
 * @param props.schedule - Ordered retreat days and activities
 */
export default function RetreatScheduleSection({
  schedule,
}: RetreatScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState(String(schedule[0]?.day ?? "1"));
  const active =
    schedule.find((day) => String(day.day) === activeDay) ?? schedule[0];

  if (!active) return null;

  const tabs =
    schedule.length > 1
      ? schedule.map((day) => ({
          id: String(day.day),
          label: `Day ${day.day}`,
        }))
      : [];

  return (
    <DailySchedule
      htmlId="schedule"
      description={
        active.title ||
        "Follow our balanced daily rhythm of yoga practice, meditation, nourishing meals, and sound healing designed for deep relaxation and inner harmony."
      }
      schedule={active.activities}
      filterByTimeOfDay={false}
      tabs={tabs}
      activeTabId={activeDay}
      onTabChange={setActiveDay}
      tabLayoutId="activeRetreatDayTab"
      footerNote={
        active.note ? (
          <>
            💡 <strong>Daily Note:</strong> {active.note}
          </>
        ) : undefined
      }
    />
  );
}
