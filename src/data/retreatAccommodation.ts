const SITE = "https://www.nirvanayogaschoolindia.com";

export type RetreatGalleryImage = {
  url: string;
  title: string;
};

function venueImages(
  folder: "private" | "2-shared",
  count: number,
  label: string,
): RetreatGalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    url: `${SITE}/img/retreat-venue/${folder}/${index + 1}.webp`,
    title: `${label} ${index + 1}`,
  }));
}

export const RETREAT_ROOM_GALLERIES = [
  {
    id: "private",
    label: "Private AC Balcony Room",
    description:
      "A quiet private room with balcony views — ideal for rest and reflection.",
    images: venueImages("private", 10, "Private Room"),
  },
  {
    id: "2-shared",
    label: "2-Shared AC Balcony Room",
    description:
      "Twin-sharing with balcony access — comfortable, clean, and community-friendly.",
    images: venueImages("2-shared", 12, "2-Shared Room"),
  },
] as const;

export type RetreatRoomGalleryId =
  (typeof RETREAT_ROOM_GALLERIES)[number]["id"];

export const RETREAT_FOOD_GALLERY: RetreatGalleryImage[] = [
  {
    url: `${SITE}/admin/uploads/yoga/img_68219912b94b2.webp`,
    title: "Dining hall",
  },
  {
    url: `${SITE}/admin/uploads/yoga/img_68219912b9b73.webp`,
    title: "Sattvic meal",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning1.webp`,
    title: "Fresh breakfast",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning2.webp`,
    title: "Vegetarian lunch",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning3.webp`,
    title: "Evening dinner",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning4.webp`,
    title: "Nutritious salads",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning5.webp`,
    title: "Seasonal fruits",
  },
  {
    url: `${SITE}/img/gallery/webp/dinning/dinning6.webp`,
    title: "Community dining",
  },
];

export const RETREAT_MEAL_HIGHLIGHTS = [
  "Breakfast, lunch & dinner included",
  "100% sattvic vegetarian cuisine",
  "Gluten-free & dietary needs on request",
] as const;
