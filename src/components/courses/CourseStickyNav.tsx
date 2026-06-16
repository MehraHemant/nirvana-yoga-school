"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui";

const NAV_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Inclusions", href: "#inclusions" },
  { label: "Eligibility", href: "#eligibility" },
  { label: "Syllabus", href: "#syllabus" },
  { label: "Schedule", href: "#schedule" },
  { label: "Exam", href: "#exam" },
  { label: "Lodging & Food", href: "#accommodation" },
  { label: "Dates & Fees", href: "#pricing" },
  { label: "Travel Guide", href: "#travel" },
  { label: "FAQ", href: "#faq" },
];

export default function CourseStickyNav() {
  const [activeSection, setActiveSection] = useState<string>("#overview");
  const [isSticky, setIsSticky] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Sticky state when scrolled past the hero area
      if (window.scrollY > 400) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // High-contrast active boundary
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.href.replace("#", "")),
    );

    for (const section of sections) {
      if (section) observer.observe(section);
    }

    return () => {
      for (const section of sections) {
        if (section) observer.unobserve(section);
      }
    };
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 160; // Offset for header + sticky subnav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(href);
    }
  };

  return (
    <div
      className={`w-full z-30 transition-all duration-300 ${
        isSticky
          ? "sticky top-20 bg-white/90 backdrop-blur-md border-b border-ink/5 shadow-soft py-0"
          : "relative bg-sand border-b border-ink/5 py-2"
      }`}
    >
      <Container size="xl">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1">
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 w-full justify-start md:justify-center">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`relative px-4 py-3 text-xs sm:text-sm font-medium tracking-wide font-sans whitespace-nowrap transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeSubNavTab"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute inset-0 bg-primary/5 rounded-full z-0"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </Container>
    </div>
  );
}
