import { getSiteConfig } from "@/content/repositories/global-settings";
import { jsonCached } from "@/lib/cms/api-response";

/**
 * Public API: get site configuration.
 */
export async function GET() {
  const result = await getSiteConfig();
  return jsonCached({ data: result.data, source: result.source });
}
