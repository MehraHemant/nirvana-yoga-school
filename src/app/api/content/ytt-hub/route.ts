import { getYttHub } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: Yoga Teacher Training hub page content.
 */
export async function GET() {
  try {
    const result = await getYttHub();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("YTT hub content is not available.");
    }
    return jsonInternal();
  }
}
