"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import AuthFields, { type AuthMode } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui";
import { Check, Close, Lotus } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";

type QuizLauncherProps = {
  /** Signed-in account name. Absent when the visitor is not logged in. */
  name?: string;
  /** Attempts left this month. Null while logged out. */
  remainingChances?: number | null;
  /** ISO instant the next chance opens, once both are used. */
  nextAvailableAt?: string | null;
  /** Monthly attempt allowance, shown on the limit notice. */
  monthlyLimit: number;
  /** Button title from the CMS. */
  label: string;
  /** Button subtitle for visitors with attempts left, from the CMS. */
  tagline: string;
  /** Heading of the login modal, from the CMS intro title. */
  promptTitle: string;
};

type ModalView = "auth" | "limit";

const QUIZ_PATH = "/quiz";

type Eligibility = {
  remaining: number | null;
  nextAvailableAt: string | null;
};

/**
 * Current chances for the signed-in account, or null when the request fails.
 */
async function fetchEligibility(): Promise<Eligibility | null> {
  try {
    const response = await fetch("/api/quiz/attempts", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as Eligibility;
  } catch {
    return null;
  }
}

/**
 * First name for greetings.
 *
 * @param name - Full account name
 */
function firstName(name: string): string {
  const trimmed = name.trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

/**
 * Floating quiz button. Logged-out visitors get a login/signup modal,
 * signed-in visitors go straight to the quiz, and once both monthly chances
 * are used the modal shows when the next one opens.
 *
 * @param props - Session name, monthly chances, and the next open date
 */
export default function QuizLauncher({
  name,
  remainingChances = null,
  nextAvailableAt = null,
  monthlyLimit,
  label,
  tagline,
  promptTitle,
}: QuizLauncherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const titleId = useId();
  const [view, setView] = useState<ModalView | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [eligibility, setEligibility] = useState<Eligibility>({
    remaining: remainingChances,
    nextAvailableAt,
  });
  const previousPathRef = useRef(pathname);

  const signedIn = Boolean(name);
  const limitReached = signedIn && eligibility.remaining === 0;

  // Server props change on login, logout, or a full refresh.
  useEffect(() => {
    setEligibility({ remaining: remainingChances, nextAvailableAt });
  }, [remainingChances, nextAvailableAt]);

  // The layout is not re-rendered on client navigation, so re-read the count
  // after leaving the quiz page, where an attempt may have been recorded.
  useEffect(() => {
    const previous = previousPathRef.current;
    previousPathRef.current = pathname;
    if (!signedIn || previous !== QUIZ_PATH || pathname === QUIZ_PATH) return;
    let cancelled = false;
    void fetchEligibility().then((fresh) => {
      if (fresh && !cancelled) setEligibility(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, signedIn]);

  useEffect(() => {
    if (!view) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setView(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [view]);

  if (pathname === QUIZ_PATH) return null;

  async function openQuiz() {
    if (!signedIn) {
      setView("auth");
      return;
    }
    if (limitReached) {
      // A new month may have started since the page loaded.
      const fresh = await fetchEligibility();
      if (fresh) setEligibility(fresh);
      if (!fresh || fresh.remaining === 0) {
        setView("limit");
        return;
      }
    }
    router.push(QUIZ_PATH);
  }

  function onAuthSuccess() {
    setView(null);
    router.push(QUIZ_PATH);
    router.refresh();
  }

  const spring = reducedTransition(reduced, { duration: 0.35, ease: EASE_OUT });

  return (
    <>
      <motion.button
        type="button"
        onClick={openQuiz}
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reducedTransition(reduced, {
          duration: 0.5,
          delay: 0.6,
          ease: EASE_OUT,
        })}
        className="group fixed bottom-[10.5rem] right-5 z-[45] flex items-center gap-2.5 rounded-full border border-white/15 bg-linear-to-br from-primary to-primary-dark py-1.5 pl-1.5 pr-4 text-white shadow-[0_18px_40px_-14px_rgb(163_36_50/0.75)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-14px_rgb(163_36_50/0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 md:bottom-40"
        aria-haspopup={signedIn && !limitReached ? undefined : "dialog"}
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary">
          {!limitReached && !reduced ? (
            <span
              className="absolute inset-0 animate-ping rounded-full bg-white/60 [animation-duration:2.4s]"
              aria-hidden="true"
            />
          ) : null}
          <Lotus size={18} className="relative" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[0.8125rem] font-semibold tracking-wide">
            {label}
          </span>
          <span className="text-[0.6875rem] text-white/75">
            {limitReached
              ? "See next date"
              : signedIn && eligibility.remaining !== null
                ? `${eligibility.remaining} of ${monthlyLimit} left`
                : tagline}
          </span>
        </span>
      </motion.button>

      <AnimatePresence>
        {view ? (
          <motion.div
            key="quiz-modal"
            className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
          >
            <button
              type="button"
              className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
              aria-label="Close"
              onClick={() => setView(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={spring}
              className="relative max-h-[calc(100svh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[1.75rem] bg-white shadow-[0_40px_100px_-30px_rgb(0_0_0/0.5)]"
            >
              <div className="relative overflow-hidden bg-linear-to-br from-primary to-primary-dark px-6 pb-7 pt-7 text-white sm:px-8">
                <Lotus
                  size={180}
                  strokeWidth={0.6}
                  className="pointer-events-none absolute -right-10 -top-8 text-white/10"
                />
                <button
                  type="button"
                  onClick={() => setView(null)}
                  className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <Close size={16} />
                </button>
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Lotus size={20} />
                </span>
                <p className="type-eyebrow relative mt-4 text-white/75">
                  {view === "auth" ? label : "Quiz complete"}
                </p>
                <h2
                  id={titleId}
                  className="type-h3 relative mt-1.5 text-balance"
                >
                  {view === "auth"
                    ? promptTitle
                    : `Well done${name ? `, ${firstName(name)}` : ""}`}
                </h2>
                <p className="relative mt-2 text-sm leading-relaxed text-white/80">
                  {view === "auth"
                    ? `Log in or create a free account to begin. You can take the quiz ${monthlyLimit} ${monthlyLimit === 1 ? "time" : "times"} each month.`
                    : `You have used all ${monthlyLimit} attempts this month.`}
                </p>
              </div>

              {view === "auth" ? (
                <div className="px-6 pb-7 pt-6 sm:px-8">
                  <div
                    className="grid grid-cols-2 rounded-full bg-surface-muted p-1 ring-1 ring-ink/8"
                    role="tablist"
                    aria-label="Account"
                  >
                    {(["signup", "login"] as const).map((mode) => {
                      const active = authMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setAuthMode(mode)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-white text-ink shadow-sm ring-1 ring-ink/8"
                              : "text-ink/55 hover:text-ink"
                          }`}
                        >
                          {mode === "signup" ? "Sign up" : "Log in"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <AuthFields
                      key={authMode}
                      mode={authMode}
                      onSuccess={onAuthSuccess}
                      submitLabel={
                        authMode === "signup"
                          ? "Continue"
                          : "Log in & start quiz"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-7 pt-6 sm:px-8">
                  <div className="flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    {eligibility.nextAvailableAt ? (
                      <NextDateTile iso={eligibility.nextAvailableAt} />
                    ) : null}
                    <div className="min-w-0">
                      <p className="type-eyebrow text-primary/80">
                        Next quiz opens
                      </p>
                      <p className="mt-1 text-lg font-semibold text-ink">
                        {eligibility.nextAvailableAt
                          ? formatQuizNextDate(eligibility.nextAvailableAt)
                          : "Next month"}
                      </p>
                    </div>
                  </div>
                  <ul
                    className="mt-5 flex items-center gap-2"
                    aria-label={`${monthlyLimit} of ${monthlyLimit} quizzes completed this month`}
                  >
                    {Array.from({ length: monthlyLimit }, (_, index) => (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
                        key={index}
                        className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-ink/8"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={10} />
                        </span>
                        Quiz {index + 1}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="mt-6 w-full"
                    onClick={() => setView(null)}
                  >
                    Got it
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/**
 * Calendar-style tile for the next open date.
 *
 * @param props - ISO instant of the next chance
 */
function NextDateTile({ iso }: { iso: string }) {
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
  }).format(date);
  const day = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
  }).format(date);

  return (
    <div
      className="flex h-16 w-14 shrink-0 flex-col overflow-hidden rounded-xl bg-white text-center shadow-sm ring-1 ring-primary/15"
      aria-hidden="true"
    >
      <span className="bg-primary py-0.5 text-[0.625rem] font-semibold uppercase tracking-widest text-white">
        {month}
      </span>
      <span className="flex flex-1 items-center justify-center text-xl font-semibold tabular-nums text-ink">
        {day}
      </span>
    </div>
  );
}
