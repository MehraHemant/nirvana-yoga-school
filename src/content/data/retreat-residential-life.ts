import type { ResidentialLifeContent } from "@/content/types/shared-sections";
import {
  RETREAT_FOOD_GALLERY,
  RETREAT_MEAL_HIGHLIGHTS,
  RETREAT_ROOM_GALLERIES,
} from "@/data/retreatAccommodation";

const RETREAT_FACILITIES = [
  "Purified Drinking Water",
  "Hot Water",
  "Attached bathroom",
  "Garden",
  "Environment friendly",
  "Yoga hall",
  "Free Wi-Fi",
  "Dining area",
  "Terrace",
  "Paid laundry service",
  "Shower",
] as const;

/**
 * Default lodging & food for yoga retreats (course-compatible shape).
 * Uses retreat venue room galleries — not the YTT 4-shared residential set.
 */
export function createRetreatResidentialLife(): ResidentialLifeContent {
  return {
    live: true,
    accommodation: {
      live: true,
      stay: {
        title: "Ashram lodging",
        description:
          "Comfortable private and twin-sharing balcony rooms with Himalayan views and shared ashram amenities.",
      },
      galleries: RETREAT_ROOM_GALLERIES.map((gallery) => ({
        id: gallery.id,
        label: gallery.label,
        description: gallery.description,
        images: gallery.images.map((image) => ({ ...image })),
      })),
    },
    food: {
      live: true,
      content: {
        title: "Sattvic meals",
        description:
          "Nourishing vegetarian meals prepared fresh each day — breakfast, lunch, and dinner included.",
        points: [...RETREAT_MEAL_HIGHLIGHTS],
        dietaryNote: "Gluten-free and special dietary needs available on request.",
      },
      gallery: RETREAT_FOOD_GALLERY.map((image) => ({ ...image })),
    },
    facilities: RETREAT_FACILITIES.map((label) => ({
      label,
      iconKey: "leaf",
    })),
  };
}

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
