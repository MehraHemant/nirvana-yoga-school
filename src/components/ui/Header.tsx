"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useId, useLayoutEffect, useState } from "react";
import { type NavItem, navItemHref, navLinkHref } from "@/constants/navigation";
import type { GlobalHeader, HeaderCta } from "@/content/types/global-settings";
import { ArrowRight, ChevronDown, MenuIcon } from "@/icons";
import { normalizeHeaderCtas } from "@/lib/cms/header-fields";
import Button from "./Button";

const DEFAULT_LOGO_LIGHT = "/logo.png";
const DEFAULT_LOGO_DARK = "/logo_white.png";
const LEGACY_TRANSPARENT_HERO_PATHS = new Set(["/", "/enquire-now"]);

type HeaderData = Partial<GlobalHeader> & {
  navigation?: NavItem[];
  logo?: Partial<GlobalHeader["logo"]>;
};

/**
 * Whether a CTA should open in a new tab.
 *
 * @param cta - Header CTA row
 */
function ctaIsExternal(cta: HeaderCta): boolean {
  if (typeof cta.external === "boolean") return cta.external;
  return /^https?:\/\//i.test(cta.href);
}

/**
 * Renders one header CTA as a text link or button.
 *
 * @param props - CTA row, overlay-nav state, and optional click handler
 */
