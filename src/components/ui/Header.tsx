"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { logo, logo_white } from "@/assets";
import { type NavItem, PRIMARY_NAV, SIGN_IN_URL } from "@/constants/navigation";
import { ArrowRight, ChevronDown, MenuIcon } from "@/icons";
import Button from "./Button";

function linkProps(href: string, external?: boolean) {
  if (external || href.startsWith("http")) {
    return {
      href,
      target: "_blank" as const,
      rel: "noopener noreferrer" as const,
    };
  }
  return { href };
}

function NavText({
  solid,
  className = "",
}: {
  solid: boolean;
  className?: string;
}) {
  return solid ? `text-ink/90 ${className}` : `text-white/90 ${className}`;
}

function DesktopDropdown({
  item,
  solid,
}: {
  item: Extract<NavItem, { type: "dropdown" }>;
  solid: boolean;
}) {
  const menuId = useId();
  const textClass = NavText({
    solid,
    className:
      "nav-link nav-dropdown-trigger text-sm font-medium tracking-wide flex items-center gap-1.5 py-1.5 font-sans",
  });

  const regularItems = item.items.filter(
    (sub) => !sub.label.toLowerCase().includes("see all"),
  );
  const seeAllItem = item.items.find((sub) =>
    sub.label.toLowerCase().includes("see all"),
  );

  return (
    <div className="nav-dropdown relative">
      {item.href ? (
        <Link
          {...linkProps(item.href, item.external)}
          className={textClass}
          aria-haspopup="true"
          aria-controls={menuId}
        >
          {item.label}
          <ChevronDown className="nav-chevron opacity-70" />
        </Link>
      ) : (
        <button
          type="button"
          className={textClass}
          aria-haspopup="true"
          aria-controls={menuId}
        >
          {item.label}
          <ChevronDown className="nav-chevron opacity-70" />
        </button>
      )}

      <div
        id={menuId}
        className="nav-dropdown-panel absolute top-full left-1/2 -translate-x-1/4 pt-5 z-50"
      >
        <div className="nav-dropdown-menu min-w-[360px] max-w-[420px] max-h-[72vh] overflow-hidden rounded-3xl">
          <span className="nav-dropdown-caret" aria-hidden="true" />

          <div className="px-6 pt-6 pb-4 border-b border-ink/5">
            <p className="font-serif text-xl text-ink leading-tight">
              {item.label}
            </p>
            <p className="text-xs text-muted mt-1.5 font-sans tracking-wide">
              Programs in Rishikesh, India
            </p>
          </div>

          <div className="overflow-y-auto max-h-[52vh] py-2 px-2">
            {regularItems.map((sub) => (
              <Link
                key={sub.href}
                {...linkProps(sub.href, sub.external)}
                className="nav-dropdown-item group/item flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-ink/80 hover:text-primary leading-snug font-sans"
              >
                <span
                  className="mt-2 w-1 h-1 rounded-full bg-accent shrink-0 group-hover/item:bg-primary transition-colors"
                  aria-hidden="true"
                />
                <span>{sub.label}</span>
              </Link>
            ))}
          </div>

          {seeAllItem && (
            <div className="px-4 pb-4 pt-2 border-t border-ink/5">
              <Link
                {...linkProps(seeAllItem.href, seeAllItem.external)}
                className="nav-dropdown-cta flex items-center justify-between rounded-2xl bg-primary/5 hover:bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors font-sans"
              >
                {seeAllItem.label}
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  index,
  onNavigate,
}: {
  item: NavItem;
  index: number;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const style = { animationDelay: `${0.05 + index * 0.04}s` };

  if (item.type === "link") {
    return (
      <Link
        {...linkProps(item.href, item.external)}
        onClick={onNavigate}
        style={style}
        className="mobile-nav-item py-3.5 px-3 text-base font-medium text-ink/90 hover:text-primary border-b border-ink/5 font-sans tracking-wide"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div style={style} className="mobile-nav-item border-b border-ink/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full py-3.5 px-3 flex items-center justify-between text-base font-medium text-ink/90 hover:text-primary font-sans tracking-wide"
      >
        {item.label}
        <ChevronDown
          className={`nav-chevron opacity-70 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={panelId}
        className={`mobile-accordion-grid ${open ? "mobile-accordion-grid--open" : ""}`}
      >
        <div className="mobile-accordion-inner">
          <div className="pb-3 pl-4 pr-2 flex flex-col gap-0.5">
            {item.href && (
              <Link
                {...linkProps(item.href, item.external)}
                onClick={onNavigate}
                className="py-2 px-2 text-sm font-semibold text-primary tracking-wide"
              >
                View all {item.label.toLowerCase()}
              </Link>
            )}
            {item.items.map((sub) => (
              <Link
                key={sub.href}
                {...linkProps(sub.href, sub.external)}
                onClick={onNavigate}
                className="py-2 px-2 text-sm text-ink/75 hover:text-primary leading-snug font-sans"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 48);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen;
  const headerTop = scrolled
    ? "top-[4.5rem] md:top-[5rem]"
    : "top-[4.75rem] md:top-[5.5rem]";
  const linkClass = NavText({
    solid,
    className: "nav-link text-sm font-medium tracking-wide py-1.5 font-sans",
  });

  return (
    <>
      <header
        className={`header-shell fixed top-0 z-50 w-full ${
          solid ? "header-shell--solid" : "bg-transparent"
        }`}
      >
        <div
          className={`header-inner mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between gap-4 ${
            scrolled ? "h-[4.5rem] md:h-[5rem]" : "h-[4.75rem] md:h-[5.5rem]"
          }`}
        >
          <Link
            href="/"
            className="flex items-center shrink-0 group"
            aria-label="Nirvana Yoga School home"
          >
            <div className="relative h-16 md:h-20 w-[168px] md:w-[196px]">
              <Image
                src={logo_white}
                alt=""
                width={196}
                height={78}
                priority
                className={`absolute inset-0 h-full w-auto object-contain object-left transition-all duration-500 ease-out ${
                  solid
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100 group-hover:scale-[1.02]"
                }`}
              />
              <Image
                src={logo}
                alt="Nirvana Yoga School"
                width={196}
                height={78}
                priority
                className={`absolute inset-0 h-full w-auto object-contain object-left transition-all duration-500 ease-out ${
                  solid
                    ? "opacity-100 scale-100 group-hover:scale-[1.02]"
                    : "opacity-0 scale-95"
                }`}
              />
            </div>
          </Link>

          <nav
            className="hidden xl:flex items-center gap-4 2xl:gap-6"
            aria-label="Primary"
          >
            {PRIMARY_NAV.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.label}
                  {...linkProps(item.href, item.external)}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              ) : (
                <DesktopDropdown key={item.label} item={item} solid={solid} />
              ),
            )}
          </nav>

          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <Link
              href={SIGN_IN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`nav-link text-sm font-semibold tracking-wide px-2 py-1.5 transition-colors hover:text-primary font-sans ${solid ? "text-ink/80" : "text-white/85"}`}
            >
              Sign in
            </Link>
            <span
              className={`h-4 w-px transition-colors duration-500 ${solid ? "bg-ink/10" : "bg-white/20"}`}
              aria-hidden="true"
            />
            <Button
              href="#courses"
              variant="primary"
              size="sm"
              className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow duration-300"
            >
              Enquire Now
            </Button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={`xl:hidden p-2.5 rounded-full transition-colors duration-300 ${
              solid ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10"
            }`}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </header>

      {/* Mobile overlay + panel — inert when closed so links cannot intercept clicks */}
      <div
        className={`xl:hidden mobile-menu-backdrop fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] ${
          mobileOpen ? "mobile-menu-backdrop--open" : ""
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`xl:hidden mobile-menu-panel fixed inset-x-0 ${headerTop} bottom-0 z-40 bg-sand/97 backdrop-blur-xl border-t border-ink/5 overflow-y-auto ${
          mobileOpen ? "mobile-menu-panel--open" : ""
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
      >
        <nav
          className="mx-auto max-w-7xl px-4 py-5 flex flex-col"
          aria-label="Mobile"
        >
          {PRIMARY_NAV.map((item, i) => (
            <MobileNavItem
              key={item.label}
              item={item}
              index={i}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}

          <Link
            href={SIGN_IN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{ animationDelay: `${0.05 + PRIMARY_NAV.length * 0.04}s` }}
            className="mobile-nav-item py-3.5 px-3 text-base font-semibold text-ink/90 hover:text-primary border-b border-ink/5 tracking-wide"
          >
            Sign in
          </Link>

          <div
            className="mobile-nav-item mt-8 flex flex-col gap-3 pb-10 px-1"
            style={{
              animationDelay: `${0.05 + (PRIMARY_NAV.length + 1) * 0.04}s`,
            }}
          >
            <Button
              href="#contact"
              variant="ghost"
              size="md"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Button>
            <Button
              href="#courses"
              variant="primary"
              size="md"
              onClick={() => setMobileOpen(false)}
            >
              Enquire Now
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
