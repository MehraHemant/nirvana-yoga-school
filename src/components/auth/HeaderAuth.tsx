"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { ChevronDown, LogOut, Lotus, Receipt, Settings, User } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";

export type HeaderSiteUser = {
  name: string;
  email: string;
};

type HeaderAuthProps = {
  /** White text treatment used over dark heroes. */
  lightNav: boolean;
  /** Signed-in site user, when the session cookie is present. */
  siteUser: HeaderSiteUser | null;
  /** Closes the mobile menu after navigation. */
  onNavigate?: () => void;
  /** Desktop bar or stacked mobile menu. */
  layout: "desktop" | "mobile";
};

const ACCOUNT_LINKS = [
  { href: "/account", label: "My profile", icon: User },
  { href: "/account?tab=quiz", label: "Quiz results", icon: Lotus },
  { href: "/account?tab=bookings", label: "My bookings", icon: Receipt },
  { href: "/account?tab=settings", label: "Account settings", icon: Settings },
] as const;

/**
 * First name, or the email's local part when the name is blank.
 *
 * @param user - Site account name and email
 */
function displayName(user: HeaderSiteUser): string {
  const name = user.name.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  return user.email.split("@")[0] ?? user.email;
}

/**
 * Up to two initials for the avatar.
 *
 * @param user - Site account name and email
 */
export function initialsOf(user: HeaderSiteUser): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : (parts[0]?.[0] ?? user.email[0] ?? "?");
  return letters.toUpperCase();
}

/**
 * Round initials avatar in the brand colour.
 *
 * @param props - Account and pixel size class
 */
function Avatar({
  user,
  className = "h-8 w-8 text-xs",
}: {
  user: HeaderSiteUser;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-dark font-semibold tracking-wide text-white ${className}`}
      aria-hidden="true"
    >
      {initialsOf(user)}
    </span>
  );
}

/**
 * Header account controls: Log in / Sign up when signed out, and an avatar
 * menu with profile links and Log out when signed in.
 *
 * @param props - Nav color, session, and layout
 */
export default function HeaderAuth({
  lightNav,
  siteUser,
  onNavigate,
  layout,
}: HeaderAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const menuId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const stacked = layout === "mobile";

  // biome-ignore lint/correctness/useExhaustiveDependencies: close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      onNavigate?.();
      if (pathname?.startsWith("/account")) router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (!siteUser) {
    if (stacked) {
      return (
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink/5 px-1 pt-5">
          <Button
            href="/login"
            variant="ghost"
            size="md"
            className="w-full border-ink/15!"
            onClick={onNavigate}
          >
            <User size={16} />
            Log in
          </Button>
          <Button
            href="/signup"
            variant="primary"
            size="md"
            className="w-full"
            onClick={onNavigate}
          >
            Sign up
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium tracking-wide transition-colors ${
            lightNav
              ? "text-white/90 hover:bg-white/10 hover:text-white"
              : "text-ink hover:bg-ink/5 hover:text-primary"
          }`}
        >
          <User size={16} />
          Log in
        </Link>
        <Button
          href="/signup"
          variant={lightNav ? "outline-light" : "secondary"}
          size="sm"
        >
          Sign up
        </Button>
      </div>
    );
  }

  if (stacked) {
    return (
      <div className="mt-6 border-t border-ink/5 px-1 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-3 ring-1 ring-ink/5">
          <Avatar user={siteUser} className="h-11 w-11 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-ink">
              {siteUser.name}
            </p>
            <p className="truncate text-xs text-ink/55">{siteUser.email}</p>
          </div>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-2" aria-label="Account">
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-xl border border-ink/8 px-3 py-2.5 text-sm text-ink transition hover:border-primary/30 hover:bg-primary/5"
            >
              <Icon size={16} className="text-primary" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/12 px-4 py-3 text-sm font-medium text-ink transition hover:border-primary/30 hover:text-primary disabled:opacity-60"
        >
          <LogOut size={16} />
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={`Account menu, ${siteUser.name}`}
        className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
          lightNav
            ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
            : "bg-surface-muted text-ink ring-1 ring-ink/8 hover:ring-primary/30"
        }`}
      >
        <Avatar user={siteUser} />
        <span className="max-w-[8rem] truncate">{displayName(siteUser)}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={reducedTransition(reduced, {
              duration: 0.18,
              ease: EASE_OUT,
            })}
            className="absolute right-0 top-[calc(100%+0.6rem)] w-72 origin-top-right overflow-hidden rounded-2xl border border-ink/8 bg-white text-ink shadow-[0_24px_60px_-24px_rgb(26_20_16/0.35)]"
          >
            <div className="flex items-center gap-3 border-b border-ink/5 bg-[#fffaf8] px-4 py-4">
              <Avatar user={siteUser} className="h-10 w-10 text-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {siteUser.name}
                </p>
                <p className="truncate text-xs text-ink/55">{siteUser.email}</p>
              </div>
            </div>
            <div className="p-1.5">
              {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-primary/5 hover:text-primary"
                >
                  <Icon size={16} className="text-ink/45" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-ink/5 p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition hover:bg-primary/5 hover:text-primary disabled:opacity-60"
              >
                <LogOut size={16} className="text-ink/45" />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
