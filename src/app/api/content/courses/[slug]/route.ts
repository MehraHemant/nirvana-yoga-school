import { getResidentialCourse } from "@/content/repositories/residential-course";
import { jsonCached } from "@/lib/cms/api-response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public read API for residential YTT courses.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const result = await getResidentialCourse(slug);

  if (!result.data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return jsonCached({ data: result.data, source: result.source });
}
