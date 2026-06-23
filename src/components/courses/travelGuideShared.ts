import { Compass, Leaf, Plane, Shield, Wallet, Wifi } from "@/icons";

const SITE = "https://www.nirvanayogaschoolindia.com";

export function liveTravelImage(path: string): string {
  return path.startsWith("http") ? path : `${SITE}${path}`;
}

/** 16:9 crop for consistent hero framing */
function unsplash(id: string, altCrop = "crop"): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=${altCrop}&w=1600&h=900&q=85`;
}

export type TravelTopic = {
  id: string;
  title: string;
  tag: string;
  content: string;
  image: string;
  imageAlt: string;
  Icon: typeof Shield;
};

export const TRAVEL_TOPICS: TravelTopic[] = [
  {
    id: "visa",
    title: "Visa Requirements",
    tag: "Before you fly",
    content:
      "You will need a tourist Visa or an e-Visa to do a yoga course in India. The visa duration typically ranges from 30 to 180 days depending on your nationality. It is recommended to apply online for an e-Tourist Visa at least 15-30 days before departure.",
    image: unsplash("photo-1436491865332-7a61a109cc05"),
    imageAlt: "Passport and boarding pass at an airport",
    Icon: Shield,
  },
  {
    id: "reach",
    title: "How to Reach the School",
    tag: "Getting here",
    content:
      "First, book an international flight to New Delhi's Indira Gandhi International Airport (DEL). From Delhi, we recommend booking a domestic connection to Dehradun Jolly Grant Airport (DED). Dehradun is just a 45-minute drive from Rishikesh, and we offer a complimentary taxi pick-up service from Dehradun Airport directly to our school for all registered students. Alternatively, we can arrange Delhi Airport pickups for a charge of $80 USD.",
    image: liveTravelImage("/admin/uploads/yoga/img_6821971ac7faf.webp"),
    imageAlt: "Nirvana Yoga School campus in Rishikesh",
    Icon: Plane,
  },
  {
    id: "weather",
    title: "Weather in Rishikesh",
    tag: "Seasons & climate",
    content:
      "Rishikesh experiences three distinct seasons: Winter (October to February) is cool and crisp, with December and January requiring warm jackets. Summer (March to June) is warm to hot, with May and June reaching peak temperatures. The Monsoon (July to September) brings cooling rain showers that make the surrounding Himalayan hills lush and green.",
    image: unsplash("photo-1567361808960-dec9cb578182"),
    imageAlt: "Himalayan foothills and the Ganges near Rishikesh",
    Icon: Leaf,
  },
  {
    id: "pack",
    title: "What to Pack",
    tag: "Essentials",
    content:
      "Pack comfortable, modest clothing suitable for yoga practice. White or light-colored attire is highly traditional and ideal for meditation sessions. Make sure to bring personal toiletries, walking shoes for excursions, and a light jacket if arriving in winter. All other study kits, yoga blocks, mats, and textbooks are fully provided.",
    image: liveTravelImage("/img/gallery/webp/private/3.webp"),
    imageAlt: "Yoga mat and practice space at the school",
    Icon: Compass,
  },
  {
    id: "currency",
    title: "Currency & Stores",
    tag: "Around Tapovan",
    content:
      "Our school is located in Tapovan, a safe and peaceful neighborhood popular with international seekers. Local cafes, convenience stores, pharmacies, and certified currency exchange centers are all within a 10-minute walk. ATMs are widely available, and foreign currency can easily be exchanged locally or at the airport.",
    image: liveTravelImage("/img/gallery/webp/dinning/dinning5.webp"),
    imageAlt: "Dining and community spaces near the school in Tapovan",
    Icon: Wallet,
  },
  {
    id: "plugs",
    title: "Plugs & Electrical Outlets",
    tag: "Stay connected",
    content:
      "India primarily uses Types C, D, and M plugs with a standard voltage of 230V and 50Hz. We suggest bringing a universal adapter to charge your laptops, phones, and travel accessories comfortably.",
    image: unsplash("photo-1586953208448-b95a79798f07"),
    imageAlt: "Travel adapter and electronics for international visitors",
    Icon: Wifi,
  },
];

export const QUICK_FACTS = [
  { label: "Nearest airport", value: "Dehradun (DED)" },
  { label: "Drive to school", value: "~45 minutes" },
  { label: "Airport pickup", value: "Complimentary" },
  { label: "Neighborhood", value: "Upper Tapovan" },
];

export const TRAVEL_INTRO =
  "Travelling to a new country can feel daunting. This practical guide covers visas, flights, packing, and local tips to make your journey to Rishikesh as smooth as possible.";
