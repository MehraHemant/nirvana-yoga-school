"use client";

import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  /** Optional href — renders an <a> instead of <button> */
  href?: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  /** Unique layoutId prefix so multiple TabSwitchers on one page don't clash */
  layoutId: string;
  /** Visual size preset */
  size?: "sm" | "md";
  /** Container background style */
  variant?: "pill" | "inline";
  className?: string;
  /** Optional click handler for anchor tabs (e.g. smooth-scroll) */
  onAnchorClick?: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}

/**
 * Reusable animated tab switcher with a Framer Motion sliding indicator.
 *
 * Supports both `<button>` tabs (default) and `<a>` tabs (when `tab.href` is set).
 */
export default function TabSwitcher({
  tabs,
  activeId,
  onChange,
  layoutId,
  size = "md",
  variant = "pill",
  className = "",
  onAnchorClick,
}: TabSwitcherProps) {
  const sizeClasses =
    size === "sm"
      ? "px-4 sm:px-5 py-2 text-xs"
      : "px-4 sm:px-6 py-2.5 text-xs sm:text-sm";

  const wrapperClasses =
    variant === "pill"
      ? "inline-flex bg-white/70 p-1.5 rounded-full border border-ink/5 shadow-xs"
      : "flex items-center gap-1 sm:gap-2 md:gap-4 w-full justify-start md:justify-center";

  return (
    <div
      className={`flex justify-center overflow-x-auto scrollbar-none pb-2 px-4 ${className}`}
    >
      <div className={`${wrapperClasses} bg-white`}>
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          const sharedClassName = `relative ${sizeClasses} rounded-full bg-white font-semibold font-sans tracking-wide transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
            isActive ? "text-primary" : "text-muted hover:text-ink"
          }`;

          const indicator = isActive ? (
            <motion.span
              layoutId={layoutId}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 28,
              }}
              className="absolute inset-0 bg-primary/5 rounded-full z-0"
            />
          ) : null;

          // Anchor tab (used by CourseStickyNav)
          if (tab.href) {
            return (
              <a
                key={tab.id}
                href={tab.href}
                onClick={(e) => {
                  onAnchorClick?.(e, tab.href as string);
                  onChange(tab.id);
                }}
                className={sharedClassName}
              >
                {indicator}
                <span className="relative z-10">{tab.label}</span>
              </a>
            );
          }

          // Button tab (default)
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={sharedClassName}
            >
              {indicator}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
