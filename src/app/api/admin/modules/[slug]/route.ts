import { revalidatePath } from "next/cache";
import { dropOrphanPricingOptions } from "@/content/mappers/page-room-fees";
import {
  hydrateModulesFromPageTables,
  syncPageTablesFromModules,
} from "@/content/repositories/page-modules-sync";
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
import {
  getHeroLayoutConfig,
  resolvePageLayoutId,
} from "@/lib/cms/page-layout-registry";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load page modules for editing.
 * Missing or empty `page_modules` JSON returns an editable scaffold.
 * Hydrates offers/dates from relational tables when present.
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

  const base = resolvePageModulesForEditor(page.pageModules, page.title);
  const modules =
    (await hydrateModulesFromPageTables(slug, base).catch(() => base)) ?? base;

  return jsonOk({
    modules,
    meta: {
      id: page.id,
      type: page.type,
      published: page.published,
      layoutId: resolvePageLayoutId(page.type, slug),
      heroLayout: getHeroLayoutConfig(resolvePageLayoutId(page.type, slug)),
    },
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

  // Drop legacy pricing rows without roomId; keep not-Live linked fees so
  // toggling Live back on restores the price after reload.
  if (body.residentialLife) {
    body.pricing = {
      ...body.pricing,
      options: dropOrphanPricingOptions(body.pricing?.options ?? []),
      batches: body.pricing?.batches ?? [],
    };
  }

  const page = await upsertPageModules(slug, body);
  await syncPageTablesFromModules(page.id, body).catch((error) => {
    console.error("[modules PUT] page tables sync failed", error);
  });
  revalidatePath("/course", "layout");
  revalidatePath("/online-course", "layout");
  revalidatePath("/retreat", "layout");
  return jsonMutationOk(page.id);
}
