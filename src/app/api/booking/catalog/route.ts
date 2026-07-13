import {
  getCourseBookingCatalog,
  getRetreatBookingCatalog,
} from "@/lib/booking/catalog";
import { jsonOk } from "@/lib/cms/api-response";

/**
 * Public catalog API for the booking form dropdowns.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "retreat") {
    return jsonOk({ programs: getRetreatBookingCatalog() });
  }

  return jsonOk({ programs: getCourseBookingCatalog() });
}
