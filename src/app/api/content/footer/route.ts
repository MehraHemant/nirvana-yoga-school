import { getGlobalFooter } from "@/content/repositories/global-settings";
import { jsonCached } from "@/lib/cms/api-response";

/**
 * Public API: get global footer configuration.
 */
export async function GET() {
  const result = await getGlobalFooter();
  return jsonCached({ data: result.data, source: result.source });
}
