import type { PageModulesDocument } from "@/content/types";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { mapPageModulesFromRow } from "@/lib/cms/db-page-modules";
import { upsertPageModules } from "@/lib/cms/document-to-db";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Load page modules for editing.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const page = await prisma.page.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      type: true,
      published: true,
      pageModules: true,
    },
  });

  if (!page) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const modules = mapPageModulesFromRow(page);
  if (!modules) {
    return Response.json({ error: "No modules configured" }, { status: 404 });
  }

  return Response.json({
    modules,
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Upsert page modules from admin editor.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as PageModulesDocument;

  const page = await upsertPageModules(slug, body);
  return Response.json({ ok: true, id: page.id });
}
