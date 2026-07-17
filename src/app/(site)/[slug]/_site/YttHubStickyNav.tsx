"use client";

import { CourseStickyNav } from "@/components/courses";
import type { YttHubNavItem } from "@/content/types/shared-sections";

type YttHubStickyNavProps = {
  nav: YttHubNavItem[];
};

/**
 * Sticky jump-nav for the YTT hub page.
 *
 * @param props - Nav items from MySQL `/api/content/ytt-hub`
 */
export default function YttHubStickyNav({ nav }: YttHubStickyNavProps) {
  return <CourseStickyNav items={nav} solidBar />;
}
