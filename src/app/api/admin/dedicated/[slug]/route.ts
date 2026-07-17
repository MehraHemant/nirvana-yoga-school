import type { DedicatedPageContent } from "@/content/types/dedicated-pages";
import {
  isDedicatedPageSlug,
  loadDedicatedPageContent,
  saveDedicatedPageContent,
} from "@/lib/cms/dedicated-pages";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load dedicated page content_data for Home / Contact / Enquire editors.
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const { slug } = await context.params;
  if (!isDedicatedPageSlug(slug)) {
    return jsonNotFound();
  }

  const content = await loadDedicatedPageContent(slug);
  return jsonOk({ content, meta: { slug, type: "site" } });
}

/**
 * Save dedicated page content_data from admin editors.
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const { slug } = await context.params;
  if (!isDedicatedPageSlug(slug)) {
    return jsonBadRequest("Not a dedicated page slug");
  }

  const body = (await request.json()) as DedicatedPageContent;
  if (!body || typeof body !== "object" || !("kind" in body)) {
    return jsonBadRequest("Invalid dedicated page document");
  }

  const expectedKind =
    slug === "home" ? "home" : slug === "contact" ? "contact" : "enquire";
  if (body.kind !== expectedKind) {
    return jsonBadRequest(`Expected kind "${expectedKind}" for slug ${slug}`);
  }

  const id = await saveDedicatedPageContent(slug, body);
  return jsonMutationOk(id);
}
