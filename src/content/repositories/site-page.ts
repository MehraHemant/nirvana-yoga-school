import {
  getStaticSitePage,
  getStaticSitePageSlugs,
} from "@/content/data/site-pages";
import { fromJson, type RepositoryOptions } from "@/content/repositories/fetch";
import type { ContentResult } from "@/content/repositories/fetch";
import type { SitePageDocument } from "@/content/types";

export async function getSitePage(
  slug: string,
  _options?: RepositoryOptions,
): Promise<ContentResult<SitePageDocument | null>> {
  const page = getStaticSitePage(slug);
  return fromJson(page);
}

export async function getSitePageSlugs(): Promise<string[]> {
  return getStaticSitePageSlugs();
}
