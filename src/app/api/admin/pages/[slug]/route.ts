import type { SitePageDocument } from "@/content/types";
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

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Load a full site page for editing.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: pageWithRelations,
  });

  if (!page) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    page: mapPageToSitePageDocument(page),
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Upsert a site page document from admin editor.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as SitePageDocument;
  if (body.slug !== slug) {
    return Response.json({ error: "Slug mismatch" }, { status: 400 });
  }

  const page = await upsertSitePageDocument(body);
  return Response.json({ ok: true, id: page.id });
}

/**
 * Unpublish a page (admin role required).
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    requireAdminRole(session);
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await context.params;
  await unpublishPage(slug);
  return Response.json({ ok: true });
}
