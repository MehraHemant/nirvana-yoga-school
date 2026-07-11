import { getSessionFromRequest } from "@/lib/cms/auth";
import { prisma } from "@/lib/db";

/**
 * List blog posts for the admin dashboard.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
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

  return Response.json({ posts });
}
