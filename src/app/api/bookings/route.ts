import {
  jsonBadRequest,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { createBooking, parseCreateBookingInput } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import { HTTP } from "@/lib/types/api";

/**
 * Create a pending booking before PayPal checkout.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Booking storage unavailable");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonBadRequest("Invalid JSON");
  }

  const parsed = parseCreateBookingInput(body);
  if (!parsed.ok) {
    return jsonBadRequest(parsed.error);
  }

  try {
    const booking = await createBooking(parsed.data);
    return jsonOk({ booking }, { status: HTTP.CREATED });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return jsonBadRequest(message);
  }
}
