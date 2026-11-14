/**
 * Imports the Kirtan, Vocal & Instrumental Music Training course into the CMS
 * as a residential `course` page (DB only — no static content).
 *
 * Copy is taken from the live page
 * https://www.nirvanayogaschoolindia.com/kirtan-vocal-and-instrumental-music-training
 * and images are existing Cloudinary assets from `media_assets` (looked up by id).
 *
 * Idempotent: re-running overwrites this page's course document, modules,
 * SEO row and date batches. Edit the page in admin afterwards as usual.
 *
 * Usage: npm run db:import:kirtan
 */
import type { CmsInteractiveImage } from "../src/content/types/cms-image";
import type { ResidentialCourseDocument } from "../src/content/types/course";
import type {
  PageModulesDocument,
  PricingBatch,
} from "../src/content/types/page-modules";
import { createId, db, getPool } from "../src/lib/db/node";

const SLUG = "kirtan-vocal-and-instrumental-music-training";
const TITLE = "Kirtan, Vocal & Instrumental Music Training";
const SUBTITLE =
  "A focused 5-day immersion in harmonium, voice, mantra, and mridangam rhythm — beginner-friendly devotional music training in Rishikesh.";
const FEE = "From 299 USD";
const DURATION = "5 Days";
const LEVEL = "All Levels (Beginners welcome)";
const CERTIFICATION = "Certificate of Completion";

/** Student review videos shown on the live page ("Hear from our students"). */
const VIDEOS = ["ouc32FTrbnk", "Rcqr1gSe2uE", "RqG48joKLp8", "TYal8a3zGow"];

/** Cloudinary media_assets ids, in hero order (first = listing / OG image). */
const HERO_ASSET_IDS = [
  "p6zd23v4vfisln16vm22l291", // Sound Healing
  "l5zpiybum7e153pmkyw57xhi", // Sound Healing (1)
  "ibh1ev826excl2yqfp1utj4f", // Opening Ceremony
  "jf0pzubbl7iax2hxerknt12y", // Sound Healing (2)
  "q3l2v4cqjmilgrf4zjp62308", // Ceremony Welcome
  "xiou69ptd48jrk6j4haj90an", // Event Janmastmi
  "k8ubki71nvromuj413v6qdmq", // Opening Ceremony (2)
  "gzc2p5ctpm13k39m80hhi4r5", // Yoga Pose Sound Healing
  "gxg4za1q0qbogck6bzym1v24", // Event Lohri Celebration
  "crlvwlk9zn60ocj0doyft0a8", // Private Room 2
  "zrw98ycsu2pq65c2dcj0xv5t", // Food 33
  "c2yz017d24lzbrbifbfbnv7l", // 4 Shared Room 1
  "gr4ov9xu8lhk5fogngwlvpwo", // Event Yoga Day
  "gezvawqp653x4nzdfj495rov", // Ceremony Certificate
];

const ROOM_FEATURES = [
  "Attached bathroom with hot water",
  "Balcony",
  "Wi-Fi throughout campus",
  "3 sattvic vegetarian meals daily",
];

const PRICING: ResidentialCourseDocument["pricing"] = [
  {
    roomType: "Private Room with Balcony",
    price: "$549 USD",
    originalPrice: "$732 USD",
    description: "Your own private room with balcony.",
    features: ROOM_FEATURES,
  },
  {
    roomType: "2-Shared Room with Balcony",
    price: "$449 USD",
    originalPrice: "$598 USD",
    description: "Share a room with one other student.",
    features: ROOM_FEATURES,
  },
  {
    roomType: "4-Shared Dorm with Balcony",
    price: "$349 USD",
    originalPrice: "$465 USD",
    description: "Dorm room shared with up to three students.",
    features: ROOM_FEATURES,
  },
  {
    roomType: "Private Double Balcony Room (2 people)",
    price: "$848 USD",
    originalPrice: "$1130 USD",
    description: "Private room for two people booking together.",
    features: ROOM_FEATURES,
  },
  {
    roomType: "Without Accommodation",
    price: "$299 USD",
    originalPrice: "$398 USD",
    description: "Training only — arrange your own stay.",
    features: ["Full 5-day training", "Instruments provided during sessions"],
  },
];

