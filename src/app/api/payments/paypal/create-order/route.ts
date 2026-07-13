import {
  jsonBadRequest,
  jsonConflict,
  jsonInternal,
  jsonNotFound,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { attachPaypalOrder, getBookingById } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

/**
 * Create a PayPal order for an existing pending booking.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  if (!isPayPalConfigured()) {
    return jsonUnavailable("PayPal is not configured");
  }

  const body = (await request.json()) as { bookingId?: string };
  if (!body.bookingId) {
    return jsonBadRequest("bookingId is required");
  }

  const booking = await getBookingById(body.bookingId);
  if (!booking) {
    return jsonNotFound("Booking not found");
  }

  if (booking.status !== "pending_payment") {
    return jsonConflict("Booking is not payable");
  }

  try {
    const order = await createPayPalOrder({
      bookingId: booking.id,
      totalPayNowCents: Math.round(booking.totalPayNowUsd * 100),
      description: `${booking.programTitle} — ${booking.roomType}`,
    });

    await attachPaypalOrder(booking.id, order.id);

    return jsonOk({ orderId: order.id });
  } catch {
    return jsonInternal("Failed to create PayPal order");
  }
}
