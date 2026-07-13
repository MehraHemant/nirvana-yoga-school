import { getOnlineCourse } from "@/content/repositories/online-course";
import { jsonCached, jsonNotFound } from "@/lib/cms/api-response";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Public read API for online courses.
 */
export async function GET(
  _request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const { slug } = await context.params;
  const result = await getOnlineCourse(slug);

  if (!result.data) {
    return jsonNotFound();
  }

  return jsonCached({ data: result.data, source: result.source });
}
