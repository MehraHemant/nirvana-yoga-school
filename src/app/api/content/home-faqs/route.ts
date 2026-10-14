import { getHomeFaqs } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: homepage FAQ cards.
 */
export async function GET() {
  try {
    const result = await getHomeFaqs();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Home FAQs are not available.");
    }
    return jsonInternal();
  }
}
