import { createBooking, parseCreateBookingInput } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";

/**
 * Create a pending booking before PayPal checkout.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return Response.json(
      { error: "Booking storage unavailable" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseCreateBookingInput(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const booking = await createBooking(parsed.data);
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return Response.json({ error: message }, { status: 400 });
  }
}
