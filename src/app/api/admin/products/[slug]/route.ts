import { getPageRoomOffers } from "@/content/repositories/lodging";
import {
  hydrateModulesFromLodgingTables,
  offersToRetreatPackages,
  syncLodgingTablesFromModules,
} from "@/content/repositories/lodging-sync";
import type {
  OnlineCourseDocument,
  PageModulesDocument,
  RetreatDocument,
} from "@/content/types";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { mapPageModulesFromRow } from "@/lib/cms/db-page-modules";
import {
  upsertPageModules,
  upsertProductDocument,
} from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

type ProductSaveBody = {
  kind: "online" | "retreat";
  course?: OnlineCourseDocument;
  retreat?: RetreatDocument;
  modules: PageModulesDocument;
};

/**
 * Load online/retreat product document + page modules for dedicated editors.
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const { slug } = await context.params;
  const page = await db.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });

  if (!page?.courseDoc?.document) {
    return jsonNotFound();
  }

  const modules =
    (await hydrateModulesFromLodgingTables(
      slug,
      mapPageModulesFromRow(page),
    ).catch(() => mapPageModulesFromRow(page))) ?? mapPageModulesFromRow(page);

  let document = page.courseDoc.document;
  if (page.type === "retreat") {
    const offers = await getPageRoomOffers(page.id, false).catch(() => ({
      data: [],
    }));
    const packages = offersToRetreatPackages(offers.data ?? [], false);
    if (packages.length > 0) {
      document = {
        ...(document as RetreatDocument),
        packages,
      };
    }
  }

  return jsonOk({
    document,
    modules,
    meta: { id: page.id, type: page.type, published: page.published },
  });
}

/**
 * Save online/retreat product document + hero/nav modules.
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ slug: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const { slug } = await context.params;
  const body = (await request.json()) as ProductSaveBody;

  if (body.kind === "online") {
    if (!body.course || body.course.slug !== slug) {
      return jsonBadRequest("Online course slug mismatch");
    }
    const page = await upsertProductDocument(slug, "online", body.course);
    await upsertPageModules(slug, body.modules);
    await syncLodgingTablesFromModules(page.id, body.modules).catch((error) => {
      console.error("[products PUT] lodging sync failed", error);
    });
    return jsonMutationOk();
  }

  if (body.kind === "retreat") {
    if (!body.retreat || body.retreat.slug !== slug) {
      return jsonBadRequest("Retreat slug mismatch");
    }
    const page = await upsertProductDocument(slug, "retreat", body.retreat, {
      title: body.retreat.title,
      image: body.retreat.heroImage,
      description: body.retreat.description,
    });
    await upsertPageModules(slug, body.modules);
    await syncLodgingTablesFromModules(
      page.id,
      body.modules,
      body.retreat,
    ).catch((error) => {
      console.error("[products PUT] lodging sync failed", error);
    });
    return jsonMutationOk();
  }

  return jsonBadRequest("Unknown product kind");
}
