import type { ResidentialLifeContent } from "@/content/types/shared-sections";

/**
 * Empty per-page lodging & food scaffold for admin editors.
 * Used when a page has no `residentialLife` module yet.
 */
export function createEmptyResidentialLife(): ResidentialLifeContent {
  return {
    live: true,
    accommodation: {
      live: true,
      stay: { title: "", description: "" },
      galleries: [],
    },
    food: {
      live: true,
      content: {
        title: "",
        description: "",
        points: [],
        dietaryNote: "",
      },
      gallery: [],
    },
    facilities: [],
  };
}
