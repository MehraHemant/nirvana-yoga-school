import { useLayoutEffect, useRef, useState } from "react";

/** Combined height of the fixed header and the page-level sticky course nav (if present). */
function getStickyTabsTop(): number {
  const header =
    document.querySelector("header")?.getBoundingClientRect().height ?? 76;
  const courseNav =
    document.querySelector(".course-sticky-nav")?.getBoundingClientRect()
      .height ?? 52;
  return Math.ceil(header + courseNav);
}

/**
 * Pins a secondary in-page tab bar (e.g. retreat day tabs, schedule filters)
 * directly beneath the header + course sticky nav while its parent section
 * is scrolled through, unpinning once the section ends.
 */
export function useStickyTabBar() {
  const [tabsTop, setTabsTop] = useState(128);
  const [tabsHeight, setTabsHeight] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionEndRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const syncLayout = () => {
      setTabsTop(getStickyTabsTop());
      if (tabsRef.current) setTabsHeight(tabsRef.current.offsetHeight);
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  useLayoutEffect(() => {
    const updatePinned = () => {
      const sentinel = sentinelRef.current;
      const sectionEnd = sectionEndRef.current;
      if (!sentinel) return;

      const sentinelTop = sentinel.getBoundingClientRect().top;
      const sectionEndTop =
        sectionEnd?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const pinLine = tabsTop;
      const unpinLine = pinLine + tabsHeight;

      setIsPinned(sentinelTop <= pinLine && sectionEndTop > unpinLine);
    };

    updatePinned();
    window.addEventListener("scroll", updatePinned, { passive: true });
    window.addEventListener("resize", updatePinned);
    return () => {
      window.removeEventListener("scroll", updatePinned);
      window.removeEventListener("resize", updatePinned);
    };
  }, [tabsTop, tabsHeight]);

  return {
    sentinelRef,
    sectionEndRef,
    tabsRef,
    isPinned,
    tabsTop,
    tabsHeight,
  };
}
