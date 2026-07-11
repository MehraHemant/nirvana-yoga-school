import {
  getCourseBookingCatalog,
  getRetreatBookingCatalog,
} from "@/lib/booking/catalog";

/**
 * Public catalog API for the booking form dropdowns.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "retreat") {
    return Response.json({ programs: getRetreatBookingCatalog() });
  }

  return Response.json({ programs: getCourseBookingCatalog() });
}
