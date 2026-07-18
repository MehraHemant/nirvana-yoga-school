import type { TravelGuideContent } from "@/content/types/shared-sections";
import { liveImage } from "@/lib/live-site";

/** 16:9 crop for consistent hero framing */
function unsplash(id: string, altCrop = "crop"): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=${altCrop}&w=1600&h=900&q=85`;
}

/**
 * Default travel-guide document for `global_settings.travel` (no React icons).
 */
export const DEFAULT_TRAVEL_GUIDE: TravelGuideContent = {
  live: true,
  intro:
    "Travelling to a new country can feel daunting. This practical guide covers visas, flights, packing, and local tips to make your journey to Rishikesh as smooth as possible.",
  quickFacts: [
    { label: "Nearest airport", value: "Dehradun (DED)" },
    { label: "Drive to school", value: "~45 minutes" },
    { label: "Airport pickup", value: "Complimentary" },
    { label: "Neighborhood", value: "Upper Tapovan" },
  ],
  topics: [
    {
      id: "visa",
      title: "Visa Requirements",
      tag: "Before you fly",
      content:
        "A tourist or e-Visa is required for yoga courses in India, valid for 30–180 days depending on nationality. Apply online at least 15–30 days before departure for smooth processing.",
      image: unsplash("photo-1436491865332-7a61a109cc05"),
      imageAlt: "Passport and boarding pass at an airport",
      iconKey: "shield",
    },
    {
      id: "reach",
      title: "How to Reach the School",
      tag: "Getting here",
      content:
        "Fly into Delhi (DEL), then connect to Dehradun Airport (DED) — just 45 min from our campus. We offer a complimentary taxi pickup from Dehradun for all registered students. Delhi pickups available at $80 USD.",
      image: liveImage("/admin/uploads/yoga/img_6821971ac7faf.webp"),
      imageAlt: "Nirvana Yoga School campus in Rishikesh",
      iconKey: "plane",
    },
    {
      id: "weather",
      title: "Weather in Rishikesh",
      tag: "Seasons & climate",
      content:
        "Three seasons: cool winter (Oct–Feb), warm summer (Mar–Jun), and lush monsoon (Jul–Sep). December–January needs warm jackets; May–June is hottest. Best time to train: October through April.",
      image: unsplash("photo-1567361808960-dec9cb578182"),
      imageAlt: "Himalayan foothills and the Ganges near Rishikesh",
      iconKey: "leaf",
    },
    {
      id: "pack",
      title: "What to Pack",
      tag: "Essentials",
      content:
        "Bring modest, comfortable yoga clothing — white attire is traditional. Pack toiletries, walking shoes, and a light jacket for winter visits. Mats, blocks, and textbooks are fully provided by the school.",
      image: liveImage("/img/gallery/webp/private/3.webp"),
      imageAlt: "Yoga mat and practice space at the school",
      iconKey: "compass",
    },
    {
      id: "currency",
      title: "Currency & Stores",
      tag: "Around Tapovan",
      content:
        "Our campus is in Tapovan — safe and peaceful. Cafes, pharmacies, ATMs, and currency exchange are all within a 10-min walk. Foreign currency is easily exchanged locally or at the airport.",
      image: liveImage("/img/gallery/webp/dinning/dinning5.webp"),
      imageAlt: "Dining and community spaces near the school in Tapovan",
      iconKey: "wallet",
    },
    {
      id: "plugs",
      title: "Plugs & Electrical Outlets",
      tag: "Stay connected",
      content:
        "India uses Type C, D & M plugs at 230V / 50Hz. Bring a universal travel adapter to comfortably charge your laptop, phone, and accessories throughout your stay.",
      image: unsplash("photo-1586953208448-b95a79798f07"),
      imageAlt: "Travel adapter and electronics for international visitors",
      iconKey: "wifi",
    },
  ],
};
