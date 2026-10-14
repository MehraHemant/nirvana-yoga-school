import type { CourseDocument } from "@/content/types";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { upsertCourseDocument } from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load a course document for editing.
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
  const page = await db.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });

  if (!page?.courseDoc?.document) {
    return jsonNotFound();
  }

  return jsonOk({
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
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { slug } = await context.params;
  const body = (await request.json()) as CourseDocument;
  if (body.slug !== slug) {
    return jsonBadRequest("Slug mismatch");
  }

  const existing = await db.page.findUnique({ where: { slug } });
  const pageType =
    existing?.type === "online" || existing?.type === "course"
      ? existing.type
      : "course";

  const page = await upsertCourseDocument(body, pageType);
  return jsonMutationOk(page.id);
}
