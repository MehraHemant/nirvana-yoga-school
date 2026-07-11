import { attachPaypalOrder, getBookingById } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

/**
 * Create a PayPal order for an existing pending booking.
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

  const body = (await request.json()) as { bookingId?: string };
  if (!body.bookingId) {
    return Response.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await getBookingById(body.bookingId);
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "pending_payment") {
    return Response.json({ error: "Booking is not payable" }, { status: 409 });
  }

  try {
    const order = await createPayPalOrder({
      bookingId: booking.id,
      totalPayNowCents: Math.round(booking.totalPayNowUsd * 100),
      description: `${booking.programTitle} — ${booking.roomType}`,
    });

    await attachPaypalOrder(booking.id, order.id);

    return Response.json({ orderId: order.id });
  } catch {
    return Response.json(
      { error: "Failed to create PayPal order" },
      { status: 500 },
    );
  }
}
