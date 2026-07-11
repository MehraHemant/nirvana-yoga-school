import type { Prisma } from "@prisma/client";
import type { PageModulesDocument } from "@/content/types";
import { prisma } from "@/lib/db";

/**
 * Load page modules JSON from Postgres.
 *
 * @param slug - Page slug
 */
export async function fetchPageModulesRow(
  slug: string,
): Promise<PageModulesDocument | null> {
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { pageModules: true },
  });

  if (!page?.pageModules) return null;
  return page.pageModules as PageModulesDocument;
}

/**
 * Map a Prisma page row to page modules when present.
 *
 * @param page - Page with optional pageModules
 */
export function mapPageModulesFromRow(page: {
  pageModules: Prisma.JsonValue | null;
}): PageModulesDocument | null {
  if (!page.pageModules) return null;
  return page.pageModules as PageModulesDocument;
}
