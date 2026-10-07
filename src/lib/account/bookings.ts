import "server-only";
import { centsToUsd } from "@/lib/booking/pricing";
import { db, isDbEnabled } from "@/lib/db";

export type AccountBooking = {
  id: string;
  type: "course" | "retreat";
  status: string;
  programTitle: string;
  programSlug: string;
  roomType: string;
  batchDate: string;
  duration: string | null;
  paymentMode: "full" | "deposit_20";
  fullAmountUsd: number;
  paidUsd: number;
  remainingUsd: number;
  createdAt: string;
};

type BookingRow = {
  id: string;
  type: "course" | "retreat";
  status: string;
  program_title: string;
  program_slug: string;
  room_type: string;
  batch_date: string;
  duration: string | null;
  payment_mode: "full" | "deposit_20";
  full_amount_cents: number;
  total_pay_now_cents: number;
  pay_now_cents: number;
  remaining_cents: number;
  created_at: Date;
};

/**
 * Bookings made with the account's email. Signup emails are verified by
 * code, so matching on email only shows bookings the owner made.
 *
 * @param email - Verified account email
 */
export async function listBookingsForEmail(
  email: string,
): Promise<AccountBooking[]> {
  if (!isDbEnabled()) return [];
  const rows = await db.$queryRawUnsafe<BookingRow[]>(
    `SELECT "id", "type", "status", "program_title", "program_slug", "room_type",
            "batch_date", "duration", "payment_mode", "full_amount_cents",
            "total_pay_now_cents", "pay_now_cents", "remaining_cents", "created_at"
       FROM "bookings"
      WHERE LOWER(TRIM("email")) = ? AND "deleted_at" IS NULL
      ORDER BY "created_at" DESC
      LIMIT 50`,
    email.trim().toLowerCase(),
  );
  return rows.map((row) => {
    const confirmed = row.status === "confirmed";
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      programTitle: row.program_title,
      programSlug: row.program_slug,
      roomType: row.room_type,
      batchDate: row.batch_date,
      duration: row.duration,
      paymentMode: row.payment_mode,
      fullAmountUsd: centsToUsd(Number(row.full_amount_cents)),
      paidUsd: confirmed ? centsToUsd(Number(row.pay_now_cents)) : 0,
      remainingUsd: confirmed
        ? centsToUsd(Number(row.remaining_cents))
        : centsToUsd(Number(row.full_amount_cents)),
      createdAt: new Date(row.created_at).toISOString(),
    };
  });
}
