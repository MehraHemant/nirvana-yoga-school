import type { PageModulesDocument } from "@/content/types";
import {
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { resolvePageModulesForEditor } from "@/lib/cms/db-page-modules";
import { upsertPageModules } from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load page modules for editing.
 * Missing or empty `page_modules` JSON returns an editable scaffold.
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
    select: {
      id: true,
      slug: true,
      type: true,
      title: true,
      published: true,
      pageModules: true,
    },
  });

  if (!page) {
    return jsonNotFound();
  }

  const modules = resolvePageModulesForEditor(page.pageModules, page.title);

  return jsonOk({
    modules,
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Upsert page modules from admin editor.
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
  const body = (await request.json()) as PageModulesDocument;

  const page = await upsertPageModules(slug, body);
  return jsonMutationOk(page.id);
}
