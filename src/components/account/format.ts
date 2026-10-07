/** Card surface shared by profile sections. */
export const ACCOUNT_CARD_CLASS =
  "rounded-[1.5rem] border border-ink/[0.06] bg-white p-5 shadow-[0_1px_2px_rgb(26_20_16/0.04),0_24px_60px_-40px_rgb(163_36_50/0.35)] sm:p-7";

/**
 * Date in the school's time zone, e.g. "5 Oct 2026".
 *
 * @param iso - ISO instant
 */
export function formatAccountDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * US dollars without trailing cents when whole.
 *
 * @param amount - Dollar amount
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
