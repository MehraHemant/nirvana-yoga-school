"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader, TabSwitcher } from "@/components/ui";
import { BookOpen, Bowl, Clock, Lotus, Sunrise } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface ScheduleItem {
  time: string;
  activity: string;
}

interface DailyScheduleProps {
  description: string;
  schedule: ScheduleItem[];
}

type ScheduleIconType = "morning" | "meal" | "study" | "yoga" | "default";

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
    color: "text-secondary",
    caption: "Traditional philosophy & lecture",
  },
  yoga: { color: "text-accent", caption: "Hatha / Vinyasa deep practice" },
  default: { color: "text-muted", caption: "Experiential study group" },
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
}: DailyScheduleProps) {
  const [activeTab, setActiveTab] = useState<string>("full");

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
      id="schedule"
      className="relative overflow-x-clip bg-white py-20 sm:py-28"
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
          <p className="type-lead text-muted mt-6 max-w-xl mx-auto font-sans text-base sm:text-lg">
            {description}
          </p>
        </motion.div>

        {/* Tab filters */}
        <TabSwitcher
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          layoutId="activeScheduleTab"
          className="mb-12"
        />

        {/* Dynamic Schedule Feed */}
        <div className="relative max-w-3xl mx-auto min-h-[400px]">
          {/* Vertical central timeline guide */}
          <div className="absolute left-[30px] sm:left-1/2 top-4 bottom-4 w-0.5 bg-ink/10 -translate-x-1/2 hidden sm:block" />

          <motion.div layout className="space-y-6 sm:space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredSchedule.map((item, index) => {
                const isEven = index % 2 === 0;
                const iconType = getIconType(item.activity, item.time);

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
                      className={`pl-12 sm:pl-0 w-full sm:w-[44%] ${
                        isEven
                          ? "text-left sm:text-right sm:order-first"
                          : "text-left sm:text-left sm:order-last"
                      }`}
                    >
                      <span className="inline-block type-ui font-semibold text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/10 sm:border-0 sm:bg-transparent sm:p-0 sm:text-base tracking-wide font-sans">
                        {item.time}
                      </span>
                    </div>

                    {/* Center Timeline Ring */}
                    <div className="absolute left-[8px] sm:left-1/2 top-1.5 w-6 h-6 rounded-full border border-primary/30 bg-white shadow-soft -translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>

                    {/* Right side: Activity Card */}
                    <div
                      className={`pl-12 sm:pl-0 w-full sm:w-[44%] mt-2 sm:mt-0 ${
                        isEven ? "sm:order-last" : "sm:order-first"
                      }`}
                    >
                      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-ink/5 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-sand border border-ink/5 flex items-center justify-center shrink-0">
                          <ScheduleIcon type={iconType} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="type-display-sm text-ink leading-tight font-medium">
                            {item.activity}
                          </h4>
                          <span className="text-xs text-muted block font-sans font-medium">
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
        <div className="mt-16 text-center text-xs text-muted font-medium bg-white/70 max-w-md mx-auto p-4 rounded-2xl border border-ink/5 shadow-card">
          ⚠️ <strong>Note:</strong> The schedule is subject to minor adjustments
          based on seasonal weather conditions, excursion timings (Sundays), or
          special ceremonies.
        </div>
      </Container>
    </section>
  );
}
