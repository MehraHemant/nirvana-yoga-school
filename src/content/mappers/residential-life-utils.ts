import type { ResidentialLifeContent } from "@/content/types/shared-sections";

/**
 * Whether a residential-life document has usable lodging or food content.
 *
 * @param content - Residential life document
 */
export function hasResidentialLifeContent(
  content: ResidentialLifeContent | null | undefined,
): boolean {
  if (!content) return false;
  const galleries = content.accommodation?.galleries?.length ?? 0;
  const foodGallery = content.food?.gallery?.length ?? 0;
  const foodPoints = content.food?.content?.points?.length ?? 0;
  const foodTitle = content.food?.content?.title?.trim() ?? "";
  return galleries > 0 || foodGallery > 0 || foodPoints > 0 || Boolean(foodTitle);
}
