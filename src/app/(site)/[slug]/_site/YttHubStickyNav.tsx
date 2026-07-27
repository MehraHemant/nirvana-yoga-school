"use client";

import { CourseStickyNav } from "@/components/courses";
import { resolveYttHubNav } from "@/content/mappers/ytt-hub";
import type { YttHubNavItem } from "@/content/types/shared-sections";

type YttHubStickyNavProps = {
  nav: YttHubNavItem[];
  /** Optional CMS HTML id — sibling anchor, not a sticky parent wrapper */
  htmlId?: string;
};

/**
 * Sticky jump-nav for the YTT hub page.
 * Renders as a fragment so `position: sticky` is not trapped in a short wrapper.
 *
 * @param props - Nav items from MySQL `/api/content/ytt-hub`
 */
export default function YttHubStickyNav({ nav, htmlId }: YttHubStickyNavProps) {
  return (
    <>
      {htmlId ? (
        <div id={htmlId} className="h-px w-full" aria-hidden="true" />
      ) : null}
      <CourseStickyNav items={resolveYttHubNav(nav)} solidBar />
    </>
  );
}
