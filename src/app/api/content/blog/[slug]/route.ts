import { getBlogPost } from "@/content/repositories/blog-post";
import { jsonCached, jsonNotFound } from "@/lib/cms/api-response";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Public read API for a single blog post.
 */
export async function GET(
  _request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const { slug } = await context.params;
  const result = await getBlogPost(slug);

  if (!result.data) {
    return jsonNotFound();
  }

  return jsonCached({ data: result.data, source: result.source });
}
