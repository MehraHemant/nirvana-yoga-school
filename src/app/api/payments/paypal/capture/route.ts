import { confirmBooking, getBookingById } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

/**
 * Capture an approved PayPal order and confirm the booking.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  if (!isPayPalConfigured()) {
    return Response.json(
      { error: "PayPal is not configured" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    orderId?: string;
    bookingId?: string;
  };

  if (!body.orderId || !body.bookingId) {
    return Response.json(
      { error: "orderId and bookingId are required" },
      { status: 400 },
    );
  }

  const booking = await getBookingById(body.bookingId);
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  try {
    const capture = await capturePayPalOrder(body.orderId);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? capture.id;

    await confirmBooking(booking.id, captureId);

    return Response.json({ ok: true, status: capture.status, captureId });
  } catch {
    return Response.json({ error: "Payment capture failed" }, { status: 500 });
  }
}
