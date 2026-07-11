import { getSessionFromRequest } from "@/lib/cms/auth";
import { restoreBooking, softDeleteBooking } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Soft-delete or restore a booking from the admin portal.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbEnabled()) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { restore?: boolean };

  try {
    if (body.restore) {
      await restoreBooking(id);
    } else {
      await softDeleteBooking(id);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
}

/**
 * Soft-delete a booking.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbEnabled()) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    await softDeleteBooking(id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
}
