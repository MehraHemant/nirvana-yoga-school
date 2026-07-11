import { getSitePage } from "@/content/repositories/site-page";
import { jsonCached } from "@/lib/cms/api-response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public read API for site/retreat/venue pages.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const result = await getSitePage(slug);

  if (!result.data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return jsonCached({ data: result.data, source: result.source });
}
