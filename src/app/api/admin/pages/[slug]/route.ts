import type {
  DedicatedPageContent,
  OnlineCourseDocument,
  PageModulesDocument,
  RetreatDocument,
  SitePageDocument,
} from "@/content/types";
import {
  jsonBadRequest,
  jsonForbidden,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest, requireAdminRole } from "@/lib/cms/auth";
import { resolvePageModulesForEditor } from "@/lib/cms/db-page-modules";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import {
  isDedicatedPageSlug,
  loadDedicatedPageContent,
  saveDedicatedPageContent,
} from "@/lib/cms/dedicated-pages";
import {
  unpublishPage,
  upsertPageModules,
  upsertProductDocument,
  upsertSitePageDocument,
} from "@/lib/cms/document-to-db";
import { ensureTeacherPage } from "@/lib/cms/ensure-teacher-page";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

type AdminPageEditorWrite = {
  modules?: PageModulesDocument;
  content?: DedicatedPageContent;
  product?: {
    kind: "online" | "retreat";
    document: OnlineCourseDocument | RetreatDocument;
  };
};

/**
 * Whether a request body uses the guided page-editor contract.
 *
 * @param value - Parsed JSON request body
 */
function isAdminPageEditorWrite(value: unknown): value is AdminPageEditorWrite {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("modules" in value || "content" in value || "product" in value),
  );
}

/**
 * Load the complete document needed by a guided page editor.
 * The legacy `page` field remains for older editor clients.
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

  if (slug === "teacher") {
    await ensureTeacherPage().catch(() => null);
  }

  const page = await db.page.findUnique({
    where: { slug },
    include: { ...pageWithRelations, courseDoc: true },
  });

  if (!page) {
    return jsonNotFound();
  }

  const content = isDedicatedPageSlug(slug)
    ? await loadDedicatedPageContent(slug)
    : null;
  const product =
    page.courseDoc?.document &&
    (page.type === "online" || page.type === "retreat")
      ? {
          kind: page.type === "online" ? "online" : "retreat",
          document: page.courseDoc.document,
        }
      : null;

  return jsonOk({
    page: mapPageToSitePageDocument(page),
    modules: resolvePageModulesForEditor(page.pageModules, page.title),
    content,
    product,
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Save one guided page editor document. Legacy SitePageDocument writes remain
 * supported for existing editor clients.
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
  const body = (await request.json()) as unknown;

  if (!isAdminPageEditorWrite(body)) {
    const pageDocument = body as SitePageDocument;
    if (pageDocument.slug !== slug) {
      return jsonBadRequest("Slug mismatch");
    }
    const page = await upsertSitePageDocument(pageDocument);
    return jsonMutationOk(page.id);
  }

  const page = await db.page.findUnique({ where: { slug } });
  if (!page) {
    return jsonNotFound();
  }

  if (body.content) {
    if (!isDedicatedPageSlug(slug)) {
      return jsonBadRequest("This page does not use dedicated content");
    }
    await saveDedicatedPageContent(slug, body.content);
  }

  if (body.product) {
    if (body.product.kind !== page.type) {
      return jsonBadRequest("Product type mismatch");
    }
    if (body.product.document.slug !== slug) {
      return jsonBadRequest("Product slug mismatch");
    }
    if (body.product.kind === "retreat") {
      const retreat = body.product.document as RetreatDocument;
      await upsertProductDocument(slug, "retreat", retreat, {
        title: retreat.title,
        image: retreat.heroImage,
        description: retreat.description,
      });
    } else {
      const course = body.product.document as OnlineCourseDocument;
      await upsertProductDocument(slug, "online", course, {
        title: course.title,
        image: course.image,
        description: course.overview,
      });
    }
  }

  if (body.modules) {
    await upsertPageModules(slug, body.modules);
  }

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
