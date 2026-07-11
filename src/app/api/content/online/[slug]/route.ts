import { getOnlineCourse } from "@/content/repositories/online-course";
import { jsonCached } from "@/lib/cms/api-response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public read API for online courses.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const result = await getOnlineCourse(slug);

  if (!result.data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return jsonCached({ data: result.data, source: result.source });
}
