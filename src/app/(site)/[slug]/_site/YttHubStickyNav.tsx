"use client";

import { CourseStickyNav } from "@/components/courses";
import { YTT_HUB_NAV } from "@/data/yttHubPage";

export default function YttHubStickyNav() {
  return <CourseStickyNav items={YTT_HUB_NAV} solidBar />;
}
