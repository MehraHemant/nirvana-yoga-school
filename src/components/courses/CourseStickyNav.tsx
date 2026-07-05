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

export default function CourseStickyNav({
  items,
}: {
  items?: StickyNavItem[];
}) {
  const navItems = items && items.length > 0 ? items : [...DEFAULT_NAV_ITEMS];
  const prefersReduced = useReducedMotion() ?? false;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const navLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeSection, setActiveSection] = useState<NavSectionId>(
    navItems[0]?.id ?? "#overview",
  );
  const [isPinned, setIsPinned] = useState(false);
  const [stickyTop, setStickyTop] = useState(80);

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

  useEffect(() => {
    const syncHeader = () => setStickyTop(getHeaderHeight());
    const onResize = () => {
      syncHeader();
      syncSectionMargins();
    };

    syncHeader();
    syncSectionMargins();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", onResize);
    };
  }, [syncSectionMargins]);

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

    const line = getScrollLine();
    window.scrollTo({
      top: Math.max(
        0,
        element.getBoundingClientRect().top + window.scrollY - line,
      ),
      behavior: prefersReduced ? "auto" : "smooth",
    });

    navLockTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
      setActiveSection(resolveActiveSection(getScrollLine(), navItems));
    }, NAV_LOCK_MS);
  };

  if (navItems.length === 0) return null;

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      <div
        ref={barRef}
        style={{ top: stickyTop }}
        className={`sticky z-30 w-full max-w-full transition-[background,box-shadow,border-color] duration-300 ${
          isPinned
            ? "border-b border-ink/8 bg-white/90 shadow-soft backdrop-blur-md"
            : "border-b border-transparent bg-transparent shadow-none"
        }`}
      >
        <Container size="2xl">
          <nav
            aria-label="Course sections"
            className="flex w-full items-stretch gap-0.5 py-2 sm:gap-1 sm:py-2.5"
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
                  className={`relative flex min-w-0 flex-1 basis-0 items-center justify-center rounded-full px-0.5 py-2 text-center font-sans text-[9px] font-semibold leading-tight tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-[390px]:text-[10px] sm:px-1 sm:py-2.5 sm:text-xs md:text-sm ${
                    isActive
                      ? "text-primary"
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
                      className="absolute inset-0 rounded-full border border-primary/15 bg-primary/8"
                    />
                  )}
                  <span className="relative z-10 block w-full truncate px-0.5 sm:px-1">
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
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
