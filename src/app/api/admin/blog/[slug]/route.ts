import type { BlogPostDocument } from "@/content/types";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { deleteBlogPost, upsertBlogPost } from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load a blog post for editing.
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { slug } = await context.params;
  const post = await db.blogPost.findUnique({ where: { slug } });

  if (!post) {
    return jsonNotFound();
  }

  const document: BlogPostDocument = {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    image: post.image,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    content: post.content as BlogPostDocument["content"],
    bodyHtml: post.bodyHtml,
  };

  return jsonOk({
    post: document,
    meta: { id: post.id, published: post.published },
  });
}

/**
 * Upsert a blog post from the admin editor.
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { slug } = await context.params;
  const body = (await request.json()) as BlogPostDocument;
  if (body.slug !== slug) {
    return jsonBadRequest("Slug mismatch");
  }

  const post = await upsertBlogPost(body);
  return jsonMutationOk(post.id);
}

/**
 * Hard-delete a blog post from the database.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { slug } = await context.params;
  const deleted = await deleteBlogPost(slug);
  if (!deleted) {
    return jsonNotFound();
  }

  return jsonMutationOk();
}
