import type { BlogPostDocument } from "@/content/types";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { upsertBlogPost } from "@/lib/cms/document-to-db";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Load a blog post for editing.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post) {
    return Response.json({ error: "Not found" }, { status: 404 });
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

  return Response.json({
    post: document,
    meta: { id: post.id, published: post.published },
  });
}

/**
 * Upsert a blog post from the admin editor.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as BlogPostDocument;
  if (body.slug !== slug) {
    return Response.json({ error: "Slug mismatch" }, { status: 400 });
  }

  const post = await upsertBlogPost(body);
  return Response.json({ ok: true, id: post.id });
}
