"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Container, SectionHeader, TabSwitcher } from "@/components/ui";
import type { RetreatScheduleDay } from "@/content/types/retreat-page";
import { BookOpen, Bowl, Clock, Lotus, Sunrise } from "@/icons";
import { useStickyTabBar } from "@/lib/hooks/useStickyTabBar";
import {
  EASE_OUT,
  fadeUp,
  reducedTransition,
  VIEWPORT_ONCE,
} from "@/lib/motion";

type RetreatScheduleSectionProps = {
  /** Day-by-day retreat activities from static content JSON */
  schedule: RetreatScheduleDay[];
};

type ScheduleIconType = "morning" | "meal" | "study" | "yoga" | "default";

const SCHEDULE_ICON_META: Record<
  ScheduleIconType,
  { color: string; caption: string }
> = {
  morning: {
    color: "text-amber-500",
    caption: "Spiritual morning practice",
  },
  meal: { color: "text-primary", caption: "Nutritional sattvic meal" },
  study: {
    color: "text-primary",
    caption: "Traditional lecture & ceremony",
  },
  yoga: { color: "text-accent", caption: "Pranayama, Hatha & Yin yoga" },
  default: { color: "text-ink", caption: "Leisure & reflection time" },
};

function ScheduleIcon({ type }: { type: ScheduleIconType }) {
  const className = `h-5 w-5 ${SCHEDULE_ICON_META[type].color}`;

  if (type === "morning") return <Sunrise size={20} className={className} />;
  if (type === "meal") return <Bowl size={20} className={className} />;
  if (type === "study") return <BookOpen size={20} className={className} />;
  if (type === "yoga") return <Lotus size={20} className={className} />;
  return <Clock size={20} className={className} />;
}

const getIconType = (activity: string, time: string): ScheduleIconType => {
  const actLower = activity.toLowerCase();
  const timeLower = time.toLowerCase();

  if (
    actLower.includes("breakfast") ||
    actLower.includes("lunch") ||
    actLower.includes("dinner") ||
    actLower.includes("meal") ||
    actLower.includes("tea")
  ) {
    return "meal";
  }
  if (
    actLower.includes("philosophy") ||
    actLower.includes("lecture") ||
    actLower.includes("discussion") ||
    actLower.includes("ceremony") ||
    actLower.includes("aarti") ||
    actLower.includes("havan") ||
    actLower.includes("sound") ||
    actLower.includes("healing") ||
    actLower.includes("orientation")
  ) {
    return "study";
  }
  if (
    actLower.includes("yoga") ||
    actLower.includes("asana") ||
    actLower.includes("flow") ||
    actLower.includes("meditation") ||
    actLower.includes("pranayama") ||
    actLower.includes("breath") ||
    actLower.includes("cleansing")
  ) {
    return "yoga";
  }
  if (
    timeLower.includes("06:00 am") ||
    timeLower.includes("07:00 am") ||
    timeLower.includes("06:30 am")
  ) {
    return "morning";
  }
  return "default";
};

/**
 * Retreat day-by-day schedule with sticky day tabs and an alternating timeline.
 *
 * @param props - Component props
 * @param props.schedule - Ordered list of retreat days and activities
 */
