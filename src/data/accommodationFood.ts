const SITE = "https://www.nirvanayogaschoolindia.com";

export type GalleryImage = { url: string; title: string };

export function liveImage(path: string): string {
  return path.startsWith("http") ? path : `${SITE}${path}`;
}

function galleryImages(
  folder: string,
  files: string[],
  altPrefix: string,
): GalleryImage[] {
  return files.map((file, index) => ({
    url: liveImage(`${folder}/${file}`),
    title: `${altPrefix} ${index + 1}`,
  }));
}

export const COMFORTABLE_STAY = {
  title: "Comfortable Stay in the Heart of Rishikesh",
  description:
    "There is something that we want to emphasize, and that is your comfort and peace of mind. Set against the majestic backdrop of the Himalayas, away from the city's noise, an accommodation is in a quiet, tranquil environment where the sounds of nature gently lull you through the day. Here, your downtime is for resting, reflecting, and reinvigorating yourself before or between your training sessions.",
};

export const FOOD_CONTENT = {
  title: "Nourishing Meals for a Yogic Lifestyle",
  description:
    "We believe that which nourishes your being also nourishes your soul. At Nirvana, food is not just sustenance; rather, food itself is a practice, a conscious ritual that goes hand in hand with the physical, mental, and spiritual alterations you will be witnessing throughout your yoga teacher training in India.",
  points: [
    "You will be served clean vegetarian food, which is light and delicious, prepared with love to sustain your energy, sharpness, and calm during the training.",
    "Meals are prepared with the intention to strengthen your practice; all the ingredients are wholesome: whole grains, lentils, vegetables, fresh fruits, and healing spices are common.",
    "We avoid overly processed or heavy foods to maintain a sattvic diet, which is considered pure and calming, that helps promote a clear mind and inner stillness.",
  ],
  dietaryNote:
    "If you have special dietary needs — anywhere from vegan, gluten-free to allergy-aware — please do not hesitate to inform us. We shall make all the arrangements to ensure that your meals cater to your needs either during booking or upon your arrival.",
};

export {
  FACILITIES,
  FACILITY_ITEMS,
  type FacilityItem,
  resolveFacilityItem,
} from "./accommodationFacilities";

export const ACCOMMODATION_GALLERIES = [
  {
    id: "private",
    label: "Private Room",
    description:
      "Private rooms with attached bathroom — ideal for quiet rest and personal reflection.",
    images: galleryImages(
      "/img/gallery/webp/private",
      Array.from({ length: 17 }, (_, i) => `${i + 1}.webp`),
      "Private Room",
    ),
  },
  {
    id: "2-shared",
    label: "2-Shared Room",
    description:
      "Twin-sharing rooms with balcony options — comfortable, clean, and community-oriented.",
    images: galleryImages(
      "/img/gallery/webp/2-shared",
      Array.from({ length: 19 }, (_, i) => `${i + 1}.webp`),
      "2-Shared Room",
    ),
  },
  {
    id: "4-shared",
    label: "4-Shared Room",
    description:
      "Four-sharing dorm-style rooms — budget-friendly with all essential amenities.",
    images: galleryImages(
      "/img/gallery/webp/4-shared",
      Array.from({ length: 18 }, (_, i) => `${i + 1}.webp`),
      "4-Shared Room",
    ),
  },
] as const;

export type AccommodationGalleryId =
  (typeof ACCOMMODATION_GALLERIES)[number]["id"];

export const FOOD_GALLERY: GalleryImage[] = [
  ...galleryImages(
    "/img/gallery/webp/dinning",
    Array.from({ length: 17 }, (_, i) => `dinning${i + 1}.webp`),
    "Sattvic Meal",
  ),
  {
    url: liveImage("/admin/uploads/yoga/img_68219912b94b2.webp"),
    title: "Dining Hall of Nirvana Yoga School",
  },
  {
    url: liveImage("/admin/uploads/yoga/img_68219912b9b73.webp"),
    title: "Food at Nirvana Yoga School",
  },
  {
    url: liveImage("/admin/uploads/yoga/DSC01680.webp"),
    title: "Ashram Kitchen",
  },
  {
    url: liveImage("/admin/uploads/yoga/DSC09794.webp"),
    title: "Fresh Sattvic Preparation",
  },
  {
    url: liveImage("/admin/uploads/yoga/DSC09843.webp"),
    title: "Organic Vegetarian Meals",
  },
  {
    url: liveImage("/admin/uploads/yoga/DSC09937.webp"),
    title: "Community Dining",
  },
];
