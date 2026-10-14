import { getResidentialLife } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: accommodation, food, and campus facilities content.
 */
export async function GET() {
  try {
    const result = await getResidentialLife();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Residential life content is not available.");
    }
    return jsonInternal();
  }
}
