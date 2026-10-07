import { Button } from "@/components/ui";
import { Receipt } from "@/icons";
import type { AccountBooking } from "@/lib/account/bookings";
import { ACCOUNT_CARD_CLASS, formatAccountDate, formatUsd } from "./format";

type AccountBookingsProps = {
  bookings: AccountBooking[];
  /** Account email; bookings are matched on it. */
  email: string;
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  pending_payment: {
    label: "Awaiting payment",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  failed: {
    label: "Payment failed",
    className: "bg-primary/5 text-primary ring-primary/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-ink/5 text-ink/60 ring-ink/10",
  },
};

/**
 * Courses and retreats booked with the account's email.
 *
 * @param props - Bookings and the account email
 */
export default function AccountBookings({
  bookings,
  email,
}: AccountBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className={`${ACCOUNT_CARD_CLASS} py-14! text-center`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Receipt size={22} />
        </span>
        <p className="type-h4 mt-5 text-ink">No bookings yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          Courses and retreats you book with{" "}
          <span className="font-medium text-ink">{email}</span> will appear
          here.
        </p>
        <Button href="/" variant="primary" size="md" className="mt-6">
          Explore programs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="px-1 text-sm text-ink/55">
        Bookings made with <span className="font-medium text-ink">{email}</span>
      </p>
      {bookings.map((booking) => {
        const status = STATUS_STYLES[booking.status] ?? {
          label: booking.status,
          className: "bg-ink/5 text-ink/60 ring-ink/10",
        };
        const confirmed = booking.status === "confirmed";
        return (
          <article key={booking.id} className={ACCOUNT_CARD_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="type-eyebrow text-primary">
                  {booking.type === "retreat" ? "Retreat" : "Course"}
                </p>
                <h3 className="type-h4 mt-1.5 text-ink">
                  {booking.programTitle}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-ink/50">Dates</dt>
                <dd className="mt-0.5 text-ink">{booking.batchDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">Room</dt>
                <dd className="mt-0.5 capitalize text-ink">
                  {booking.roomType.replace(/[-_]/g, " ")}
                </dd>
              </div>
              {booking.duration ? (
                <div>
                  <dt className="text-xs text-ink/50">Duration</dt>
                  <dd className="mt-0.5 text-ink">{booking.duration}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-ink/50">Booked on</dt>
                <dd className="mt-0.5 text-ink">
                  {formatAccountDate(booking.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-[#fffaf8] px-4 py-3 text-sm ring-1 ring-ink/[0.05]">
              <span>
                <span className="text-ink/55">Total </span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatUsd(booking.fullAmountUsd)}
                </span>
              </span>
              {confirmed ? (
                <span>
                  <span className="text-ink/55">Paid </span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    {formatUsd(booking.paidUsd)}
                  </span>
                </span>
              ) : null}
              {booking.remainingUsd > 0 ? (
                <span>
                  <span className="text-ink/55">
                    {confirmed ? "Due on arrival " : "Unpaid "}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatUsd(booking.remainingUsd)}
                  </span>
                </span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
