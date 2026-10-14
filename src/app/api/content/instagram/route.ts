import { getInstagramFeed } from "@/content/repositories/shared-sections";
import { jsonOk } from "@/lib/cms/api-response";

/**
 * Public Instagram feed shared section.
 */
export async function GET() {
  const result = await getInstagramFeed();
  return jsonOk({ data: result.data });
}
