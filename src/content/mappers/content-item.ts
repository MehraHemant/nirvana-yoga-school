/**
 * Pure serializers from resolved content items to legacy document shapes.
 * No database imports — safe for the REST-only read path.
 */

import type { SitePageCmsContent, SitePageDocument } from "@/content/types";
import type { ResolvedContentItem } from "@/content/types/content-item";

/** Reads a string field from resolved data. */
function str(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

/**
 * Serializes a resolved page item into the existing `SitePageDocument` shape so
 * the public renderer (`CmsPageContent`) works unchanged. Each linked section
 * item (via reference fields) becomes a CMS block.
 *
 * @param item - Resolved page item (references expanded)
 */
export function resolvedItemToSiteDocument(
  item: ResolvedContentItem,
): SitePageDocument {
  const data = item.data;
  const blocks: SitePageCmsContent["blocks"] = [];

  for (const field of item.fields) {
    if (field.type !== "reference") continue;
    const children = Array.isArray(data[field.key])
      ? (data[field.key] as ResolvedContentItem[])
      : [];
    for (const child of children) {
      blocks.push({
        typeKey: child.type,
        typeName: child.typeName,
        fields: child.fields,
        data: child.data,
      });
    }
  }

  return {
    slug: item.slug ?? "",
    eyebrow: str(data, "eyebrow"),
    title: str(data, "title") || item.name,
    description: str(data, "description"),
    image: str(data, "image"),
    sections: [],
    ctaLabel: str(data, "cta_label") || undefined,
    ctaHref: str(data, "cta_href") || undefined,
    cms: blocks.length > 0 ? { blocks } : undefined,
  };
}
