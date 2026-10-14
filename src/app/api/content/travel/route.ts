import { getTravelGuide } from "@/content/repositories/shared-sections";
import { jsonOk } from "@/lib/cms/api-response";

/**
 * Public travel guide shared section.
 */
export async function GET() {
  const result = await getTravelGuide();
  return jsonOk({ data: result.data });
}
