import {
  jsonMutationOk,
  jsonNotFound,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { restoreBooking, softDeleteBooking } from "@/lib/cms/bookings";
import { isDbEnabled } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Soft-delete or restore a booking from the admin portal.
 */
export async function PATCH(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  const { id } = await context.params;
  const body = (await request.json()) as { restore?: boolean };

  try {
    if (body.restore) {
      await restoreBooking(id);
    } else {
      await softDeleteBooking(id);
    }
    return jsonMutationOk();
  } catch {
    return jsonNotFound("Booking not found");
  }
}

/**
 * Soft-delete a booking.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  const { id } = await context.params;

  try {
    await softDeleteBooking(id);
    return jsonMutationOk();
  } catch {
    return jsonNotFound("Booking not found");
  }
}
