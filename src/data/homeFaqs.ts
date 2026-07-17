/**
 * Seed-only homepage FAQ source (legacy static imports).
 * Runtime UI loads from MySQL via `getHomeFaqs()` / `/api/content/home-faqs`.
 */
import { beach_yoga, certificate } from "@/assets";
import type { FAQEntry } from "@/components/ui/FAQSection";

export const HOME_FAQS: FAQEntry[] = [
  {
    question: "How much does yoga teacher training cost in India?",
    answer:
      "Yoga teacher training in India typically costs between $700 and $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, three sattvic meals a day, course manual, excursions and Yoga Alliance certification.",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&auto=format&fit=crop&q=80",
    tag: "Pricing",
  },
  {
    question: "Which certification is best for yoga teachers?",
    answer:
      "Yoga Alliance USA is the most widely recognised yoga certification in the world. We offer RYT 200, RYT 300, and RYT 500-hour programs — all meeting international standards so you can teach confidently anywhere.",
    image: certificate,
    tag: "Certification",
  },
  {
    question: "Do I need prior yoga experience to join?",
    answer:
      "No advanced experience is required for our 200-hour foundational course. An open heart, basic familiarity with yoga, and the willingness to commit fully are all you need. Our courses gently guide you from the ground up.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Prerequisites",
  },
  {
    question: "What kind of food do you serve?",
    answer:
      "Three nourishing sattvic vegetarian meals daily, prepared fresh with Ayurvedic balance and cold-pressed sunflower oil. Vegan and gluten-free options are available on request — just let us know at registration.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
    tag: "Nutrition",
  },
  {
    question: "Why is Rishikesh called the yoga capital of the world?",
    answer:
      "Rishikesh is where ancient sages first practiced and taught yoga, on the banks of the Ganges and beneath the Himalayas. To this day seekers come here to feel its radiant spiritual energy and deep yogic culture firsthand.",
    image: beach_yoga,
    tag: "Heritage",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Days begin around 6am with meditation and pranayama, followed by Hatha or Ashtanga practice, breakfast, philosophy and anatomy classes, lunch, rest, alignment workshops, evening practice, satsang or kirtan, and dinner. Sundays are reserved for excursions and rest.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Daily Vibe",
  },
];
