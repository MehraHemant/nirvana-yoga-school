import {
  jsonBadRequest,
  jsonInternal,
  jsonNotFound,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { confirmBooking, getBookingById } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

/**
 * Capture an approved PayPal order and confirm the booking.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  if (!isPayPalConfigured()) {
    return jsonUnavailable("PayPal is not configured");
  }

  const body = (await request.json()) as {
    orderId?: string;
    bookingId?: string;
  };

  if (!body.orderId || !body.bookingId) {
    return jsonBadRequest("orderId and bookingId are required");
  }

  const booking = await getBookingById(body.bookingId);
  if (!booking) {
    return jsonNotFound("Booking not found");
  }

  try {
    const capture = await capturePayPalOrder(body.orderId);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? capture.id;

    await confirmBooking(booking.id, captureId);

    return jsonOk({ ok: true, status: capture.status, captureId });
  } catch {
    return jsonInternal("Payment capture failed");
  }
}
