"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { initialsOf } from "@/components/auth/HeaderAuth";
import { Container } from "@/components/ui";
import { Check, Lotus, Receipt, Settings, User } from "@/icons";
import type { AccountBooking } from "@/lib/account/bookings";
import type { SiteUserProfile } from "@/lib/auth/site-auth";
import type { QuizAttemptSummary } from "@/lib/quiz/attempts";
import AccountBookings from "./AccountBookings";
import AccountOverview from "./AccountOverview";
import AccountQuiz from "./AccountQuiz";
import AccountSettings from "./AccountSettings";
import { formatAccountDate } from "./format";

export type AccountTab = "overview" | "quiz" | "bookings" | "settings";

export type AccountQuizData = {
  remaining: number;
  nextAvailableAt: string | null;
  monthlyLimit: number;
  /** False while the quiz is switched off in the CMS. */
  open: boolean;
  attempts: QuizAttemptSummary[];
};

type AccountViewProps = {
  initialTab: AccountTab;
  profile: SiteUserProfile;
  quiz: AccountQuizData;
  bookings: AccountBooking[];
};

const TABS: { id: AccountTab; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "quiz", label: "Quiz", icon: Lotus },
  { id: "bookings", label: "Bookings", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * Profile shell: identity banner, section tabs, and the active section.
 * The tab is mirrored to `?tab=` so header links open the right section.
 *
 * @param props - Profile, quiz, and booking data from the server
 */
export default function AccountView({
  initialTab,
  profile,
  quiz,
  bookings,
}: AccountViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const [name, setName] = useState(profile.name);

  // Header links change `?tab=` while this page stays mounted.
  const [lastInitialTab, setLastInitialTab] = useState(initialTab);
  if (initialTab !== lastInitialTab) {
    setLastInitialTab(initialTab);
    setTab(initialTab);
  }

  function selectTab(next: AccountTab) {
    setTab(next);
    const query = next === "overview" ? "" : `?tab=${next}`;
    router.replace(`${pathname}${query}`, { scroll: false });
  }

  const user = { name, email: profile.email };

  return (
    <section className="relative min-h-svh overflow-hidden bg-[#fffaf8] pb-24 pt-[calc(var(--site-header-height)+2rem)] sm:pt-[calc(var(--site-header-height)+3rem)]">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-primary/[0.07] blur-3xl"
        aria-hidden="true"
      />
      <Container size="md" className="relative">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary to-primary-dark px-6 py-8 text-white shadow-[0_40px_90px_-48px_rgb(163_36_50/0.8)] sm:px-10 sm:py-10">
          <Lotus
            size={260}
            strokeWidth={0.5}
            className="pointer-events-none absolute -right-12 -top-16 text-white/10"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold text-primary shadow-lg ring-4 ring-white/20">
              {initialsOf(user)}
            </span>
            <div className="min-w-0">
              <p className="type-eyebrow text-white/70">My profile</p>
              <h1 className="type-h2 mt-1 truncate">{name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/80">
                <span className="truncate">{profile.email}</span>
                {profile.emailVerifiedAt ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-white/20">
                    <Check size={10} />
                    Verified
                  </span>
                ) : null}
                <span className="text-white/60">
                  Member since {formatAccountDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="sticky top-[calc(var(--site-header-height)+0.75rem)] z-20 mx-auto -mt-6 grid w-full grid-cols-4 gap-1 rounded-full sm:flex sm:w-fit border border-ink/[0.06] bg-white/95 p-1.5 shadow-[0_16px_40px_-24px_rgb(26_20_16/0.35)] backdrop-blur"
          role="tablist"
          aria-label="Profile sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium transition sm:gap-2 sm:px-5 sm:text-sm ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon size={15} className="hidden shrink-0 sm:block" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-8" role="tabpanel">
          {tab === "overview" ? (
            <AccountOverview
              quiz={quiz}
              bookings={bookings}
              onOpen={selectTab}
            />
          ) : null}
          {tab === "quiz" ? <AccountQuiz quiz={quiz} /> : null}
          {tab === "bookings" ? (
            <AccountBookings bookings={bookings} email={profile.email} />
          ) : null}
          {tab === "settings" ? (
            <AccountSettings
              name={name}
              email={profile.email}
              onNameSaved={setName}
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
