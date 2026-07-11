import type {
  SitePageCard,
  SitePageDocument,
  SitePageSection,
} from "@/content/types";

const JUNK_LINE =
  /\||Discover the Path|Gurudev|youtube|WHATSAPP|nirvanayogaschool@gmail|\$\{price\}|25% OFF|Till 30th/i;

export type OverviewTitleKey =
  | "retreat-3"
  | "retreat-5"
  | "retreat-7"
  | "ytt-hub"
  | "teachers"
  | "about"
  | "default";

export type PagePresentation = {
  heroSubtitle: string;
  overviewTitleKey: OverviewTitleKey;
  overviewEyebrow: string;
  overviewLead: string;
  overviewSupporting?: string;
  quoteText: string;
  quoteAttribution: string;
  scheduleDescription: string;
  pricingDescription: string;
};

function condense(text: string, max = 240): string {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\s([,.;:!?])/g, "$1")
    .trim();

  if (cleaned.length <= max) return cleaned;

  const slice = cleaned.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trim()}…`;
}

function cleanParagraphs(body?: string, maxParagraphs = 3): string[] {
  if (!body) return [];

  return body
    .split("\n\n")
    .map((part) => part.replace(/\n/g, " ").trim())
    .filter((part) => part.length > 24 && !JUNK_LINE.test(part))
    .slice(0, maxParagraphs);
}

function normalizeListItem(item: string): string {
  return item
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/Accomodation/i, "Accommodation")
    .trim();
}

export function refineHeroSubtitle(page: SitePageDocument): string {
  const bySlug: Record<string, string> = {
    "yoga-teacher-training-in-rishikesh-india":
      "Residential RYT 200, 300 & 500 programs in Rishikesh — traditional lineage, Yoga Alliance certification, and immersive ashram living.",
    "online-yoga-teacher-training-courses":
      "Study yoga at your pace from home with guided live sessions, recorded modules, and Yoga Alliance pathways.",
    teacher:
      "Meet the gurus behind Nirvana — experienced teachers rooted in Himalayan tradition, anatomy, philosophy, and meditation.",
    gallery:
      "A glimpse of campus life, practice halls, rooms, meals, and the sacred landscape around our Rishikesh ashram.",
    "course-venue":
      "Explore our yoga halls, dining room, private and shared rooms, balconies, and peaceful campus on Silent Hill in Upper Tapovan, Rishikesh.",
    "retreat-venue":
      "Peaceful rooms, river views, and sattvic spaces designed for retreat, training, and quiet reflection.",
    "about-us":
      "A Rishikesh yoga school built on tradition, community, and transformative training since 2012.",
    contact:
      "Questions about courses, retreats, or bookings? Reach our team by WhatsApp, email, or the form below.",
    "become-an-affiliate":
      "Partner with Nirvana Yoga School and earn commission when your audience books a course or retreat.",
    "3-day-yoga-retreat-in-rishikesh-india":
      "A short Himalayan reset — yoga, meditation, Ayurveda, Ganga Aarti, sattvic meals, and restful ashram stay.",
    "5-day-yoga-retreat-in-rishikesh-india":
      "Five days of yoga, meditation, sound healing, and cultural immersion in the yoga capital of the world.",
    "7-day-yoga-retreat-in-rishikesh-india":
      "A deeper week-long retreat for practice, healing, excursions, and reconnecting with yourself in Rishikesh.",
    "kundalini-yoga-teacher-training-in-rishikesh-india":
      "Activate energy, study kriya, mantra, and meditation — a residential Kundalini teacher training in Rishikesh.",
    "kirtan-vocal-and-instrumental-music-training":
      "A focused 5-day immersion in harmonium, voice, mantra, and mridangam rhythm — beginner-friendly devotional music training in Rishikesh.",
    mindfulness:
      "A practical workshop on present-moment awareness through breath, posture, and guided meditation.",
    "stress-management":
      "Tools from yoga and meditation to soften stress, restore calm, and rebuild resilience in daily life.",
    "build-focus":
      "Sharpen concentration and mental clarity with yogic breath, mindfulness, and focused practice techniques.",
    "well-being-and-happiness":
      "Cultivate habits, movement, and reflection that support lasting well-being and a lighter, happier mind.",
  };

  if (bySlug[page.slug]) return bySlug[page.slug];

  if (page.slug.includes("online") && page.slug.includes("hour")) {
    return condense(
      page.description ||
        "A focused online module with expert teachers, flexible pacing, and practical yoga education.",
      180,
    );
  }

  return condense(page.description, 180);
}

export function refineOverview(
  page: SitePageDocument,
  rawBody?: string,
): string {
  const improvised: Record<string, string> = {
    "3-day-yoga-retreat-in-rishikesh-india":
      "Step away for three days in the Himalayas — morning yoga, meditation, Ayurvedic touch, and time by the Ganges. A compact retreat for anyone who needs rest, clarity, and gentle transformation.",
    "5-day-yoga-retreat-in-rishikesh-india":
      "Five unhurried days in Rishikesh blending Hatha and Yin yoga, pranayama, meditation, sound healing, and sattvic living. Experienced gurus guide you through practice, culture, and quiet time in a riverside ashram.",
    "7-day-yoga-retreat-in-rishikesh-india":
      "A full week to slow down, breathe deeply, and reset. Daily yoga and meditation, wellness therapies, excursions, and nourishing meals in the foothills of the Himalayas.",
    "yoga-teacher-training-in-rishikesh-india":
      "Train in the yoga capital with residential RYT programs rooted in Hatha, Ashtanga, Vinyasa, anatomy, philosophy, and teaching methodology. Rishikesh’s ashram atmosphere and lineage teachers make this more than certification — it is a lived path.",
    "online-yoga-teacher-training-courses":
      "Build a strong teaching foundation from home with structured modules, live guidance, and Yoga Alliance certification pathways.",
    teacher:
      "Our faculty brings decades of practice in Hatha, Vinyasa, Kundalini, anatomy, philosophy, and meditation — each teaching from lived experience in Rishikesh and beyond.",
    "about-us":
      "Since 2012, Nirvana Yoga School has welcomed students from around the world for teacher training, retreats, and workshops — grounded in traditional yoga and warm ashram hospitality.",
    gallery:
      "Walk through our campus, practice spaces, meals, rooms, and the landscapes that shape daily life at the school.",
    "course-venue":
      "Nirvana Yoga School sits in the quieter, greener part of Upper Tapovan. Purpose-built practice halls, clean residential rooms, nourishing dining spaces, balconies, and mountain surroundings support focused study and restorative ashram living.",
    "kirtan-vocal-and-instrumental-music-training":
      "This immersive 5-day training introduces devotional music through harmonium, voice, and rhythm. Rooted in traditional Indian musical wisdom, it balances technique with inner experience — ideal for beginners and yoga teachers adding kirtan to their offering.",
    "retreat-venue":
      "Clean, calm rooms with attached baths, balcony views, and easy access to the Ganges — designed for retreat guests and training students alike.",
  };

  if (improvised[page.slug]) return improvised[page.slug];

  const paragraphs = cleanParagraphs(rawBody, 2);
  if (paragraphs.length > 0) {
    return paragraphs.map((p) => condense(p, 320)).join("\n\n");
  }

  return condense(page.description, 320);
}

export function refineSupportingCopy(
  page: SitePageDocument,
): string | undefined {
  if (page.slug.includes("retreat")) {
    return "Wake to herbal tea, move through guided practice, share sattvic meals, and end the day with kirtan, Ganga Aarti, or quiet reflection. Open to beginners, teachers, and anyone seeking renewal.";
  }
  if (page.slug.includes("teacher-training")) {
    return "Live the ashram rhythm — morning practice, philosophy, anatomy, teaching labs, and community meals — while earning a credential recognized worldwide.";
  }
  if (page.slug.includes("online")) {
    return "Learn with experienced Indian teachers through a clear curriculum you can follow alongside work, travel, or home life.";
  }
  if (page.slug === "teacher") {
    return "Select a guru below to explore their background, training, and areas of expertise.";
  }
  return undefined;
}

export function refineInclusions(items: string[], body?: string): string[] {
  const parsed =
    items.length > 0
      ? items
      : (body ?? "").split("\n\n").map(normalizeListItem).filter(Boolean);

  const seen = new Set<string>();
  const refined: string[] = [];

  for (const raw of parsed) {
    const item = normalizeListItem(raw);
    if (!item || item.length > 90 || JUNK_LINE.test(item)) continue;

    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    refined.push(
      item
        .replace(
          /^Yoga Classes \(asana \/ pranayama \/ meditation\)$/i,
          "Daily asana, pranayama & meditation",
        )
        .replace(
          /^3 Times Vegetarian Meal$/i,
          "Three sattvic vegetarian meals daily",
        )
        .replace(
          /^Comfortable & Safe Accomodation$/i,
          "Comfortable ashram accommodation",
        )
        .replace(
          /^Hatha Yoga, Pranayama, Meditation & Yoga Philosophy Classes$/i,
          "Hatha yoga, pranayama, meditation & philosophy",
        ),
    );
  }

  return refined.slice(0, 12);
}

export function refineScheduleActivities(
  schedule: { time: string; activity: string }[],
): { time: string; activity: string }[] {
  return schedule.map((item) => ({
    time: item.time,
    activity: condense(
      item.activity.replace(/\s—\sNote:.*/i, "").replace(/\s—\s/g, " · "),
      100,
    ),
  }));
}

const FAQ_QUESTIONS: { pattern: RegExp; question: string }[] = [
  { pattern: /^To book/i, question: "How do I book my spot?" },
  { pattern: /^Yes, our/i, question: "Is this retreat family-friendly?" },
  {
    pattern: /^When you arrive|From Dehradun|domestic flight/i,
    question: "How do I reach the school?",
  },
  { pattern: /^Absolutely/i, question: "Do I need prior yoga experience?" },
  { pattern: /^Make sure to bring/i, question: "What should I pack?" },
  {
    pattern: /^The best time/i,
    question: "When is the best time to visit Rishikesh?",
  },
  {
    pattern: /^An advance payment|^Advance payment/i,
    question: "What is the cancellation policy?",
  },
];

export function refineFaqs(
  faqs: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  return faqs
    .filter(
      (faq) => !JUNK_LINE.test(faq.question) && !JUNK_LINE.test(faq.answer),
    )
    .map((faq) => {
      const inferred = FAQ_QUESTIONS.find((entry) =>
        entry.pattern.test(faq.answer.trim()),
      );
      return {
        question: faq.question.includes("?")
          ? faq.question
          : (inferred?.question ?? condense(faq.question, 80)),
        answer: condense(faq.answer, 360),
      };
    })
    .slice(0, 8);
}

export function refineHighlight(title: string, description: string): string {
  const improvised: Record<string, string> = {
    "Yoga Practice": "Daily Hatha, pranayama & meditation with gurus",
    "Ayurvedic Massage": "Holistic Ayurvedic massage & wellness therapies",
    Excursions: "Temple visits, nature walks & cultural experiences",
    "Cultural Immersion": "Local food, treks, workshops & Ganga Aarti",
    "Community Support": "Guided meditation & supportive group energy",
    "Inner Peace": "Sound healing, rest & emotional reset practices",
  };

  return improvised[title] ?? condense(description, 72);
}

export function refineMetaItems(
  items: { label: string; value: string }[],
): { label: string; value: string }[] {
  return items.map((item) => ({
    label: item.label,
    value: condense(item.value, 72),
  }));
}

export function refinePrograms(cards: SitePageCard[]): SitePageCard[] {
  return cards.map((card) => ({
    ...card,
    description: condense(card.description, 140),
  }));
}

export function refineEditorialSection(
  section: SitePageSection,
): SitePageSection {
  return {
    ...section,
    title: section.title.replace(/\?$/, "").trim(),
    body: cleanParagraphs(section.body, 4).join("\n\n") || undefined,
    items: section.items
      ?.map(normalizeListItem)
      .filter((item) => !JUNK_LINE.test(item)),
    subsections: section.subsections
      ?.filter((sub) => !JUNK_LINE.test(sub.title))
      .map((sub) => ({
        ...sub,
        body: sub.body ? condense(sub.body, 280) : undefined,
        items: sub.items?.map(normalizeListItem),
      })),
  };
}

function overviewTitleKeyFor(page: SitePageDocument): OverviewTitleKey {
  if (page.slug.includes("3-day-yoga-retreat")) return "retreat-3";
  if (page.slug.includes("5-day-yoga-retreat")) return "retreat-5";
  if (page.slug.includes("7-day-yoga-retreat")) return "retreat-7";
  if (page.slug === "yoga-teacher-training-in-rishikesh-india")
    return "ytt-hub";
  if (page.slug === "teacher") return "teachers";
  if (page.slug === "about-us") return "about";
  return "default";
}

export function getPagePresentation(page: SitePageDocument): PagePresentation {
  const retreatDays = page.slug.match(/(\d+)-day/)?.[1];

  const quotes: Record<string, { text: string; by: string }> = {
    "3-day-yoga-retreat-in-rishikesh-india": {
      text: "Even a few conscious days by the Ganges can shift how you breathe, eat, and meet yourself.",
      by: "Retreat wisdom",
    },
    "5-day-yoga-retreat-in-rishikesh-india": {
      text: "Retreat is not escape — it is returning to a quieter rhythm your body already knows.",
      by: "Nirvana Yoga School",
    },
    "7-day-yoga-retreat-in-rishikesh-india": {
      text: "Give yourself enough time for practice to soften the mind and reopen the heart.",
      by: "Himalayan retreat tradition",
    },
    teacher: {
      text: "A true guru helps you listen more clearly within.",
      by: "Lineage teaching",
    },
    "yoga-teacher-training-in-rishikesh-india": {
      text: "Teaching yoga begins when practice becomes honest, steady, and shared.",
      by: "YTT philosophy",
    },
  };

  const quote = quotes[page.slug] ?? {
    text: "Every journey inward begins with a single conscious breath.",
    by: "Nirvana Yoga School",
  };

  const overviewSection =
    page.sections.find((s) => /^overview|about|introduction/i.test(s.title)) ??
    page.sections[0];

  return {
    heroSubtitle: refineHeroSubtitle(page),
    overviewTitleKey: overviewTitleKeyFor(page),
    overviewEyebrow: page.eyebrow,
    overviewLead: refineOverview(page, overviewSection?.body),
    overviewSupporting: refineSupportingCopy(page),
    quoteText: quote.text,
    quoteAttribution: quote.by,
    scheduleDescription: retreatDays
      ? `A ${retreatDays}-day rhythm balancing practice, rest, excursions, and sacred time by the Ganges.`
      : "A thoughtfully paced itinerary designed for practice, rest, and renewal.",
    pricingDescription: page.slug.includes("retreat")
      ? "Choose your dates and room — packages include stay, meals, and the full retreat program."
      : "Review upcoming dates and select the package that fits your journey.",
  };
}

export function refineTeacherBio(bio: string): string {
  return condense(bio, 420);
}

export function refineTeacherSummary(summary: string): string {
  return condense(summary, 60);
}
