import { getBlogPosts } from "@/content/repositories/blog-post";
import { jsonCached } from "@/lib/cms/api-response";

/**
 * Public read API listing all blog posts.
 */
export async function GET() {
  const result = await getBlogPosts();
  return jsonCached({ data: result.data, source: result.source });
}
