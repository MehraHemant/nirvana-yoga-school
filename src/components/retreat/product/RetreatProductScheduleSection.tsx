"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { TabSwitcher } from "@/components/ui";
import {
  Bed,
  BookOpen,
  Bowl,
  Flame,
  Heart,
  Leaf,
  Lotus,
  Sunrise,
  Users,
  Wind,
} from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import type {
  RetreatProductScheduleActivity,
  RetreatProductScheduleActivityKind,
  RetreatProductScheduleContent,
  RetreatProductScheduleDay,
} from "./retreatProductTypes";

type RetreatProductScheduleSectionProps = {
  content: RetreatProductScheduleContent;
};

/** Returns the activity icon for a schedule row */
function activityIcon(kind: RetreatProductScheduleActivityKind, size: number) {
  switch (kind) {
    case "wake":
      return <Sunrise size={size} />;
    case "meditation":
      return <Wind size={size} />;
    case "yoga":
      return <Lotus size={size} />;
    case "meal":
      return <Bowl size={size} />;
    case "workshop":
      return <BookOpen size={size} />;
    case "rest":
      return <Leaf size={size} />;
    case "healing":
      return <Heart size={size} />;
    case "community":
      return <Users size={size} />;
    case "sleep":
      return <Bed size={size} />;
    case "excursion":
      return <Flame size={size} />;
  }
}

/** Short label for day tabs (Day N or CMS override) */
function dayTabLabel(day: RetreatProductScheduleDay): string {
  if (day.label?.trim()) {
    return day.label.trim();
  }
  return `Day ${day.day}`;
}

/**
 * Day-by-day retreat itinerary — tabbed days when multiple, timeline activities from CMS.
 *
 * @param content - Section copy and ordered retreat days with timed activities
 */
export default function RetreatProductScheduleSection({
  content,
}: RetreatProductScheduleSectionProps) {
  const days = content.days;
  const [activeDayId, setActiveDayId] = useState(
    () => String(days[0]?.day ?? ""),
  );
  const prefersReduced = useReducedMotion() ?? false;

  if (days.length === 0) {
    return null;
  }

  const activeDay =
    days.find((day) => String(day.day) === activeDayId) ?? days[0];
  const showDayTabs = days.length > 1;
  const dayTabs = days.map((day) => ({
    id: String(day.day),
    label: dayTabLabel(day),
  }));

  return (
    <RetreatSectionShell
      id="schedule"
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
    >
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {showDayTabs ? (
          <div
            className="sticky z-20 -mx-1 border-b border-ink/8 bg-white/95 px-1 pb-2 pt-1 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90"
            style={{ top: "var(--retreat-sticky-top, 7rem)" }}
          >
            <div className="min-w-0 overflow-x-auto pb-0.5">
              <TabSwitcher
                tabs={dayTabs}
                activeId={String(activeDay.day)}
                onChange={setActiveDayId}
                layoutId="retreatProductScheduleDay"
                size="sm"
                variant="pill"
                className="w-max min-w-full justify-start sm:justify-center"
              />
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeDay.day}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="min-w-0 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-xs"
          >
            <DayScheduleHeader day={activeDay} />

            {activeDay.activities.length > 0 ? (
              <ol className="relative space-y-2 px-3 py-3 sm:space-y-2.5 sm:px-5 sm:py-4">
                {activeDay.activities.map((activity, index) => (
                  <ScheduleActivityRow
                    key={`${activeDay.day}-${index}-${activity.time}-${activity.title}`}
                    activity={activity}
                    isLast={index === activeDay.activities.length - 1}
                  />
                ))}
              </ol>
            ) : (
              <p className="border-t border-ink/8 px-5 py-10 text-center text-sm text-ink/55 sm:px-6">
                No activities listed for this day yet.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </RetreatSectionShell>
  );
}

type DayScheduleHeaderProps = {
  day: RetreatProductScheduleDay;
};

/** Day number, title, and optional note above the activity timeline */
function DayScheduleHeader({ day }: DayScheduleHeaderProps) {
  const customLabel = day.label?.trim();
  const showCustomLabel =
    Boolean(customLabel) && customLabel !== `Day ${day.day}`;

  return (
    <header className="border-b border-ink/8 bg-linear-to-r from-primary/[0.07] via-primary/[0.03] to-transparent px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span
          className="type-ui flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold tabular-nums text-white shadow-xs sm:size-11"
          aria-hidden
        >
          {day.day}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          {showCustomLabel ? (
            <p className="type-eyebrow text-primary">{customLabel}</p>
          ) : null}
          <h3 className="type-h4 text-ink">{day.title}</h3>
          {day.note ? (
            <p className="rounded-xl border border-primary/12 bg-white/80 px-3 py-2 text-sm leading-relaxed text-ink/80">
              {day.note}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

type ScheduleActivityRowProps = {
  activity: RetreatProductScheduleActivity;
  isLast: boolean;
};

/** Single timed activity row on the day timeline */
function ScheduleActivityRow({ activity, isLast }: ScheduleActivityRowProps) {
  return (
    <li className="group relative flex min-w-0 items-start gap-2 sm:gap-3">
      {!isLast ? (
        <span
          className="absolute left-[3.15rem] top-10 bottom-0 w-px bg-primary/10 sm:left-[3.45rem]"
          aria-hidden
        />
      ) : null}

      <time
        dateTime={activity.time}
        className="type-eyebrow z-10 w-[3rem] shrink-0 pt-2.5 text-right tabular-nums text-ink/70 sm:w-[3.25rem]"
      >
        {activity.time}
      </time>

      <span
        className="relative z-10 mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-xs transition group-hover:border-primary/30 group-hover:bg-primary/5 sm:size-9"
        aria-hidden
      >
        {activityIcon(activity.kind, 16)}
      </span>

      <div className="min-w-0 flex-1 pb-1 pt-1.5">
        <div className="inline-flex max-w-full flex-col rounded-full border border-ink/8 bg-surface-muted/50 px-4 py-2.5 transition group-hover:border-primary/20 group-hover:bg-white group-hover:shadow-xs sm:px-5 sm:py-3">
          <h4 className="type-body font-semibold leading-snug text-ink">
            {activity.title}
          </h4>
          {activity.detail ? (
            <p className="mt-1 text-sm leading-relaxed text-ink/65">
              {activity.detail}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
