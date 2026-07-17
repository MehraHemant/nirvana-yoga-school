import type { FAQEntry } from "@/components/ui/FAQSection";

/**
 * Seed-only venue FAQs.
 * Runtime UI loads from MySQL via `getVenueFaqs()` / `/api/content/venue-faqs`.
 */
export const VENUE_FAQS: FAQEntry[] = [
  {
    question: "Where is Nirvana Yoga School located?",
    answer:
      "We are in Upper Tapovan, Rishikesh — a quiet hillside area a short walk from the Ganges, Laxman Jhula, and local cafés.",
  },
  {
    question: "What accommodation options are available on campus?",
    answer:
      "Students can choose private rooms, 2-shared, 3-shared, or 4-shared dorms. Most rooms include an attached bathroom, hot water, fan, bedsheets, and balcony access.",
  },
  {
    question: "Is Wi-Fi available throughout the campus?",
    answer:
      "Yes, Wi-Fi is available across the school so you can stay connected with family while you train or retreat.",
  },
  {
    question: "What facilities can I see in the venue gallery?",
    answer:
      "The gallery covers yoga halls, dining spaces, private and shared rooms, dorms, balconies, and general campus premises around Silent Hill.",
  },
  {
    question: "Are meals included with residential programs?",
    answer:
      "Residential courses and retreats include three fresh sattvic vegetarian meals daily, prepared with wholesome grains, lentils, vegetables, and seasonal produce.",
  },
  {
    question: "Can dietary restrictions be accommodated?",
    answer:
      "Yes — vegan, gluten-free, and allergy-aware meals can be arranged if you let us know when booking or on arrival.",
  },
  {
    question: "How far is the school from the Ganges River?",
    answer:
      "The campus is within walking distance of the Ganges, making it easy to join morning meditation, evening walks, or Ganga Aarti during your stay.",
  },
  {
    question: "Is the campus suitable for both courses and retreats?",
    answer:
      "Yes. The same venue supports residential teacher training, short music workshops, and yoga retreats with dedicated practice halls and peaceful lodging.",
  },
];
