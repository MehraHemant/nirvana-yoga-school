"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

function getScrollOffset(navHeight: number): number {
  const header = document.querySelector("header");
  const headerHeight = header?.getBoundingClientRect().height ?? 80;
  return headerHeight + navHeight + 16;
}

function resolveActiveSection(
  offset: number,
  navItems: StickyNavItem[],
): NavSectionId {
  const nearBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 120;

  if (nearBottom && navItems.length > 0) {
    return navItems[navItems.length - 1].id;
  }

  let active: NavSectionId = navItems[0]?.id ?? "#overview";

  for (const item of navItems) {
    const el = document.getElementById(item.id.slice(1));
    if (!el) continue;

    if (el.getBoundingClientRect().top <= offset) {
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
  const barRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<NavSectionId>(
    navItems[0]?.id ?? "#overview",
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const isNavigatingRef = useRef(false);
  const navLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    for (const item of navItems) {
      const el = document.getElementById(item.id.slice(1));
      if (el) {
        el.style.scrollMarginTop = "7.5rem";
      }
    }
  }, [navItems]);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      setIsScrolled(window.scrollY > 400);

      if (isNavigatingRef.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const navHeight = barRef.current?.getBoundingClientRect().height ?? 52;
        const offset = getScrollOffset(navHeight);

        setActiveSection((prev) => {
          const next = resolveActiveSection(offset, navItems);
          return prev === next ? prev : next;
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [navItems]);

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

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (!element) return;

    if (navLockTimerRef.current) clearTimeout(navLockTimerRef.current);

    isNavigatingRef.current = true;
    setActiveSection(href as NavSectionId);

    const navHeight = barRef.current?.getBoundingClientRect().height ?? 52;
    const offset = getScrollOffset(navHeight);
    const top = element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReduced ? "auto" : "smooth",
    });

    navLockTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
      const nextOffset = getScrollOffset(
        barRef.current?.getBoundingClientRect().height ?? 52,
      );
      setActiveSection(resolveActiveSection(nextOffset, navItems));
    }, NAV_LOCK_MS);
  };

  if (navItems.length === 0) return null;

  return (
    <div
      ref={barRef}
      className={`sticky top-20 z-30 w-full max-w-full transition-[background,box-shadow,border-color] duration-300 ${
        isScrolled
          ? "border-b border-ink/8 bg-white/90 shadow-soft backdrop-blur-md"
          : "bg-white"
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
  );
}
