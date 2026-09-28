"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { Container, SectionHeader, TabSwitcher } from "@/components/ui";
import { BookOpen, Bowl, Clock, Lotus, Sunrise } from "@/icons";
import { useStickyTabBar } from "@/lib/hooks/useStickyTabBar";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface ScheduleItem {
  time: string;
  activity: string;
}

type ScheduleTab = { id: string; label: string };

const COURSE_PERIOD_TABS: ScheduleTab[] = [
  { id: "full", label: "Full Day" },
  { id: "morning", label: "Morning Sadhanas" },
  { id: "midday", label: "Midday Theory & Lunch" },
  { id: "evening", label: "Evening Flow & Restoration" },
];

const DEFAULT_SCHEDULE_TITLE = (
  <>
    A Day in the <span className="text-primary">Yogic Life</span>
  </>
);

const DEFAULT_FOOTER_NOTE = (
  <>
    ⚠️ <strong>Note:</strong> The schedule is subject to minor adjustments based
    on seasonal weather conditions, excursion timings (Sundays), or special
    ceremonies.
  </>
);

interface DailyScheduleProps {
  description: string;
  schedule: ScheduleItem[];
  /** Public section HTML id (defaults to `schedule`) */
  htmlId?: string;
  /** Section eyebrow. Defaults to course “Timetable”. */
  eyebrow?: string;
  /** Section title. Defaults to the course yogic-life heading. */
  title?: ReactNode;
  /** Footer panel copy. Defaults to the course weather/Sunday note. */
  footerNote?: ReactNode;
  /** When false, skip morning/midday/evening filtering (retreat day tabs). */
  filterByTimeOfDay?: boolean;
  /** Tab set. Defaults to course period tabs when filtering by time of day. */
  tabs?: ScheduleTab[];
  /** Controlled tab id when the parent owns tabs (retreat days). */
  activeTabId?: string;
  /** Controlled tab change. */
  onTabChange?: (id: string) => void;
  /** TabSwitcher layout id (defaults to `activeScheduleTab`). */
  tabLayoutId?: string;
}

type ScheduleIconType = "morning" | "meal" | "study" | "yoga" | "default";

interface ScheduleCardWash {
  base: string;
  overlay?: string;
}

/** Light primary→white washes; same family, different direction and intensity. */
const SCHEDULE_CARD_WASHES: ScheduleCardWash[] = [
  {
    base: "bg-linear-to-br from-primary/16 via-primary/7 to-white",
    overlay:
      "bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/18 via-primary/5 to-transparent",
  },
  {
    base: "bg-linear-to-tl from-primary/14 via-primary/6 to-white",
  },
  {
    base: "bg-radial-[at_top_left] from-primary/16 via-primary/6 to-white",
  },
  {
    base: "bg-radial-[at_top_right] from-primary/18 via-primary/7 to-white",
  },
  {
    base: "bg-linear-to-b from-primary/18 via-primary/8 to-white",
  },
  {
    base: "bg-linear-to-tr from-primary/10 via-primary/14 to-white",
    overlay:
      "bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent",
  },
  {
    base: "bg-linear-to-bl from-primary/12 via-primary/5 to-white",
  },
];

/**
 * Stable 32-bit hash so the same seed always maps to the same wash.
 * @param value Activity title used as the hash seed.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Picks a wash from the palette by hashing the activity title.
 * @param activity Schedule activity title used as a stable seed.
 */
function getScheduleCardWash(activity: string): ScheduleCardWash {
  return SCHEDULE_CARD_WASHES[
    hashString(activity) % SCHEDULE_CARD_WASHES.length
  ];
}

const SCHEDULE_ICON_META: Record<
  ScheduleIconType,
  { color: string; caption: string }
> = {
  morning: {
    color: "text-amber-500",
    caption: "Spiritual morning purification",
  },
  meal: { color: "text-primary", caption: "Nutritional Ayurvedic meal" },
  study: {
    color: "text-primary",
    caption: "Traditional philosophy & lecture",
  },
  yoga: { color: "text-accent", caption: "Hatha / Vinyasa deep practice" },
  default: { color: "text-ink", caption: "Experiential study group" },
};

