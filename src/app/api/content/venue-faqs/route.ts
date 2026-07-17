import { getVenueFaqs } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: shared FAQs for course/retreat venue pages.
 */
export async function GET() {
  try {
    const result = await getVenueFaqs();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Venue FAQs are not available.");
    }
    return jsonInternal();
  }
}
