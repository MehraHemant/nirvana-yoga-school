import type { CourseDocument } from "@/content/types";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { upsertCourseDocument } from "@/lib/cms/document-to-db";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Load a course document for editing.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });

  if (!page?.courseDoc?.document) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    course: page.courseDoc.document as CourseDocument,
    meta: {
      id: page.id,
      type: page.type,
      published: page.published,
    },
  });
}

/**
 * Upsert a course document from the admin editor.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as CourseDocument;
  if (body.slug !== slug) {
    return Response.json({ error: "Slug mismatch" }, { status: 400 });
  }

  const existing = await prisma.page.findUnique({ where: { slug } });
  const pageType =
    existing?.type === "online" || existing?.type === "course"
      ? existing.type
      : "course";

  const page = await upsertCourseDocument(body, pageType);
  return Response.json({ ok: true, id: page.id });
}