function ScheduleIcon({ type }: { type: ScheduleIconType }) {
  const className = `w-5 h-5 ${SCHEDULE_ICON_META[type].color}`;

  if (type === "morning") return <Sunrise size={20} className={className} />;
  if (type === "meal") return <Bowl size={20} className={className} />;
  if (type === "study") return <BookOpen size={20} className={className} />;
  if (type === "yoga") return <Lotus size={20} className={className} />;
  return <Clock size={20} className={className} />;
}

/**
 * Course daily timetable with sticky period tabs and a responsive timeline.
 * Optional props let retreat pages reuse the same chrome with day tabs.
 *
 * @param description Intro copy under the section header.
 * @param schedule Ordered time/activity rows from the course or retreat CMS.
 * @param htmlId Public section HTML id (defaults to `schedule`).
 * @param eyebrow Optional header eyebrow (defaults to “Timetable”).
 * @param title Optional header title (defaults to the course heading).
 * @param footerNote Optional footer copy (defaults to the course note).
 * @param filterByTimeOfDay When false, show every row (retreat days).
 * @param tabs Optional tab set. Empty hides the tab bar.
 * @param activeTabId Controlled tab id.
 * @param onTabChange Controlled tab change handler.
 * @param tabLayoutId TabSwitcher layout id.
 */