/** Upcoming dates from the live page (past months dropped). */
const BATCHES: PricingBatch[] = [
  "25th Nov to 30th Nov 2026",
  "25th Dec to 30th Dec 2026",
].map((dates) => ({
  dates,
  spaces: "10 seats left",
  status: "Open",
  statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  tone: "open" as const,
}));

const SYLLABUS: ResidentialCourseDocument["syllabus"] = [
  {
    title: "Chapter 1: Harmonium, Vocal Activation & Kirtan Training",
    description:
      "Build a strong foundation in harmonium playing, vocal expression, and kirtan participation — bringing melody, voice, and rhythm together step by step, from the basics of sound and notes to playing simple melodies, singing devotional songs, and coordinating both. By the end you will be able to play harmonium with basic fluency, sing simple bhajans and mantras, coordinate voice and instrument, understand basic rhythm and melody, and participate in and lead simple kirtan sessions.",
    subtopics: [
      "Harmonium Fundamentals",
      "Understanding Swaras (Notes)",
      "Scale Practice & Finger Coordination",
      "Introduction to Chords & Harmony",
      "Vocal Activation & Breath Awareness",
      "Mantra Chanting & Pronunciation",
      "Bhajan & Kirtan Practice",
      "Coordination of Voice & Instrument",
      "Introduction to Raga & Musical Expression",
      "Rhythm Awareness (Taal)",
    ],
  },
  {
    title: "Chapter 2: Mridangam (Drum) & Rhythm for Kirtan",
    description:
      "A practical understanding of rhythm through the traditional mridangam — accessible to complete beginners while offering depth for those with experience. Learn how rhythm supports singing and harmonium through steady, expressive playing, with hands-on practice and group interaction. By the end you will be able to play basic mridangam rhythms with confidence, follow rhythmic cycles, accompany bhajans and kirtan, keep a steady tempo, and take part in group music sessions.",
    subtopics: [
      "Introduction to Mridangam (Drum)",
      "Basic Strokes & Sound Techniques",
      "Understanding Rhythm (Taal)",
      "Common Rhythmic Patterns (Dadra & Keharwa)",
      "Tempo & Timing Control",
      "Kirtan Accompaniment",
      "Coordination with Singing & Harmonium",
      "Dynamic Playing",
      "Group Rhythm Practice",
    ],
  },
];

const INCLUSIONS = [
  "5 days of structured training",
  "3 hours of guided sessions each day",
  "Hands-on practical learning",
  "Group kirtan experience",
  "Instruments provided during sessions",
  "Personal guidance and feedback",
  "Accommodation (with room packages)",
  "Food (with room packages)",
  "Certificate of completion",
];

const FAQS: ResidentialCourseDocument["faqs"] = [
  {
    question: "Do I need prior musical experience?",
    answer: "No, the course is beginner-friendly and starts from the basics.",
  },
  {
    question: "Are instruments provided?",
    answer: "Yes, all required instruments are available during the training.",
  },
  {
    question: "Can I join both courses?",
    answer:
      "Yes, both courses complement each other and can be taken together.",
  },
  {
    question: "Is this suitable for yoga teachers?",
    answer:
      "Yes, the training is highly beneficial for integrating music into yoga and meditation sessions.",
  },
  {
    question: "What will I be able to do after the course?",
    answer:
      "You will be able to play, sing, and participate confidently in kirtan, and continue your practice independently.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. Participants receive a certificate upon completion of the training, recognizing their learning and participation in harmonium, vocal activation, kirtan, and rhythm practices.",
  },
  {
    question: "Is knowledge of Hindi or Sanskrit necessary to join?",
    answer:
      "No, it is not required. Mantras and songs are taught with clear guidance on pronunciation and meaning, making it easy for everyone to follow.",
  },
  {
    question: "How much practice is expected during or after the course?",
    answer:
      "A short daily practice of 15–20 minutes is usually enough to support your progress and build confidence over time.",
  },
  {
    question: "What style of music is mainly taught in this training?",
    answer:
      "The focus is on devotional music, including bhajans, mantras, and kirtan. The approach is traditional yet simple, making it easy to understand and practice.",
  },
  {
    question: "Is this course more practical or theory-based?",
    answer:
      "The training is mainly practical. Basic concepts are explained simply, but most of the time is spent on hands-on learning and guided practice.",
  },
  {
    question:
      "Can this training help me in teaching or guiding others in the future?",
    answer:
      "Yes, the course builds a strong foundation that can support you in sharing kirtan or music in small groups, yoga classes, or personal sessions.",
  },
  {
    question: "What kind of environment can I expect during the training?",
    answer:
      "The sessions are conducted in a calm, supportive, and focused environment that encourages learning, practice, and comfortable self-expression.",
  },
  {
    question:
      "Is the Mridangam (Drum) course suitable even if I have never played rhythm instruments before?",
    answer:
      "Yes, the training begins with very basic techniques and gradually builds your understanding of rhythm, making it accessible even for complete beginners.",
  },
];

