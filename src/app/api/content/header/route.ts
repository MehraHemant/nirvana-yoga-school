import { getGlobalHeader } from "@/content/repositories/global-settings";
import { jsonCached } from "@/lib/cms/api-response";

/**
 * Public API: get global header configuration.
 */
export async function GET() {
  const result = await getGlobalHeader();
  return jsonCached({ data: result.data, source: result.source });
}
