import { ArrowRight, Lotus, Receipt, Star } from "@/icons";
import type { AccountBooking } from "@/lib/account/bookings";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import { scorePercent } from "@/lib/quiz/scoring";
import type { AccountQuizData, AccountTab } from "./AccountView";
import { ACCOUNT_CARD_CLASS, formatAccountDate } from "./format";

type AccountOverviewProps = {
  quiz: AccountQuizData;
  bookings: AccountBooking[];
  /** Switches to another profile tab. */
  onOpen: (tab: AccountTab) => void;
};

/**
 * Summary tiles and shortcuts to the other profile sections.
 *
 * @param props - Quiz and booking data plus the tab switcher
 */
export default function AccountOverview({
  quiz,
  bookings,
  onOpen,
}: AccountOverviewProps) {
  const best = quiz.attempts.length
    ? Math.max(
        ...quiz.attempts.map((attempt) =>
          scorePercent(attempt.score, attempt.maxScore),
        ),
      )
    : null;
  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const upcoming = confirmed[0] ?? bookings[0] ?? null;

  const stats = [
    {
      icon: Lotus,
      label: "Quizzes taken",
      value: String(quiz.attempts.length),
    },
    {
      icon: Star,
      label: "Best score",
      value: best === null ? "—" : `${best}%`,
    },
    {
      icon: Receipt,
      label: "Confirmed bookings",
      value: String(confirmed.length),
    },
  ];

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className={`${ACCOUNT_CARD_CLASS} p-4! sm:p-6!`}>
            <Icon size={18} className="text-primary" />
            <dd className="mt-3 text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
              {value}
            </dd>
            <dt className="mt-1 text-xs text-ink/55 sm:text-sm">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpen("quiz")}
          className={`${ACCOUNT_CARD_CLASS} group text-left transition hover:-translate-y-0.5`}
        >
          <p className="type-eyebrow text-primary">Yoga quiz</p>
          <p className="type-h4 mt-2 text-ink">
            {quiz.remaining > 0
              ? `${quiz.remaining} of ${quiz.monthlyLimit} attempts left this month`
              : "Both attempts used this month"}
          </p>
          <p className="mt-1.5 text-sm text-ink/60">
            {quiz.remaining > 0
              ? "Test what you know about yoga and Rishikesh."
              : quiz.nextAvailableAt
                ? `Your next quiz opens on ${formatQuizNextDate(quiz.nextAvailableAt)}.`
                : "Your next quiz opens next month."}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            See quiz history
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpen("bookings")}
          className={`${ACCOUNT_CARD_CLASS} group text-left transition hover:-translate-y-0.5`}
        >
          <p className="type-eyebrow text-primary">Bookings</p>
          {upcoming ? (
            <>
              <p className="type-h4 mt-2 line-clamp-2 text-ink">
                {upcoming.programTitle}
              </p>
              <p className="mt-1.5 text-sm text-ink/60">
                {upcoming.batchDate} · booked{" "}
                {formatAccountDate(upcoming.createdAt)}
              </p>
            </>
          ) : (
            <>
              <p className="type-h4 mt-2 text-ink">No bookings yet</p>
              <p className="mt-1.5 text-sm text-ink/60">
                Courses and retreats you book will show up here.
              </p>
            </>
          )}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {bookings.length > 0
              ? `View all ${bookings.length} booking${bookings.length === 1 ? "" : "s"}`
              : "View bookings"}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </button>
      </div>
    </div>
  );
}
