import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { listBookings } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";

/**
 * Admin list of course and retreat bookings.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonOk({ bookings: [], dbEnabled: false });
  }

  const deleted = new URL(request.url).searchParams.get("deleted") === "true";
  const bookings = await listBookings(deleted);
  return jsonOk({ bookings, dbEnabled: true });
}
