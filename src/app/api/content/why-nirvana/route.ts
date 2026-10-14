import { getWhyNirvana } from "@/content/repositories/shared-sections";
import {
  jsonCached,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbConnectionError } from "@/lib/db";

/**
 * Public API: Why Nirvana highlights and closing copy.
 */
export async function GET() {
  try {
    const result = await getWhyNirvana();
    return jsonCached({ data: result.data, source: result.source });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return jsonUnavailable("Why Nirvana content is not available.");
    }
    return jsonInternal();
  }
}