function HeaderCtaControl({
  cta,
  lightNav,
  onNavigate,
  className = "",
  size = "sm",
}: {
  cta: HeaderCta;
  lightNav: boolean;
  onNavigate?: () => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const props = {
    ...linkProps(cta.href, ctaIsExternal(cta)),
    onClick: onNavigate,
  };

  if (cta.variant === "link") {
    return (
      <Link
        {...props}
        className={`nav-link text-sm xl:text-[0.9375rem] 2xl:text-base font-medium tracking-wide px-2 py-1.5 transition-colors hover:text-primary  ${lightNav ? "text-white/85" : "text-ink"} ${className}`.trim()}
      >
        {cta.label}
      </Link>
    );
  }

  return (
    <Button
      href={cta.href}
      variant={cta.variant}
      size={size}
      className={`shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow duration-300 ${className}`.trim()}
      onClick={onNavigate}
      {...(ctaIsExternal(cta)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {cta.label}
    </Button>
  );
}

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

/**
 * Returns a safe internal or HTTP(S) destination for the header logo.
 *
 * @param value - Configured logo destination
 */
function safeLogoHref(value: unknown): string {
  if (typeof value !== "string") return "/";
  const href = value.trim();
  if (href.startsWith("/") || /^https?:\/\//i.test(href)) return href;
  return "/";
}

/**
 * Checks whether the current page needs a transparent header.
 *
 * @param pathname - Current client pathname
 */
function hasTransparentHeader(pathname: string | null): boolean {
  return (
    document.querySelector('[data-transparent-header="true"]') !== null ||
    (pathname !== null && LEGACY_TRANSPARENT_HERO_PATHS.has(pathname))
  );
}

function NavText({
  lightNav,
  className = "",
}: {
  lightNav: boolean;
  className?: string;
}) {
  return lightNav ? `text-white/90 ${className}` : `text-ink ${className}`;
}

function DesktopDropdown({
  item,
  lightNav,
}: {
  item: Extract<NavItem, { type: "dropdown" }>;
  lightNav: boolean;
}) {
  const menuId = useId();
  const [forceClosed, setForceClosed] = useState(false);
  const textClass = NavText({
    lightNav,
    className:
      "nav-link nav-dropdown-trigger text-sm xl:text-[0.9375rem] 2xl:text-base font-medium tracking-wide flex items-center gap-1.5 py-1.5 ",
  });

  const regularItems = item.items.filter(
    (sub) => !sub.label.toLowerCase().includes("see all"),
  );
  const seeAllItem = item.items.find((sub) =>
    sub.label.toLowerCase().includes("see all"),
  );
  const dropdownHref = navItemHref(item);

  const reopenDropdown = () => setForceClosed(false);

  const closeDropdown = () => {
    setForceClosed(true);
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  };

  return (
    <div
      className={`nav-dropdown relative${forceClosed ? " nav-dropdown--closed" : ""}`}
    >
      {dropdownHref ? (
        <Link
          {...linkProps(dropdownHref, item.external)}
          className={textClass}
          aria-haspopup="true"
          aria-controls={menuId}
          onMouseEnter={reopenDropdown}
          onFocus={reopenDropdown}
        >
          {item.label} <ChevronDown className="nav-chevron opacity-70" />
        </Link>
      ) : (
        <button
          type="button"
          className={textClass}
          aria-haspopup="true"
          aria-controls={menuId}
          onMouseEnter={reopenDropdown}
          onFocus={reopenDropdown}
        >
          {item.label} <ChevronDown className="nav-chevron opacity-70" />
        </button>
      )}

      <div
        id={menuId}
        className="nav-dropdown-panel absolute top-full left-1/2 -translate-x-1/4 pt-5 z-50"
      >
        <div className="nav-dropdown-menu min-w-[360px] max-w-[420px] max-h-[72vh] overflow-hidden rounded-3xl">
          <span className="nav-dropdown-caret" aria-hidden="true" />
          <div className="px-6 pt-6 pb-4 border-b border-ink/5">
            <p className="text-xl font-medium text-ink leading-tight">{item.label}</p>
            <p className="text-sm text-ink mt-1.5 tracking-wide">
              Programs in Rishikesh, India
            </p>
          </div>
          <div className="overflow-y-auto max-h-[52vh] py-2 px-2">
            {regularItems.map((sub) => (
              <Link
                key={navLinkHref(sub)}
                {...linkProps(
                  navLinkHref(sub),
                  "external" in sub ? sub.external : undefined,
                )}
                onClick={closeDropdown}
                className="nav-dropdown-item group/item flex items-start gap-3 rounded-xl px-4 py-3 text-base text-ink hover:text-primary leading-snug"
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
                {...linkProps(
                  navLinkHref(seeAllItem),
                  "external" in seeAllItem ? seeAllItem.external : undefined,
                )}
                onClick={closeDropdown}
                className="nav-dropdown-cta flex items-center justify-between rounded-2xl bg-primary/5 hover:bg-primary/10 px-4 py-3 text-base font-medium text-primary transition-colors"
              >
                {seeAllItem.label} <ArrowRight size={16} />
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
    const href = navItemHref(item);
    if (!href) return null;
    return (
      <Link
        {...linkProps(href, item.external)}
        onClick={onNavigate}
        style={style}
        className="mobile-nav-item py-3.5 px-3 text-lg font-medium text-ink hover:text-primary border-b border-ink/5 tracking-wide"
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
        className="w-full py-3.5 px-3 flex items-center justify-between text-lg font-medium text-ink hover:text-primary tracking-wide"
      >
        {item.label}{" "}
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
            {(item.href || item.page) && (
              <Link
                {...linkProps(navItemHref(item) ?? "#", item.external)}
                onClick={onNavigate}
                className="py-2 px-2 text-base font-medium text-primary tracking-wide"
              >
                View all {item.label.toLowerCase()}
              </Link>
            )}
            {item.items.map((sub) => (
              <Link
                key={navLinkHref(sub)}
                {...linkProps(
                  navLinkHref(sub),
                  "external" in sub ? sub.external : undefined,
                )}
                onClick={() => {
                  setOpen(false);
                  onNavigate();
                }}
                className="py-2 px-2 text-base text-ink hover:text-primary leading-snug"
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

type HeaderProps = {
  /** Server-loaded header settings from the site layout */
  initialData?: HeaderData | null;
};

/**
 * Site header with a clear overlay at rest and a solid bar after scroll.
 *
 * @param props - Server-provided header settings (no client API fetch)
 */
export default function Header({ initialData = null }: HeaderProps) {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasTransparentHero, setHasTransparentHero] = useState(
    () => pathname !== null && LEGACY_TRANSPARENT_HERO_PATHS.has(pathname),
  );
  const headerData = initialData;

  useLayoutEffect(() => {
    const syncTransparentHero = () => {
      const nextHasTransparentHero = hasTransparentHeader(pathname);
      setHasTransparentHero((currentHasTransparentHero) =>
        currentHasTransparentHero === nextHasTransparentHero
          ? currentHasTransparentHero
          : nextHasTransparentHero,
      );
    };

    syncTransparentHero();
    const observer = new MutationObserver(syncTransparentHero);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-transparent-header"],
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(pathname ? window.scrollY > 16 : false);
  }, [pathname]);

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

  // Clear overlay at rest; solid bar after scroll or when the mobile menu is open.
  // White nav only over dark/media heroes — light pages keep dark nav for contrast.
  const solid = scrolled || mobileOpen;
  const lightNav = hasTransparentHero && !solid;
  const innerHeightClass = scrolled
    ? "h-[4.5rem] md:h-[5rem]"
    : "h-[4.75rem] md:h-[5.5rem]";
  const headerTop = scrolled
    ? "top-[4.5rem] md:top-[5rem]"
    : "top-[4.75rem] md:top-[5.5rem]";
  const linkClass = NavText({
    lightNav,
    className:
      "nav-link text-sm xl:text-[0.9375rem] 2xl:text-base font-medium tracking-wide py-1.5 ",
  });

  useLayoutEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const syncHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${height}px`,
      );
    };
    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);
    window.addEventListener("resize", syncHeaderHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  const navigation = headerData?.navigation ?? [];
  const logoLight = headerData?.logo?.light ?? DEFAULT_LOGO_LIGHT;
  const logoDark = headerData?.logo?.dark ?? DEFAULT_LOGO_DARK;
  const logoLightAlt =
    headerData?.logo?.lightAlt?.trim() || "Nirvana Yoga School";
  const logoDarkAlt =
    headerData?.logo?.darkAlt?.trim() || "Nirvana Yoga School";
  const logoHref = safeLogoHref(headerData?.logo?.href);
  const ctas = normalizeHeaderCtas(headerData);

  return (
    <>
      <header
        className={`header-shell fixed top-0 z-50 w-full ${solid ? "header-shell--solid" : "header-shell--overlay"}${lightNav ? " header-shell--light-nav" : ""}`}
      >
        <div
          className={`header-inner w-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4 ${innerHeightClass}`}
        >
          <Link
            {...linkProps(logoHref)}
            className="flex items-center shrink-0 group"
            aria-label={logoLightAlt}
          >
            <div className="header-logo-mark relative h-14 md:h-16 xl:h-[4.25rem] 2xl:h-20 w-[148px] md:w-[168px] xl:w-[180px] 2xl:w-[196px]">
              <Image
                src={logoDark}
                alt={logoDarkAlt}
                width={196}
                height={78}
                priority
                className={`absolute inset-0 h-full w-auto object-contain object-left transition-all duration-500 ease-out ${lightNav ? "opacity-100 scale-100 group-hover:scale-[1.02]" : "opacity-0 scale-95"}`}
              />
              <Image
                src={logoLight}
                alt={logoLightAlt}
                width={196}
                height={78}
                priority
                className={`absolute inset-0 h-full w-auto object-contain object-left transition-all duration-500 ease-out ${lightNav ? "opacity-0 scale-95" : "opacity-100 scale-100 group-hover:scale-[1.02]"}`}
              />
            </div>
          </Link>

          <nav
            className="hidden xl:flex items-center gap-2.5 2xl:gap-5"
            aria-label="Primary"
          >
            {navigation.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.label}
                  {...linkProps(navItemHref(item) ?? "#", item.external)}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              ) : (
                <DesktopDropdown key={item.label} item={item} lightNav={lightNav} />
              ),
            )}
          </nav>

          <div className="hidden xl:flex items-center gap-2 2xl:gap-3 shrink-0">
            {ctas.map((cta, index) => {
              const prev = index > 0 ? ctas[index - 1] : null;
              const showDivider =
                prev != null &&
                (prev.variant === "link") !== (cta.variant === "link");
              return (
                <Fragment key={`${cta.label}-${cta.href}-${index}`}>
                  {showDivider ? (
                    <span
                      className={`h-4 w-px transition-colors duration-500 ${lightNav ? "bg-white/20" : "bg-ink/10"}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <HeaderCtaControl cta={cta} lightNav={lightNav} />
                </Fragment>
              );
            })}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={`header-menu-btn xl:hidden p-2.5 rounded-full transition-colors duration-300 ${lightNav ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5"}`}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="xl:hidden mobile-menu-backdrop mobile-menu-backdrop--open fixed inset-0 z-40 border-0 bg-ink/40 backdrop-blur-[2px] p-0 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`xl:hidden mobile-menu-panel mobile-menu-panel--open fixed inset-x-0 ${headerTop} bottom-0 z-40 bg-white border-t border-ink/5 overflow-y-auto`}
            aria-hidden={false}
          >
            <nav
              className="w-full px-4 md:px-6 lg:px-8 py-5 flex flex-col"
              aria-label="Mobile"
            >
              {navigation.map((item, i) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  index={i}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              {ctas.map((cta, index) =>
                cta.variant === "link" ? (
                  <HeaderCtaControl
                    key={`mobile-cta-${cta.label}-${cta.href}-${index}`}
                    cta={cta}
                    lightNav={false}
                    onNavigate={() => setMobileOpen(false)}
                    className="mobile-nav-item mobile-nav-item--block py-3.5 px-3 text-lg font-medium text-ink hover:text-primary border-b border-ink/5 tracking-wide"
                  />
                ) : (
                  <div
                    key={`mobile-cta-${cta.label}-${cta.href}-${index}`}
                    className="mobile-nav-item px-1 pt-3"
                    style={{
                      animationDelay: `${0.05 + (navigation.length + index) * 0.04}s`,
                    }}
                  >
                    <HeaderCtaControl
                      cta={cta}
                      lightNav={false}
                      size="md"
                      onNavigate={() => setMobileOpen(false)}
                      className="w-full"
                    />
                  </div>
                ),
              )}
              <div
                className="mobile-nav-item mt-6 flex flex-col gap-3 pb-10 px-1"
                style={{
                  animationDelay: `${0.05 + (navigation.length + ctas.length) * 0.04}s`,
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
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