const OVERVIEW_LEAD =
  "This immersive training program is designed to introduce students to the depth and beauty of devotional music through harmonium, voice, and rhythm. Rooted in traditional Indian musical wisdom, the course offers a balanced approach that combines technical learning with inner experience.";

const OVERVIEW_SUPPORTING =
  "Conducted in a focused 5-day format, the training allows participants to develop foundational skills in a short time while experiencing the meditative and expressive aspects of kirtan. It is suitable for complete beginners as well as those who wish to deepen their connection with music and chanting — the emphasis is not only on technique but on cultivating confidence, awareness, and the ability to engage in group musical settings.";

/**
 * Loads hero images from media_assets, keeping the requested order.
 */
async function loadHeroImages(): Promise<CmsInteractiveImage[]> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: string; url: string; alt: string }>(
    "select id, url, alt from media_assets where id = any($1)",
    [HERO_ASSET_IDS],
  );
  const byId = new Map(rows.map((row) => [row.id, row]));
  const missing = HERO_ASSET_IDS.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    console.warn(`Skipping missing media assets: ${missing.join(", ")}`);
  }
  return HERO_ASSET_IDS.flatMap((id) => {
    const row = byId.get(id);
    if (!row) return [];
    return [
      {
        url: row.url,
        alt: row.alt || TITLE,
        mediaAssetId: row.id,
        clickAction: "fullscreen",
        redirectUrl: "",
      } as CmsInteractiveImage,
    ];
  });
}

