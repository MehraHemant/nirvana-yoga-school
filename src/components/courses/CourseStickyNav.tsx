"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui";

const DEFAULT_NAV_ITEMS = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#eligibility", label: "Eligibility", shortLabel: "Eligible" },
  { id: "#syllabus", label: "Syllabus", shortLabel: "Syllabus" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#exam", label: "Exam", shortLabel: "Exam" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
  { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" },
  { id: "#travel", label: "Travel", shortLabel: "Travel" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
] as const;

export type StickyNavItem = {
  id: `#${string}`;
  label: string;
  shortLabel: string;
};

type NavSectionId = StickyNavItem["id"];

const NAV_LOCK_MS = 1200;

function getHeaderHeight(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 80;
}

/** Active = section with the most area visible below the sticky chrome. */
function resolveActiveSection(
  line: number,
  navItems: StickyNavItem[],
): NavSectionId {
  let active = navItems[0]?.id ?? "#overview";
  let mostVisible = 0;

  for (const item of navItems) {
    const el = document.getElementById(item.id.slice(1));
    if (!el) continue;

    const { top, bottom } = el.getBoundingClientRect();
    const visible = Math.max(
      0,
      Math.min(bottom, window.innerHeight) - Math.max(top, line),
    );

    if (visible >= mostVisible) {
      mostVisible = visible;
      active = item.id;
    }
  }

  return active;
}

function scrollActiveTabIntoView(
  container: HTMLElement | null,
  sectionId: NavSectionId,
  behavior: ScrollBehavior,
) {
  const activeEl = container?.querySelector<HTMLAnchorElement>(
    `a[href="${sectionId}"]`,
  );
  if (!activeEl || !container) return;

  const containerRect = container.getBoundingClientRect();
  const activeRect = activeEl.getBoundingClientRect();
  const isFullyVisible =
    activeRect.left >= containerRect.left + 8 &&
    activeRect.right <= containerRect.right - 8;

  if (!isFullyVisible) {
    const targetLeft =
      activeEl.offsetLeft -
      container.clientWidth / 2 +
      activeEl.offsetWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior,
    });
  }
}

