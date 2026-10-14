import type { BlogPostDocument } from "@/content/types";
import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { createBlogPostDraft } from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";

/**
 * List blog posts for the admin dashboard.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const posts = await db.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return jsonOk({ posts });
}

/**
 * Create a blog post from the admin editor with full document fields.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const body = (await request.json()) as BlogPostDocument;
  const title = String(body.title ?? "").trim();
  if (!title) {
    return jsonBadRequest("title is required");
  }

  const post = await createBlogPostDraft({
    title,
    slug: body.slug?.trim() || undefined,
    category: body.category,
    excerpt: body.excerpt,
    image: body.image,
    bodyHtml: body.bodyHtml,
    content: body.content,
    published: body.published,
    publishedAt: body.publishedAt,
  });

  return jsonOk({ post: { id: post.id, slug: post.slug } }, { status: 201 });
}
