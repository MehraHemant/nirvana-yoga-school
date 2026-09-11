"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Container, SectionHeader, TabSwitcher } from "@/components/ui";
import { BookOpen, Bowl, Clock, Lotus, Sunrise } from "@/icons";
import { useStickyTabBar } from "@/lib/hooks/useStickyTabBar";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface ScheduleItem {
  time: string;
  activity: string;
}

interface DailyScheduleProps {
  description: string;
  schedule: ScheduleItem[];
  /** Public section HTML id (defaults to `schedule`) */
  htmlId?: string;
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

export default function DailySchedule({
  description,
  schedule,
  htmlId = "schedule",
}: DailyScheduleProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeTab, setActiveTab] = useState<string>("full");
  const { sentinelRef, sectionEndRef, tabsRef, isPinned, tabsTop, tabsHeight } =
    useStickyTabBar();
  const feedRef = useRef<HTMLDivElement>(null);

  // Re-anchors the viewport to the top of the filtered feed so the sticky
  // tab bar stays visually connected to its content after switching tabs.
  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      requestAnimationFrame(() => {
        feedRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    },
    [prefersReduced],
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

  const filteredSchedule = schedule.filter((item) =>
    isItemInTab(item.time, activeTab),
  );

  const tabs = [
    { id: "full", label: "Full Day" },
    { id: "morning", label: "Morning Sadhanas" },
    { id: "midday", label: "Midday Theory & Lunch" },
    { id: "evening", label: "Evening Flow & Restoration" },
  ];

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
          <SectionHeader
            eyebrow="Timetable"
            title={
              <>
                A Day in the <span className="text-primary">Yogic Life</span>
              </>
            }
            align="center"
          />
          <p className="type-lead mx-auto mt-6 max-w-xl text-ink">
            {description}
          </p>
        </motion.div>
      </Container>

      {/* Tab filters */}
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
            layoutId="activeScheduleTab"
            className="mb-0 pb-0"
            flush
          />
        </Container>
      </div>

      <Container size="2xl" className="pt-8">
        {/* Dynamic Schedule Feed */}
        <div
          ref={feedRef}
          className="relative max-w-3xl mx-auto min-h-100"
          style={{ scrollMarginTop: tabsTop + tabsHeight + 16 }}
        >
          {/* Vertical central timeline guide */}
          <div className="absolute left-7.5 sm:left-1/2 top-4 bottom-4 w-0.5 bg-ink/10 -translate-x-1/2 hidden sm:block" />

          <motion.div layout className="space-y-6 sm:space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredSchedule.map((item, index) => {
                const isEven = index % 2 === 0;
                const iconType = getIconType(item.activity, item.time);
                const wash = getScheduleCardWash(item.activity);

                return (
                  <motion.div
                    key={item.time}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col sm:flex-row items-start sm:justify-between"
                  >
                    {/* Left side: Time element */}
                    <div
                      className={`pl-12 sm:pl-0 w-full sm:w-[44%] ${isEven ? "text-left sm:text-right sm:order-first" : "text-left sm:text-left sm:order-last"}`}
                    >
                      <span className="type-ui inline-block rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-primary sm:border-0 sm:bg-transparent sm:p-0">
                        {item.time}
                      </span>
                    </div>

                    {/* Center Timeline Ring */}
                    <div className="absolute left-2 sm:left-1/2 top-1.5 w-6 h-6 rounded-full border border-primary/30 bg-white shadow-soft -translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>

                    {/* Right side: Activity Card */}
                    <div
                      className={`pl-12 sm:pl-0 w-full sm:w-[44%] mt-2 sm:mt-0 ${isEven ? "sm:order-last" : "sm:order-first"}`}
                    >
                      <div
                        className={`relative flex gap-4 overflow-hidden rounded-3xl border border-ink/6 ${wash.base} p-5 shadow-soft sm:p-6`}
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
                        <div className="relative space-y-1">
                          <h4 className="type-h4 text-ink">
                            {item.activity}
                          </h4>
                          <span className="type-ui block text-ink">
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

        {/* Footer Warning block */}
        <div className="surface-panel type-ui mx-auto mt-16 max-w-md rounded-2xl p-4 text-center text-ink shadow-xs">
          ⚠️ <strong>Note:</strong> The schedule is subject to minor adjustments
          based on seasonal weather conditions, excursion timings (Sundays), or
          special ceremonies.
        </div>
      </Container>

      <div ref={sectionEndRef} className="h-px w-full" aria-hidden="true" />
    </section>
  );
}