export default function DailySchedule({
  description,
  schedule,
  htmlId = "schedule",
  eyebrow = "Timetable",
  title = DEFAULT_SCHEDULE_TITLE,
  footerNote,
  filterByTimeOfDay = true,
  tabs: tabsProp,
  activeTabId,
  onTabChange,
  tabLayoutId = "activeScheduleTab",
}: DailyScheduleProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const tabs = tabsProp ?? (filterByTimeOfDay ? COURSE_PERIOD_TABS : []);
  const showTabs = tabs.length > 0;
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "full");
  const activeTab = activeTabId ?? internalTab;
  const { sentinelRef, sectionEndRef, tabsRef, isPinned, tabsTop, tabsHeight } =
    useStickyTabBar();
  const feedRef = useRef<HTMLDivElement>(null);

  // Re-anchors the viewport to the top of the filtered feed so the sticky
  // tab bar stays visually connected to its content after switching tabs.
  const handleTabChange = useCallback(
    (id: string) => {
      if (activeTabId === undefined) setInternalTab(id);
      onTabChange?.(id);
      requestAnimationFrame(() => {
        feedRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    },
    [activeTabId, onTabChange, prefersReduced],
  );

  // Determine icon type based on activity name or time
  const getIconType = (activity: string, time: string): ScheduleIconType => {
    const actLower = activity.toLowerCase();
    const timeLower = time.toLowerCase();

    if (
      actLower.includes("breakfast") ||
      actLower.includes("lunch") ||
      actLower.includes("dinner")
    ) {
      return "meal";
    }
    if (
      actLower.includes("anatomy") ||
      actLower.includes("philosophy") ||
      actLower.includes("lecture") ||
      actLower.includes("discussion")
    ) {
      return "study";
    }
    if (
      actLower.includes("yoga") ||
      actLower.includes("asana") ||
      actLower.includes("flow") ||
      actLower.includes("alignment") ||
      actLower.includes("meditation") ||
      actLower.includes("nidra")
    ) {
      return "yoga";
    }
    if (timeLower.includes("06:00 am") || timeLower.includes("07:45 am")) {
      return "morning";
    }
    return "default";
  };

  // Determine active-time window
  const isItemInTab = (time: string, tab: string) => {
    if (tab === "full") return true;

    // Very robust parser based on standard RYT schedule
    const hour = Number.parseInt(time.split(":")[0], 10) || 0;
    const isPM = time.includes("PM");

    if (tab === "morning") {
      return !isPM && (hour === 6 || hour === 7 || hour === 9);
    }
    if (tab === "midday") {
      if (!isPM && (hour === 10 || hour === 11)) return true;
      if (isPM && (hour === 12 || hour === 1 || hour === 3)) return true;
      return false;
    }
    if (tab === "evening") {
      return isPM && (hour === 4 || hour === 6 || hour === 7 || hour === 8);
    }
    return true;
  };

  const filteredSchedule = filterByTimeOfDay
    ? schedule.filter((item) => isItemInTab(item.time, activeTab))
    : schedule;

  return (
    <section
      id={htmlId}
      className="relative overflow-x-clip bg-white section-padding-y"
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader eyebrow={eyebrow} title={title} align="center" />
          <p className="type-lead mx-auto mt-6 max-w-xl text-ink">
            {description}
          </p>
        </motion.div>
      </Container>

      {showTabs ? (
        <>
          <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

          {isPinned && (
            <div
              style={{ height: tabsHeight }}
              className="w-full"
              aria-hidden="true"
            />
          )}

          <div
            ref={tabsRef}
            style={isPinned ? { top: tabsTop } : undefined}
            className={`z-30 bg-transparent ${isPinned ? "fixed inset-x-0" : "relative"}`}
          >
            <Container size="2xl" className="py-3">
              <TabSwitcher
                tabs={tabs}
                activeId={activeTab}
                onChange={handleTabChange}
                layoutId={tabLayoutId}
                className="mb-0 justify-start pb-0 lg:justify-center"
                flush
              />
            </Container>
          </div>
        </>
      ) : (
        <>
          <div ref={sentinelRef} className="hidden" aria-hidden="true" />
          <div ref={tabsRef} className="hidden" aria-hidden="true" />
        </>
      )}

      <Container size="2xl" className="pt-8">
        {/* Dynamic Schedule Feed */}
        <div
          ref={feedRef}
          className="relative mx-auto min-h-100 min-w-0 max-w-7xl items-center"
          style={{ scrollMarginTop: tabsTop + tabsHeight + 16 }}
        >
          {/* Vertical timeline: left rail below lg, centered spine on desktop */}
          <div
            className="absolute top-4 bottom-4 left-7.5 w-0.5 -translate-x-1/2 bg-ink/10 lg:left-1/2"
            aria-hidden="true"
          />

          <motion.div layout className="space-y-6 lg:space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredSchedule.map((item, index) => {
                const isEven = index % 2 === 0;
                const iconType = getIconType(item.activity, item.time);
                const wash = getScheduleCardWash(item.activity);

                return (
                  <motion.div
                    key={`${item.time}-${item.activity}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col items-start lg:flex-row lg:items-center lg:justify-center lg:gap-x-14"
                  >
                    {/* Time: stacked above the card below lg; alternating columns on desktop */}
                    <div
                      className={`min-w-0 w-full pl-14 lg:w-[40%] lg:pl-0 ${isEven ? "text-left lg:text-right lg:order-first" : "text-left lg:order-last"}`}
                    >
                      <span className="type-ui inline-block rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-primary lg:border-0 lg:bg-transparent lg:p-0">
                        {item.time}
                      </span>
                    </div>

                    {/* Timeline node: left rail below lg, centered on desktop */}
                    <div className="absolute top-1.5 left-7.5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-primary/30 bg-white shadow-soft lg:top-1/2 lg:left-1/2 lg:-translate-y-1/2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>

                    {/* Activity card */}
                    <div
                      className={`mt-2 min-w-0 w-full pl-10 lg:mt-0 lg:w-[40%] lg:pl-0 ${isEven ? "lg:order-last" : "lg:order-first"}`}
                    >
                      <div
                        className={`relative flex min-w-0 gap-3 rounded-2xl border border-ink/6 ${wash.base} p-4 shadow-soft sm:gap-4`}
                      >
                        {wash.overlay ? (
                          <span
                            className={`pointer-events-none absolute inset-0 ${wash.overlay}`}
                            aria-hidden
                          />
                        ) : null}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-ink/8 bg-surface-muted">
                          <ScheduleIcon type={iconType} />
                        </div>
                        <div className="relative min-w-0 space-y-1">
                          <h4 className="type-h5 font-medium text-ink">
                            {item.activity}
                          </h4>
                          <span className="type-ui font-normal! block text-ink">
                            {SCHEDULE_ICON_META[iconType].caption}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="surface-panel type-ui mx-auto mt-16 max-w-md rounded-2xl p-4 text-center text-ink shadow-xs">
          {footerNote ?? DEFAULT_FOOTER_NOTE}
        </div>
      </Container>

      <div ref={sectionEndRef} className="h-px w-full" aria-hidden="true" />
    </section>
  );
}
