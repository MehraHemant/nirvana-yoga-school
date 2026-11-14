"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Image from "@/components/ui/CdnImage";
import {
  formatOfferDeadline,
  type OfferPopupContent,
  offerDeadlineMs,
  offerSignature,
} from "@/content/types/offer-popup";
import { Check, Close, YogaAllianceSeal } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";

const STORAGE_PREFIX = "nys-offer-dismissed";

/** Routes where a promo dialog would interrupt an active flow. */
const SKIP_PREFIXES = [
  "/quiz",
  "/login",
  "/signup",
  "/account",
  "/booking",
  "/retreat-booking",
  "/enquire-now",
  "/become-an-affiliate",
  "/admin",
];

const FREQUENCY_MS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Whether the current path should skip the offer popup.
 *
 * @param pathname - Active pathname
 */
function shouldSkipPath(pathname: string | null): boolean {
  if (!pathname) return true;
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Whether this offer was dismissed recently enough to stay hidden.
 *
 * @param content - Popup document
 */
function wasDismissed(content: OfferPopupContent): boolean {
  const key = `${STORAGE_PREFIX}:${offerSignature(content)}`;
  try {
    if (content.frequency === "session") {
      return sessionStorage.getItem(key) === "1";
    }
    const at = Number(localStorage.getItem(key));
    return (
      Number.isFinite(at) && Date.now() - at < FREQUENCY_MS[content.frequency]
    );
  } catch {
    // Blocked storage — don't risk showing on every page view.
    return true;
  }
}

/**
 * Remembers a dismissal for the configured frequency.
 *
 * @param content - Popup document
 */
function rememberDismissal(content: OfferPopupContent) {
  const key = `${STORAGE_PREFIX}:${offerSignature(content)}`;
  try {
    if (content.frequency === "session") sessionStorage.setItem(key, "1");
    else localStorage.setItem(key, String(Date.now()));
  } catch {
    // ignore — still closes for this page view
  }
}

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Time left until `endMs` (null once passed).
 *
 * @param endMs - Deadline timestamp
 */
function remainingUntil(endMs: number): Remaining | null {
  const diff = endMs - Date.now();
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/**
 * Site-wide limited-time offer dialog, driven by `global_settings.offerPopup`.
 * Hidden when switched off, on flow pages, after the deadline, or when the
 * visitor dismissed this same offer within the configured frequency.
 *
 * @param props - Popup content from the CMS
 */
export default function OfferPopup({
  content,
}: {
  content: OfferPopupContent;
}) {
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const deadlineMs = offerDeadlineMs(content.deadline);
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const enabled =
    content.live &&
    Boolean(content.title.trim()) &&
    (deadlineMs === null || deadlineMs > Date.now());

  useEffect(() => {
    // `?offer-preview=1` (admin "Preview") ignores dismissal and delay.
    const preview = new URLSearchParams(window.location.search).has(
      "offer-preview",
    );
    if (
      !enabled ||
      (!preview && (shouldSkipPath(pathname) || wasDismissed(content)))
    ) {
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(
      () => setOpen(true),
      preview ? 300 : content.delaySeconds * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [pathname, enabled, content]);

  const dismiss = useCallback(() => {
    rememberDismissal(content);
    setOpen(false);
  }, [content]);

  // Countdown tick; closes itself if the offer ends while open.
  useEffect(() => {
    if (!open || deadlineMs === null) return;
    const tick = () => {
      const next = remainingUntil(deadlineMs);
      setRemaining(next);
      if (!next) setOpen(false);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [open, deadlineMs]);

  // Scroll lock, Escape, focus in/out.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, dismiss]);

  const transition = reducedTransition(reduced, {
    duration: 0.4,
    ease: EASE_OUT,
  });
  const deadlineText = formatOfferDeadline(content.deadline);
  const hasPrimary = Boolean(
    content.primaryCta.label && content.primaryCta.href,
  );
  const hasSecondary = Boolean(
    content.secondaryCta.label && content.secondaryCta.href,
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="offer-popup"
          className="fixed inset-0 z-70 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-0 border-0 bg-ink/60 backdrop-blur-[3px]"
            aria-label="Close offer"
            onClick={dismiss}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={reduced ? false : { opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 32, scale: 0.98 }}
            transition={transition}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-[1.75rem] bg-white shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)] sm:rounded-[1.75rem] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:overflow-hidden"
          >
            {/* Mobile sheet handle */}
            <span
              aria-hidden
              className="absolute left-1/2 top-2 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80 sm:hidden"
            />

            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-ink/10 transition hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close offer"
            >
              <Close size={16} />
            </button>

            {/* Image side */}
            <div className="relative h-44 overflow-hidden bg-surface-muted sm:h-56 md:h-auto md:min-h-[30rem]">
              {content.image ? (
                <Image
                  src={content.image}
                  alt={content.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 430px"
                  className="object-cover"
                  priority
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
              />
              {content.discountLabel ? (
                <motion.div
                  initial={
                    reduced ? false : { scale: 0.6, rotate: -20, opacity: 0 }
                  }
                  animate={{ scale: 1, rotate: -8, opacity: 1 }}
                  transition={reducedTransition(reduced, {
                    delay: 0.25,
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  })}
                  className="absolute left-4 top-4 flex size-24 flex-col items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_30px_-8px_rgb(163_36_50/0.7)] ring-4 ring-white/90 sm:size-28"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    Save
                  </span>
                  <span className="text-3xl font-bold leading-none sm:text-4xl">
                    {content.discountLabel}
                  </span>
                </motion.div>
              ) : null}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
                <YogaAllianceSeal size={34} className="shrink-0 drop-shadow" />
                <span className="text-xs font-medium leading-tight text-white/95 drop-shadow">
                  Yoga Alliance certified · Rishikesh, India
                </span>
              </div>
            </div>

            {/* Content side */}
            <div className="flex flex-col gap-5 px-6 pb-6 pt-6 sm:px-9 sm:pb-9 sm:pt-10">
              <div>
                {content.eyebrow ? (
                  <p className="type-eyebrow text-primary">{content.eyebrow}</p>
                ) : null}
                <h2
                  id={titleId}
                  className="mt-1.5 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-[2.5rem]"
                >
                  {content.title}
                </h2>
                {content.description ? (
                  <p
                    id={descId}
                    className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base"
                  >
                    {content.description}
                  </p>
                ) : (
                  <span id={descId} className="sr-only">
                    {deadlineText ? `Offer ends ${deadlineText}` : ""}
                  </span>
                )}
              </div>

              {remaining ? (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <span className="relative flex size-2">
                      {!reduced ? (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                      ) : null}
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    Offer ends {deadlineText}
                  </p>
                  <div
                    className="grid grid-cols-4 gap-2"
                    role="timer"
                    aria-label={`Offer ends ${deadlineText}`}
                  >
                    {(
                      [
                        ["Days", remaining.days],
                        ["Hours", remaining.hours],
                        ["Mins", remaining.minutes],
                        ["Secs", remaining.seconds],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        aria-hidden
                        className="rounded-xl border border-primary/15 bg-primary/5 px-1 py-2 text-center"
                      >
                        <span className="block text-xl font-bold tabular-nums leading-none text-ink sm:text-2xl">
                          {String(value).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-ink/60">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {content.perks.length > 0 ? (
                <ul className="space-y-2">
                  {content.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2.5 text-sm text-ink"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
              ) : null}

              {hasPrimary || hasSecondary ? (
                <div className="mt-auto grid gap-2.5 sm:grid-cols-2">
                  {hasPrimary ? (
                    <Button
                      href={content.primaryCta.href}
                      variant="primary"
                      size="md"
                      className="w-full justify-center rounded-xl"
                      onClick={dismiss}
                    >
                      {content.primaryCta.label}
                    </Button>
                  ) : null}
                  {hasSecondary ? (
                    <Button
                      href={content.secondaryCta.href}
                      variant="outline"
                      size="md"
                      className="w-full justify-center rounded-xl"
                      onClick={dismiss}
                    >
                      {content.secondaryCta.label}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                onClick={dismiss}
                className="mx-auto -mt-1 text-xs font-medium text-ink/55 underline-offset-2 hover:text-ink hover:underline"
              >
                No thanks, maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
