import {
  getStaticRetreat,
  getStaticRetreatSlugs,
} from "@/content/data/retreats";
import type { ContentResult } from "@/content/repositories/fetch";
import { fromJson, type RepositoryOptions } from "@/content/repositories/fetch";
import type { RetreatDocument } from "@/content/types/retreat-page";

export async function getRetreat(
  slug: string,
  _options?: RepositoryOptions,
): Promise<ContentResult<RetreatDocument | null>> {
  return fromJson(getStaticRetreat(slug));
}

export async function getRetreatSlugs(): Promise<string[]> {
  return getStaticRetreatSlugs();
}
