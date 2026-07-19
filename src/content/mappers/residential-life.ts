import type {
  ResidentialLifeContent,
  RetreatAccommodationContent,
} from "@/content/types/shared-sections";

/**
 * Normalizes retreat lodging docs so nested live flags always exist.
 *
 * @param raw - Stored retreat accommodation JSON
 */
export function normalizeRetreatAccommodation(
  raw: RetreatAccommodationContent,
): RetreatAccommodationContent {
  const lodgingLive =
    raw.accommodation?.live !== false && raw.lodgingLive !== false;
  const foodLive = raw.food?.live !== false && raw.foodLive !== false;
  return {
    ...raw,
    live: raw.live !== false,
    accommodation: { live: lodgingLive },
    food: { live: foodLive },
    roomGalleries: raw.roomGalleries ?? [],
    foodGallery: raw.foodGallery ?? [],
    mealHighlights: raw.mealHighlights ?? [],
    defaultFacilities: raw.defaultFacilities ?? [],
  };
}

/**
 * Maps legacy retreat lodging into the course `residentialLife` shape so
 * retreats can reuse Accommodation / Food components and admin fields.
 *
 * @param raw - Stored retreat accommodation JSON
 */
export function retreatAccommodationToResidentialLife(
  raw: RetreatAccommodationContent,
): ResidentialLifeContent {
  const lodging = normalizeRetreatAccommodation(raw);
  return {
    live: lodging.live !== false,
    accommodation: {
      live: lodging.accommodation?.live !== false,
      stay: {
        title: "Ashram lodging",
        description:
          "Comfortable private and twin-sharing balcony rooms with Himalayan views and shared ashram amenities.",
      },
      galleries: lodging.roomGalleries,
    },
    food: {
      live: lodging.food?.live !== false,
      content: {
        title: "Sattvic meals",
        description:
          "Nourishing vegetarian meals prepared fresh each day — breakfast, lunch, and dinner included.",
        points: lodging.mealHighlights,
        dietaryNote:
          "Gluten-free and special dietary needs available on request.",
      },
      gallery: lodging.foodGallery,
    },
    facilities: lodging.defaultFacilities.map((label) => {
      const base = label.split(" — ")[0]?.trim() ?? label;
      const note = label.includes(" — ")
        ? label.split(" — ").slice(1).join(" — ").trim()
        : undefined;
      return { label: base, iconKey: "leaf", note };
    }),
  };
}
