import { getRetreatAccommodation } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: retreat room/food galleries and meal highlights.
 */
export async function GET() {
  try {
    const result = await getRetreatAccommodation();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Retreat accommodation content is not available.");
    }
    return jsonInternal();
  }
}
