import { getSiteMap } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: shared Google Maps embed used across product pages.
 */
export async function GET() {
  try {
    const result = await getSiteMap();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Site map content is not available.");
    }
    return jsonInternal();
  }
}
