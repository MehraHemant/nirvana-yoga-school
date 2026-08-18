import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";

const SITE = "https://www.nirvanayogaschoolindia.com";

/**
 * Builds numbered gallery images for a venue folder.
 *
 * @param folder - Path under /img/
 * @param count - Number of images
 * @param category - Gallery category id
 * @param ext - File extension
 */
function folderImages(
  folder: string,
  count: number,
  category: string,
  ext: "webp" | "jpg" = "webp",
): SitePageGalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    url: `${SITE}/img/${folder}/${index + 1}.${ext}`,
    category,
  }));
}

/**
 * Default retreat venue gallery (hall, private, 2-shared, premises).
 */
export function createRetreatVenueGallery(): GalleryModule {
  const images: SitePageGalleryImage[] = [
    ...folderImages("retreat-venue/hall", 3, "yogahall"),
    ...folderImages("retreat-venue/private", 10, "private"),
    ...folderImages("retreat-venue/2-shared", 12, "2 shared"),
    ...folderImages("retreat-venue/hall", 3, "premisis").map(
      (image, index) => ({
        ...image,
        url: `${SITE}/img/retreat-venue/private/${Math.min(index + 8, 10)}.webp`,
        category: "premisis",
      }),
    ),
  ];

  return {
    live: true,
    eyebrow: "Retreat campus",
    title: "Retreat Venue",
    description:
      "Private and twin balcony rooms, yoga halls, and quiet Himalayan grounds — a soul-soothing escape by Nirvana Yoga School.",
    images,
    sectionOrder: [
      {
        id: "yogahall",
        label: "Yoga Hall",
        description:
          "Light-filled practice spaces for asana, meditation, and sound.",
      },
      {
        id: "private",
        label: "Private Room With Balcony",
        description:
          "Quiet private rooms with balcony views for rest and reflection.",
      },
      {
        id: "2 shared",
        label: "2-Shared Room With Balcony",
        description:
          "Twin-sharing rooms with balcony access — comfortable and community-friendly.",
      },
      {
        id: "premisis",
        label: "Premises",
        description: "Gardens, terraces, and the calm retreat campus.",
      },
    ],
    videos: [],
  };
}

/**
 * Wraps an existing flat course-venue image list with presentation metadata.
 *
 * @param images - Existing categorized gallery images
 */
export function createCourseVenueGallery(
  images: SitePageGalleryImage[],
): GalleryModule {
  const orderIds = [
    "yogahall",
    "dinning",
    "private",
    "2 shared",
    "3 shared",
    "4 shared",
    "premisis",
  ];
  const present = new Set(images.map((image) => image.category));
  return {
    live: true,
    eyebrow: "Course campus",
    title: "Course Venue",
    description:
      "Yoga halls, sattvic dining, private and shared rooms, dorms, and the peaceful school grounds in Upper Tapovan.",
    images,
    sectionOrder: orderIds
      .filter((id) => present.has(id))
      .map((id) => ({
        id,
        label:
          (
            {
              yogahall: "Yoga Hall",
              dinning: "Dining",
              private: "Private Room With Balcony",
              "2 shared": "2-Shared Room With Balcony",
              "3 shared": "3-Shared Room With Balcony",
              "4 shared": "4-Shared Dorm with Balcony",
              premisis: "Premises",
            } as Record<string, string>
          )[id] ?? id,
      })),
    videos: [],
  };
}
