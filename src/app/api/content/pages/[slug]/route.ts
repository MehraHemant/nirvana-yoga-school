import { getSitePage } from "@/content/repositories/site-page";
import { jsonCached, jsonNotFound } from "@/lib/cms/api-response";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Public read API for site/retreat/venue pages.
 */
export async function GET(
  _request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const { slug } = await context.params;
  const result = await getSitePage(slug);

  if (!result.data) {
    return jsonNotFound();
  }

  return jsonCached({ data: result.data, source: result.source });
}
