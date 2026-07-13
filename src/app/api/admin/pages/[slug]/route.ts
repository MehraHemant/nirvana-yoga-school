import type { SitePageDocument } from "@/content/types";
import {
  jsonBadRequest,
  jsonForbidden,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest, requireAdminRole } from "@/lib/cms/auth";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import {
  unpublishPage,
  upsertSitePageDocument,
} from "@/lib/cms/document-to-db";
import { prisma } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load a full site page for editing.
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
  const page = await prisma.page.findUnique({
    where: { slug },
    include: pageWithRelations,
  });

  if (!page) {
    return jsonNotFound();
  }

  return jsonOk({
    page: mapPageToSitePageDocument(page),
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Upsert a site page document from admin editor.
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
  const body = (await request.json()) as SitePageDocument;
  if (body.slug !== slug) {
    return jsonBadRequest("Slug mismatch");
  }

  const page = await upsertSitePageDocument(body);
  return jsonMutationOk(page.id);
}

/**
 * Unpublish a page (admin role required).
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  try {
    requireAdminRole(session);
  } catch {
    return jsonForbidden();
  }

  const { slug } = await context.params;
  await unpublishPage(slug);
  return jsonMutationOk();
}
