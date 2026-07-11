import type { PaymentMode } from "@/content/types/booking";

/** PayPal processing fee — matches live site (6%). */
export const PAYPAL_FEE_RATE = 0.06;

/** Advance deposit rate — matches live site (20%). */
export const DEPOSIT_RATE = 0.2;

/**
 * Parse a USD price string like "649 USD" or "$1449 USD" into dollars.
 *
 * @param value - Price label from course or retreat data
 */
export function parseUsdAmount(value: string): number {
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : 0;
}

/**
 * Format USD for display.
 *
 * @param amount - Dollar amount
 */
export function formatUsd(amount: number): string {
  return `${Math.round(amount)} USD`;
}

/**
 * Calculate booking payment breakdown with optional 20% deposit and PayPal fee.
 *
 * @param basePriceUsd - Program + room total in USD
 * @param paymentMode - Full payment or 20% deposit
 */
export function calculateBookingPricing(
  basePriceUsd: number,
  paymentMode: PaymentMode,
): {
  fullAmountUsd: number;
  payNowUsd: number;
  paypalFeeUsd: number;
  totalPayNowUsd: number;
  remainingUsd: number;
} {
  const fullAmountUsd = Math.round(basePriceUsd);
  const payNowUsd =
    paymentMode === "deposit_20"
      ? Math.round(fullAmountUsd * DEPOSIT_RATE)
      : fullAmountUsd;
  const paypalFeeUsd = Math.round(payNowUsd * PAYPAL_FEE_RATE);
  const totalPayNowUsd = payNowUsd + paypalFeeUsd;
  const remainingUsd =
    paymentMode === "deposit_20" ? fullAmountUsd - payNowUsd : 0;

  return {
    fullAmountUsd,
    payNowUsd,
    paypalFeeUsd,
    totalPayNowUsd,
    remainingUsd,
  };
}

/**
 * Convert dollars to integer cents for database storage.
 *
 * @param usd - Dollar amount
 */
export function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

/**
 * Convert stored cents back to dollars.
 *
 * @param cents - Integer cents
 */
export function centsToUsd(cents: number): number {
  return cents / 100;
}
