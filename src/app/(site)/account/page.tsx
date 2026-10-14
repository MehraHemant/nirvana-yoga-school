import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountView, { type AccountTab } from "@/components/account/AccountView";
import { listBookingsForEmail } from "@/lib/account/bookings";
import { getSiteUserProfile } from "@/lib/auth/site-auth";
import { getSiteServerSession } from "@/lib/auth/site-session";
import { getQuizEligibility, listQuizAttempts } from "@/lib/quiz/attempts";
import { getQuizSettings } from "@/lib/quiz/settings";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false },
};

const TABS = new Set<AccountTab>(["overview", "quiz", "bookings", "settings"]);

type AccountPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

/**
 * Signed-in profile: account details, quiz history, bookings, and settings.
 *
 * @param props - Optional `tab` query to open a section directly
 */
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await getSiteServerSession().catch(() => null);
  if (!session) redirect("/login?next=/account");

  const settings = await getQuizSettings();
  const [profile, eligibility, attempts, params] = await Promise.all([
    getSiteUserProfile(session.userId).catch(() => null),
    getQuizEligibility(session.userId, settings.monthlyLimit).catch(() => ({
      remaining: settings.monthlyLimit,
      nextAvailableAt: null,
    })),
    listQuizAttempts(session.userId).catch(() => []),
    searchParams,
  ]);
  if (!profile) redirect("/login?next=/account");

  const bookings = await listBookingsForEmail(profile.email).catch(() => []);
  const tab = TABS.has(params.tab as AccountTab)
    ? (params.tab as AccountTab)
    : "overview";

  return (
    <AccountView
      initialTab={tab}
      profile={profile}
      quiz={{
        ...eligibility,
        attempts,
        monthlyLimit: settings.monthlyLimit,
        open: settings.live,
      }}
      bookings={bookings}
    />
  );
}