export default function RetreatScheduleSection({
  schedule,
}: RetreatScheduleSectionProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeDay, setActiveDay] = useState<string>("1");
  const {
    sentinelRef: tabsSentinelRef,
    sectionEndRef,
    tabsRef,
    isPinned,
    tabsTop,
    tabsHeight,
  } = useStickyTabBar();
  const dayPanelRef = useRef<HTMLDivElement>(null);

  const active =
    schedule.find((day) => String(day.day) === activeDay) ?? schedule[0];

  const handleDayChange = useCallback(
    (id: string) => {
      setActiveDay(id);
      requestAnimationFrame(() => {
        dayPanelRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    },
    [prefersReduced],
  );

  if (!active) return null;

  const tabs = schedule.map((day) => ({
    id: String(day.day),
    label: `Day ${day.day}`,
  }));

  return (
    <section
      id="schedule"
      className="relative border-b border-ink/8 bg-white py-16 sm:py-20"
    >
      <div
        className="pointer-events-none absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent/6 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"
        aria-hidden="true"
      />

      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <SectionHeader
            eyebrow="Retreat Timeline"
            title={
              <>
                Day-by-Day <span className="text-primary">Journey</span>
              </>
            }
            align="center"
          />
          <p className="type-lead mx-auto mt-6 max-w-xl text-base text-ink">
            Follow our balanced daily rhythm of yoga practice, meditation,
            nourishing meals, and sound healing designed for deep relaxation and
            inner harmony.
          </p>
        </motion.div>
      </Container>

      <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden="true" />

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
            activeId={activeDay}
            onChange={handleDayChange}
            layoutId="activeRetreatDayTab"
            variant="pill"
            size="sm"
            className="mb-0 pb-0"
            flush
          />
        </Container>
      </div>

      <Container size="2xl">
        <div
          ref={dayPanelRef}
          className="mx-auto max-w-3xl pt-8"
          style={{ scrollMarginTop: tabsTop + tabsHeight + 16 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reducedTransition(prefersReduced, {
                duration: 0.3,
                ease: EASE_OUT,
              })}
              className="space-y-8"
            >
              <div className="pb-2 text-center">
                <span className="type-eyebrow font-semibold tracking-wider text-primary">
                  Day 0{active.day} Focus
                </span>
                <h4 className="mt-1 text-2xl font-bold leading-tight text-ink sm:text-3xl">
                  {active.title}
                </h4>
              </div>

              <div className="relative min-h-[250px] pt-4">
                <div
                  className="absolute top-4 bottom-4 left-[30px] w-0.5 -translate-x-1/2 bg-ink/10 sm:left-1/2"
                  aria-hidden="true"
                />

                <div className="space-y-6 sm:space-y-8">
                  {active.activities.map((item, index) => {
                    const isEven = index % 2 === 0;
                    const iconType = getIconType(item.activity, item.time);

                    return (
                      <div
                        key={`${item.time}-${item.activity}`}
                        className="relative flex flex-col items-start sm:flex-row sm:justify-between"
                      >
                        <div
                          className={`w-full pl-16 sm:w-[44%] sm:pl-0 ${isEven ? "text-left sm:order-first sm:text-right" : "text-left sm:order-last sm:text-left"}`}
                        >
                          <span className="type-ui inline-block rounded-full border border-primary/10 bg-primary/5 px-3 py-1 font-semibold tracking-wide text-primary sm:border-0 sm:bg-transparent sm:p-0 sm:text-base">
                            {item.time}
                          </span>
                        </div>

                        <div className="absolute top-1.5 left-[30px] z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-primary/30 bg-white shadow-soft sm:left-1/2">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </div>

                        <div
                          className={`mt-2 w-full pl-16 sm:mt-0 sm:w-[44%] sm:pl-0 ${isEven ? "sm:order-last" : "sm:order-first"}`}
                        >
                          <div className="surface-card flex gap-4 rounded-3xl p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-soft sm:p-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-ink/8 bg-surface-muted">
                              <ScheduleIcon type={iconType} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="type-display-sm font-bold leading-tight text-ink">
                                {item.activity}
                              </h4>
                              <span className="block text-xs font-semibold text-ink">
                                {SCHEDULE_ICON_META[iconType].caption}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {active.note && (
                <div className="surface-panel mx-auto mt-8 max-w-md rounded-2xl p-4 text-center text-xs font-semibold text-ink shadow-xs">
                  💡 <strong>Daily Note:</strong> {active.note}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>

      <div ref={sectionEndRef} className="h-px w-full" aria-hidden="true" />
    </section>
  );
}
