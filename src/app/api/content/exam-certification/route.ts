import { getExamCertification } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: shared exam and certificate content.
 */
export async function GET() {
  try {
    const result = await getExamCertification();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable(
        "Exam and certification content is not available.",
      );
    }
    return jsonInternal();
  }
}