async function main() {
  const heroImages = await loadHeroImages();
  if (heroImages.length === 0) throw new Error("No hero images resolved");
  const coverUrl = heroImages[0].url;

  const course: ResidentialCourseDocument = {
    slug: SLUG,
    title: TITLE,
    subtitle: SUBTITLE,
    level: LEVEL,
    duration: DURATION,
    certification: CERTIFICATION,
    fee: FEE,
    image: coverUrl,
    heroImages: heroImages.map((image) => image.url),
    overview: OVERVIEW_LEAD,
    highlights: [],
    syllabusDescription:
      "Two practical chapters that bring together melody, voice, and rhythm.",
    syllabus: SYLLABUS,
    scheduleDescription: "",
    schedule: [],
    pricingDescription:
      "Total course fee including room & food. Some rooms have private balconies, while others have shared balconies.",
    pricing: PRICING,
    inclusions: INCLUSIONS,
    faqs: FAQS,
  };

  const modules: PageModulesDocument = {
    meta: {
      title:
        "Kirtan, Vocal & Instrumental Music Training in Rishikesh | 5-Day Certified Course",
      description:
        "Join our Kirtan, Vocal & Instrumental Music Training in Rishikesh, India. Master bhajans, harmonium, mridangam rhythm, and sacred mantra chanting.",
      keywords:
        "Kirtan training Rishikesh, harmonium course, mantra chanting, bhajan course, mridangam, devotional music training, Rishikesh, India",
      ogImage: coverUrl,
    },
    hero: {
      type: "bento-media",
      title: TITLE,
      subtitle: SUBTITLE,
      duration: DURATION,
      level: LEVEL,
      certification: CERTIFICATION,
      fee: FEE,
      heroImages,
      videos: VIDEOS,
    },
    stickyNav: {
      items: [
        { id: "#overview", label: "Overview", shortLabel: "Overview" },
        { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
        { id: "#eligibility", label: "Eligibility", shortLabel: "Eligible" },
        { id: "#syllabus", label: "Curriculum", shortLabel: "Syllabus" },
        { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
        { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
        { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" },
        { id: "#travel", label: "Travel", shortLabel: "Travel" },
        { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
      ],
    },
    overview: {
      eyebrow: "Devotional Music Immersion",
      title: "Course Overview",
      lead: OVERVIEW_LEAD,
      supportingCopy: OVERVIEW_SUPPORTING,
      glance: [
        { label: "Level", value: LEVEL, hint: "No musical experience needed" },
        {
          label: "Duration",
          value: DURATION,
          hint: "3 hours of sessions daily",
        },
        { label: "Certification", value: CERTIFICATION, hint: "On completion" },
        { label: "Program Fee", value: FEE, hint: "From" },
      ],
      media: {
        mode: "video",
        items: VIDEOS.map((id) => ({
          type: "video" as const,
          url: id,
          title: "Student experience",
        })),
      },
    },
    inclusions: {
      eyebrow: "Fine Print",
      title: "What is Included",
      description:
        "Simple and accessible, balanced across melody, voice, and rhythm, with a practical focus — meaningful skills in a short 5-day format, in a supportive environment that encourages confidence and self-expression.",
      items: INCLUSIONS,
    },
    eligibility: {
      eyebrow: "Eligibility",
      title: "Who Can Join",
      description: "Open to everyone — no prior musical experience is needed.",
      requirements: [
        {
          num: "01",
          title: "Complete Beginners",
          desc: "No prior musical experience required — the course starts from the very basics.",
        },
        {
          num: "02",
          title: "Yoga Practitioners & Teachers",
          desc: "Learn to bring music, mantra, and kirtan into your yoga and meditation sessions.",
        },
        {
          num: "03",
          title: "Music Enthusiasts",
          desc: "Deepen your connection with devotional music, voice, and rhythm.",
        },
        {
          num: "04",
          title: "Kirtan & Devotional Practice",
          desc: "For anyone drawn to kirtan, bhajans, and sacred mantra chanting.",
        },
      ],
      showAllianceBadge: false,
    },
    syllabus: {
      description: course.syllabusDescription,
      chapters: SYLLABUS,
    },
    schedule: { description: "", items: [] },
    pricing: {
      description: course.pricingDescription,
      duration: DURATION,
      options: PRICING,
      batches: BATCHES,
    },
    faqs: { items: FAQS },
    flags: {
      showMap: true,
      // Shared exam section is Yoga Alliance–specific; this course awards a
      // completion certificate (covered in inclusions, glance and FAQ).
      showExam: false,
      showTravel: true,
      showInstagram: true,
      showWhyNirvana: true,
      showAccommodation: true,
    },
  };

  const pageData = {
    type: "course" as never,
    eyebrow: "Kirtan & Music Training",
    title: TITLE,
    description: SUBTITLE,
    image: coverUrl,
    fee: FEE,
    duration: DURATION,
    published: true,
    pageModules: modules,
  };

  const existing = await db.page.findUnique({
    where: { slug: SLUG },
    select: { id: true, type: true },
  });
  const page = existing
    ? await db.page.update({
        where: { id: existing.id },
        data: pageData,
        select: { id: true },
      })
    : await db.page.create({
        data: { slug: SLUG, ...pageData },
        select: { id: true },
      });
  console.log(
    existing
      ? `Updated page ${page.id} (was type "${existing.type}")`
      : `Created page ${page.id}`,
  );

  await db.courseDocument.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, document: course },
    update: { document: course },
  });

  const seo = modules.meta ?? {};
  const seoRow = {
    title: seo.title ?? "",
    description: seo.description ?? "",
    ogImage: seo.ogImage ?? "",
    keywords: seo.keywords ?? "",
    noIndex: false,
  };
  await db.pageSeo.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, ...seoRow },
    update: seoRow,
  });

  await db.pageDateBatch.deleteMany({ where: { pageId: page.id } });
  await db.pageDateBatch.createMany({
    data: BATCHES.map((batch, index) => ({
      id: createId(),
      pageId: page.id,
      dates: batch.dates,
      spaces: batch.spaces,
      status: batch.status,
      tone: batch.tone,
      sort: index,
    })),
  });

  console.log(
    `Saved course document, modules (${heroImages.length} hero images, ${FAQS.length} FAQs, ${SYLLABUS.length} chapters), SEO and ${BATCHES.length} date batches.`,
  );
  console.log(`Public URL: /course/${SLUG}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