export default function CourseStickyNav({
  items,
  variant = "residential",
  solidBar = false,
}: {
  items?: StickyNavItem[];
  variant?: "residential" | "online" | "retreat";
  solidBar?: boolean;
}) {
  const navItems = items && items.length > 0 ? items : [...DEFAULT_NAV_ITEMS];
  const isOnline = variant === "online";
  const isRetreat = variant === "retreat";
  const activeTextClass =
    isOnline || isRetreat ? "text-primary" : "text-primary";
  const activePillClass =
    isOnline || isRetreat
      ? "border-primary/15 bg-primary/8"
      : "border-primary/15 bg-primary/8";
  const focusRingClass =
    isOnline || isRetreat
      ? "focus-visible:ring-primary/60"
      : "focus-visible:ring-primary/60";
  const prefersReduced = useReducedMotion() ?? false;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const isNavigatingRef = useRef(false);
  const navLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNavScrollIntoViewRef = useRef(true);

  const [activeSection, setActiveSection] = useState<NavSectionId>(
    navItems[0]?.id ?? "#overview",
  );
  const [isPinned, setIsPinned] = useState(false);
  const [stickyTop, setStickyTop] = useState(80);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollBehavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

  const getScrollLine = useCallback(() => {
    const navHeight = barRef.current?.getBoundingClientRect().height ?? 52;
    return getHeaderHeight() + navHeight;
  }, []);

  const syncSectionMargins = useCallback(() => {
    const line = getScrollLine();
    for (const item of navItems) {
      const el = document.getElementById(item.id.slice(1));
      if (el) el.style.scrollMarginTop = `${line}px`;
    }
  }, [getScrollLine, navItems]);

  const updateScrollFades = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const syncHeader = () => setStickyTop(getHeaderHeight());
    const onResize = () => {
      syncHeader();
      syncSectionMargins();
      updateScrollFades();
    };

    syncHeader();
    syncSectionMargins();
    updateScrollFades();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", onResize);
    };
  }, [syncSectionMargins, updateScrollFades]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const observer = new ResizeObserver(() => {
      syncSectionMargins();
      updateScrollFades();
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [syncSectionMargins, updateScrollFades]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { threshold: 0, rootMargin: `-${stickyTop}px 0px 0px 0px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyTop]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => updateScrollFades();
    container.addEventListener("scroll", onScroll, { passive: true });
    updateScrollFades();

    return () => container.removeEventListener("scroll", onScroll);
  }, [updateScrollFades]);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (isNavigatingRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = resolveActiveSection(getScrollLine(), navItems);
        setActiveSection((prev) => (prev === next ? prev : next));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [getScrollLine, navItems]);

  useEffect(() => {
    if (skipNavScrollIntoViewRef.current) {
      skipNavScrollIntoViewRef.current = false;
      return;
    }
    scrollActiveTabIntoView(scrollRef.current, activeSection, scrollBehavior);
  }, [activeSection, scrollBehavior]);

  useEffect(
    () => () => {
      if (navLockTimerRef.current) clearTimeout(navLockTimerRef.current);
    },
    [],
  );

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();

    const element = document.getElementById(href.slice(1));
    if (!element) return;

    if (navLockTimerRef.current) clearTimeout(navLockTimerRef.current);

    isNavigatingRef.current = true;
    setActiveSection(href as NavSectionId);
    scrollActiveTabIntoView(
      scrollRef.current,
      href as NavSectionId,
      scrollBehavior,
    );

    const line = getScrollLine();
    window.scrollTo({
      top: Math.max(
        0,
        element.getBoundingClientRect().top + window.scrollY - line,
      ),
      behavior: scrollBehavior,
    });

    navLockTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
      setActiveSection(resolveActiveSection(getScrollLine(), navItems));
    }, NAV_LOCK_MS);
  };

  if (navItems.length === 0) return null;

  const showBarBg = solidBar || isPinned;

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      <div
        ref={barRef}
        style={{ top: stickyTop }}
        className={`course-sticky-nav sticky z-30 w-full max-w-full transition-[background,box-shadow,border-color] duration-300 ${
          showBarBg
            ? "border-b border-ink/8 bg-white/95 shadow-soft backdrop-blur-md"
            : "border-b border-transparent bg-white shadow-none"
        }`}
      >
        <Container size="2xl" className="relative !px-0 sm:!px-5 md:!px-8">
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-white/95 to-transparent transition-opacity duration-200 xl:hidden ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-white/95 to-transparent transition-opacity duration-200 xl:hidden ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />

          <nav
            ref={scrollRef}
            aria-label="Course sections"
            className="no-scrollbar flex w-full touch-pan-x items-stretch gap-1 overflow-x-auto scroll-smooth px-3 py-1.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] sm:gap-1.5 sm:px-5 sm:py-2 md:px-8 md:py-2.5 xl:snap-none xl:overflow-x-visible xl:px-0 xl:py-2.5"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={item.id}
                  title={item.label}
                  onClick={(e) => handleClick(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative flex shrink-0 snap-center items-center justify-center rounded-full px-3 py-2.5 text-center font-sans text-[11px] font-semibold leading-tight tracking-wide whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 ${focusRingClass} min-h-11 sm:px-3.5 sm:text-xs md:px-4 md:text-sm xl:min-h-0 xl:min-w-0 xl:flex-1 xl:basis-0 xl:shrink xl:snap-align-none xl:px-1 xl:py-2.5 xl:whitespace-normal xl:text-sm ${
                    isActive
                      ? activeTextClass
                      : "text-muted hover:bg-ink/4 hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="courseStickyNavActive"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }
                      }
                      className={`absolute inset-0 rounded-full border ${activePillClass}`}
                    />
                  )}
                  <span className="relative z-10 block max-w-full truncate px-0.5 sm:px-1">
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline xl:truncate">
                      {item.label}
                    </span>
                  </span>
                </a>
              );
            })}
          </nav>
        </Container>
      </div>
    </>
  );
}
