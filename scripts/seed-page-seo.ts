/**
 * Backfills `page_seo` for every page in the database: title, meta
 * description, keywords, and an Open Graph image that matches the page.
 *
 * By default only EMPTY fields are filled, so anything edited in admin is
 * kept. Pass `--overwrite` to replace title / description / keywords with
 * the copy below, and `--dry-run` to print the plan without writing.
 *
 *   npm run db:seed:seo
 *   npm run db:seed:seo -- --dry-run
 *   npm run db:seed:seo -- --overwrite
 *
 * Titles are written WITHOUT the brand: the site appends
 * " · Nirvana Yoga School" automatically (titles containing the brand, like
 * the homepage, are used as-is).
 */
import { getPool } from "../src/lib/db/node";

type SeoCopy = {
  title: string;
  description: string;
  keywords: string;
  /** Explicit OG image when the page has none of its own. */
  ogImage?: string;
  noIndex?: boolean;
};

const BASE_KEYWORDS = "Rishikesh, India, Yoga Alliance certified";

/** Fallback share images (Cloudinary uploads already used on the site). */
const IMG = {
  onlineHub: "", // resolved at runtime from the online hub page image
  home: "", // resolved at runtime from the homepage OG image
};

const COPY: Record<string, SeoCopy> = {
  // ── Residential teacher trainings ────────────────────────────────────
  "200-hour-yoga-teacher-training-in-rishikesh-india": {
    title: "200 Hour Yoga Teacher Training in Rishikesh, India",
    description:
      "Yoga Alliance certified 200 hour Hatha, Ashtanga & Vinyasa yoga teacher training in Rishikesh. 25-day residential RYT 200 course with stay & sattvic meals.",
    keywords: `200 hour yoga teacher training, 200 hour YTT Rishikesh, RYT 200, Hatha yoga teacher training, Ashtanga Vinyasa teacher training, ${BASE_KEYWORDS}`,
  },
  "200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india": {
    title: "200 Hour Ayurveda Yoga Teacher Training in Rishikesh",
    description:
      "Yoga Alliance certified 200 hour Ayurveda & Hatha Yoga teacher training in Rishikesh, India. Learn doshas, diet, self-care and holistic teaching in 25 days.",
    keywords: `Ayurveda yoga teacher training, 200 hour Ayurveda YTT, Ayurveda course Rishikesh, Hatha yoga teacher training, RYT 200, ${BASE_KEYWORDS}`,
  },
  "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india": {
    title: "200 Hour Kundalini Yoga Teacher Training in Rishikesh",
    description:
      "Yoga Alliance certified 200 hour Kundalini & Hatha yoga teacher training in Rishikesh, India. Master kriyas, chakras, pranayama and mantra in 25 days.",
    keywords: `Kundalini yoga teacher training, 200 hour Kundalini YTT, Kundalini yoga Rishikesh, chakra, kriya, RYT 200, ${BASE_KEYWORDS}`,
  },
  "200-hour-meditation-teacher-training-in-rishikesh-india": {
    title: "200 Hour Meditation & Yoga Nidra Teacher Training",
    description:
      "Yoga Alliance certified 200 hour Meditation, Yoga Nidra & Hatha yoga teacher training in Rishikesh, India. Learn to guide mindfulness, mantra and yogic sleep.",
    keywords: `meditation teacher training, Yoga Nidra teacher training, 200 hour meditation TTC Rishikesh, mindfulness training, RYT 200, ${BASE_KEYWORDS}`,
  },
  "300-hour-yoga-teacher-training-in-rishikesh-india": {
    title: "300 Hour Yoga Teacher Training in Rishikesh, India",
    description:
      "Advanced 300 hour Hatha, Ashtanga, Vinyasa & Ayurveda yoga teacher training in Rishikesh. 29-day Yoga Alliance course to become an RYT 500 teacher.",
    keywords: `300 hour yoga teacher training, 300 hour YTT Rishikesh, advanced yoga teacher training, RYT 500, ${BASE_KEYWORDS}`,
  },
  "500-hour-yoga-teacher-training-in-rishikesh-india": {
    title: "500 Hour Yoga Teacher Training in Rishikesh, India",
    description:
      "Comprehensive 500 hour Hatha, Ashtanga & Ayurveda yoga teacher training in Rishikesh. A 59-day Yoga Alliance RYT 500 course from foundations to mastery.",
    keywords: `500 hour yoga teacher training, 500 hour YTT Rishikesh, RYT 500, comprehensive yoga teacher training, ${BASE_KEYWORDS}`,
  },
  "sound-healing-course-in-rishikesh-india": {
    title: "Sound Healing Course in Rishikesh, India",
    description:
      "7-day sound healing training in Rishikesh, India. Learn to play Tibetan singing bowls, gongs and tuning forks and lead sound baths with confidence.",
    keywords: `sound healing course, sound healing training Rishikesh, singing bowl course, sound bath training, gong healing, ${BASE_KEYWORDS}`,
  },
  "yin-yoga-teacher-training-in-rishikesh-india": {
    title: "Yin Yoga Teacher Training in Rishikesh, India",
    description:
      "7-day Yin Yoga teacher training in Rishikesh, India. Learn fascia and connective tissue, meridians, and how to sequence and teach long-held passive poses.",
    keywords: `Yin yoga teacher training, Yin yoga course Rishikesh, Yin yoga certification, fascia, meridians, ${BASE_KEYWORDS}`,
  },

  // ── Online courses ───────────────────────────────────────────────────
  "200-hour-online-yoga-teacher-training": {
    title: "200 Hour Online Yoga Teacher Training (Yoga Alliance)",
    description:
      "Self-paced 200 hour online yoga teacher training with Yoga Alliance certification. Learn Hatha, Ashtanga & Vinyasa, anatomy and philosophy from Rishikesh teachers.",
    keywords:
      "200 hour online yoga teacher training, online YTT, online yoga certification, Yoga Alliance online course, RYT 200 online",
  },
  "online-10-hour-office-yoga-course": {
    title: "Online 10 Hour Office Yoga Course",
    description:
      "Self-paced 10 hour online office yoga course. Simple desk-friendly practices to improve posture, ease back and neck strain, and reduce stress at work.",
    keywords:
      "office yoga course, online desk yoga, chair yoga course, yoga for posture, corporate yoga, online yoga course",
  },
  "online-100-hour-yin-yoga-teacher-training-course": {
    title: "Online 100 Hour Yin Yoga Teacher Training Course",
    description:
      "Self-paced 100 hour online Yin Yoga teacher training with Yoga Alliance continuing education credit. Learn fascia, meridians and how to teach Yin classes.",
    keywords:
      "online Yin yoga teacher training, 100 hour Yin yoga course, Yin yoga certification online, YACEP, Yoga Alliance",
  },
  "online-20-hour-mindfulness-course": {
    title: "Online 20 Hour Mindfulness Course",
    description:
      "Self-paced 20 hour online mindfulness course from Rishikesh teachers. Practical techniques to stay present, calm a busy mind and reduce everyday stress.",
    keywords:
      "online mindfulness course, mindfulness training, mindfulness certificate, meditation for stress, online yoga course",
  },
  "online-20-hour-yoga-nidra-course": {
    title: "Online 25 Hour Yoga Nidra Course",
    description:
      "Self-paced 25 hour online Yoga Nidra course. Learn the practice of yogic sleep for deep relaxation, better rest and mental clarity, and how to guide it.",
    keywords:
      "online Yoga Nidra course, Yoga Nidra training, yogic sleep, guided relaxation course, online yoga course, YACEP",
  },
  "online-200-hour-ayurveda-yoga-teacher-training-course": {
    title: "Online 200 Hour Ayurveda & Yoga Teacher Training",
    description:
      "Self-paced 200 hour online Ayurveda and yoga teacher training with Yoga Alliance certification. Learn doshas, diet, daily routines and Hatha yoga teaching.",
    keywords:
      "online Ayurveda yoga teacher training, 200 hour Ayurveda course online, Ayurveda certification online, online YTT, Yoga Alliance",
  },
  "online-200-hour-meditation-yoga-nidra-teacher-training-course": {
    title: "Online 200 Hour Meditation & Yoga Nidra Teacher Training",
    description:
      "Self-paced 200 hour online meditation and Yoga Nidra teacher training with Yoga Alliance certification. Learn to guide mindfulness, mantra and yogic sleep.",
    keywords:
      "online meditation teacher training, online Yoga Nidra teacher training, 200 hour meditation course online, Yoga Alliance",
  },
  "online-25-hour-ashtanga-vinyasa-yoga-course": {
    title: "Online 25 Hour Ashtanga Vinyasa Yoga Course",
    description:
      "Self-paced 25 hour online Ashtanga Vinyasa yoga course. Build strength, flexibility and energy with the traditional primary series and breath-led flow.",
    keywords:
      "online Ashtanga yoga course, Ashtanga Vinyasa course, Vinyasa yoga online, primary series, online yoga course, YACEP",
  },
  "online-25-hour-ayurveda-course": {
    title: "Online 25 Hour Ayurveda Course",
    description:
      "Self-paced 25 hour online Ayurveda course. Learn the doshas, a balanced diet, daily routines and simple self-care to preserve health naturally.",
    keywords:
      "online Ayurveda course, Ayurveda for beginners, Ayurveda certificate online, doshas, Ayurvedic diet, YACEP",
  },
  "online-25-hour-meditation-course": {
    title: "Online 25 Hour Meditation Course",
    description:
      "Self-paced 25 hour online meditation course from Rishikesh teachers. Learn traditional techniques to quiet negative thoughts and build lasting inner peace.",
    keywords:
      "online meditation course, meditation for beginners, meditation certificate online, mindfulness, online yoga course, YACEP",
  },
  "online-25-hour-pranayama-course": {
    title: "Online 25 Hour Pranayama Course",
    description:
      "Self-paced 25 hour online pranayama course. Learn yogic breathing techniques that increase lung capacity, lower stress and deepen your meditation.",
    keywords:
      "online pranayama course, breathwork course, yogic breathing, pranayama certificate online, online yoga course, YACEP",
  },
  "online-25-hour-yoga-anatomy-physiology-course": {
    title: "Online 25 Hour Yoga Anatomy & Physiology Course",
    description:
      "Self-paced 25 hour online yoga anatomy and physiology course. Understand the body's systems and how asana, breath and movement affect them.",
    keywords:
      "online yoga anatomy course, yoga anatomy and physiology, anatomy for yoga teachers, online yoga course, YACEP",
  },
  "online-25-hour-yoga-philosophy-course": {
    title: "Online 25 Hour Yoga Philosophy Course",
    description:
      "Self-paced 25 hour online yoga philosophy course. Explore the Yoga Sutras, the eight limbs and the principles of yoga for discipline and well-being.",
    keywords:
      "online yoga philosophy course, Yoga Sutras course, eight limbs of yoga, yoga philosophy certificate, YACEP",
  },
  "online-50-hour-hatha-yoga-course": {
    title: "Online 50 Hour Hatha Yoga Course",
    description:
      "Self-paced 50 hour online Hatha yoga course from Rishikesh teachers. Build balance, strength and flexibility and improve mental clarity, at your own pace.",
    keywords:
      "online Hatha yoga course, 50 hour Hatha yoga, Hatha yoga certificate online, online yoga course, YACEP, Yoga Alliance",
  },

  // ── Retreats ─────────────────────────────────────────────────────────
  "3-day-yoga-retreat-in-rishikesh-india": {
    title: "3 Day Yoga Retreat in Rishikesh, India",
    description:
      "3-day yoga, meditation & Ayurveda wellness retreat in Rishikesh, India. Daily yoga and meditation, Ganga Aarti, sattvic meals and a peaceful stay.",
    keywords:
      "3 day yoga retreat, weekend yoga retreat Rishikesh, short yoga retreat India, meditation retreat, Ayurveda retreat, Rishikesh",
  },
  "5-day-yoga-retreat-in-rishikesh-india": {
    title: "5 Day Yoga Retreat in Rishikesh, India",
    description:
      "5-day yoga, meditation & Ayurveda retreat in Rishikesh. Hatha yoga, sound healing, Ganga Aarti, sattvic meals and a calm stay in the Himalayan foothills.",
    keywords:
      "5 day yoga retreat, yoga retreat Rishikesh, yoga holiday India, meditation retreat, sound healing retreat, Rishikesh",
  },
  "7-day-yoga-retreat-in-rishikesh-india": {
    title: "7 Day Yoga Retreat in Rishikesh, India",
    description:
      "7-day yoga, meditation & Ayurveda wellness retreat in Rishikesh. Hatha yoga, sound healing, Ganga Aarti, sattvic meals and a restful Himalayan stay.",
    keywords:
      "7 day yoga retreat, one week yoga retreat Rishikesh, yoga retreat India, meditation retreat, Ayurveda wellness retreat, Rishikesh",
  },

  // ── Venues ───────────────────────────────────────────────────────────
  "course-venue": {
    title: "Yoga School Campus & Accommodation in Rishikesh",
    description:
      "See the Nirvana Yoga School campus in Upper Tapovan, Rishikesh: yoga halls, rooms with private balconies, dining and the quiet Himalayan surroundings.",
    keywords:
      "yoga school accommodation Rishikesh, yoga teacher training accommodation, Tapovan Rishikesh, yoga hall, campus photos",
  },
  "retreat-venue": {
    title: "Yoga Retreat Venue & Rooms in Rishikesh",
    description:
      "Private and twin balcony rooms, yoga halls and quiet Himalayan grounds — explore the Nirvana Yoga School retreat venue in Rishikesh, India.",
    keywords:
      "yoga retreat venue Rishikesh, retreat accommodation India, yoga retreat rooms, Himalayan retreat, Rishikesh",
  },

  // ── Site pages ───────────────────────────────────────────────────────
  home: {
    title: "Yoga Teacher Training in Rishikesh, India | Nirvana Yoga School",
    description:
      "Yoga Alliance certified 200, 300 & 500 hour yoga teacher training in Rishikesh, India, plus yoga retreats and online courses. Est. 2012 in Upper Tapovan.",
    keywords: `yoga teacher training Rishikesh, yoga school in Rishikesh, 200 hour yoga teacher training India, 300 hour YTT, 500 hour YTT, yoga retreat Rishikesh, online yoga teacher training, ${BASE_KEYWORDS}`,
  },
  "yoga-teacher-training-in-rishikesh-india": {
    title: "Yoga Teacher Training in Rishikesh, India — All Courses",
    description:
      "Compare 200, 300 & 500 hour Yoga Alliance certified yoga teacher training courses in Rishikesh: Hatha, Ashtanga, Kundalini, Ayurveda, Meditation, Yin & more.",
    keywords: `yoga teacher training in Rishikesh, YTT India, best yoga school Rishikesh, RYT 200, RYT 500, yoga certification India, ${BASE_KEYWORDS}`,
  },
  "online-yoga-teacher-training-courses": {
    title: "Online Yoga Teacher Training Courses",
    description:
      "Self-paced Yoga Alliance online courses from Rishikesh teachers: 200 hour online YTT, Yin, Ayurveda, meditation, Yoga Nidra, pranayama and more.",
    keywords:
      "online yoga teacher training, online yoga courses, Yoga Alliance online certification, online YTT, YACEP courses",
  },
  "about-us": {
    title: "About Us — Yoga School in Rishikesh Since 2012",
    description:
      "Learn about Nirvana Yoga School in Upper Tapovan, Rishikesh: our lineage, our teachers, and our commitment to authentic, traditional yoga education since 2012.",
    keywords:
      "about Nirvana Yoga School, yoga school Rishikesh, traditional yoga school India, Yoga Alliance registered school",
  },
  teacher: {
    title: "Our Yoga Teachers in Rishikesh",
    description:
      "Meet the experienced, certified yoga teachers of Nirvana Yoga School in Rishikesh — their training, lineage and specialities in Hatha, Ashtanga and more.",
    keywords:
      "yoga teachers Rishikesh, yoga gurus India, Nirvana Yoga School faculty, experienced yoga teachers",
  },
  contact: {
    title: "Contact Us — Nirvana Yoga School, Rishikesh",
    description:
      "Contact Nirvana Yoga School in Tapovan, Rishikesh for yoga teacher training, retreats and online courses. Find our address, email, phone and directions.",
    keywords:
      "contact Nirvana Yoga School, yoga school Rishikesh address, Tapovan Rishikesh, yoga teacher training enquiry",
  },
  "enquire-now": {
    title: "Enquire About Yoga Teacher Training & Retreats",
    description:
      "Ask about dates, fees, rooms and availability for yoga teacher training, retreats and online courses at Nirvana Yoga School in Rishikesh, India.",
    keywords:
      "yoga teacher training enquiry, yoga retreat booking enquiry, Rishikesh yoga course dates, yoga course fees",
  },
  booking: {
    title: "Book Your Yoga Teacher Training in Rishikesh",
    description:
      "Reserve your place on a yoga teacher training course in Rishikesh. Choose your course, dates and room, and pay a secure deposit online.",
    keywords:
      "book yoga teacher training, yoga course booking Rishikesh, reserve YTT, yoga teacher training deposit",
  },
  "retreat-booking": {
    title: "Book a Yoga Retreat in Rishikesh",
    description:
      "Reserve your yoga retreat in Rishikesh. Choose a 3, 5 or 7 day retreat, your dates and room, and confirm your place with a secure online deposit.",
    keywords:
      "book yoga retreat Rishikesh, yoga retreat booking India, reserve yoga retreat, Rishikesh retreat dates",
  },
  blog: {
    title: "Yoga Blog — Practice, Philosophy & Teacher Training",
    description:
      "Essays on yoga practice, philosophy, pranayama and teacher training from the teachers at Nirvana Yoga School in Rishikesh, India.",
    keywords:
      "yoga blog, yoga philosophy articles, yoga teacher training tips, pranayama guide, Rishikesh yoga",
  },
  gallery: {
    title: "Yoga School Photo Gallery — Rishikesh Campus",
    description:
      "Browse photos of the Nirvana Yoga School campus, accommodation and surroundings in Upper Tapovan, Rishikesh.",
    keywords: "yoga school photos, Rishikesh campus, yoga accommodation photos",
  },
  "build-focus": {
    title: "Build Focus Workshop — Yoga for Concentration",
    description:
      "A yoga and meditation workshop for anyone wanting sharper focus and concentration at work and in life, led by Nirvana Yoga School teachers.",
    keywords:
      "focus workshop, yoga for concentration, meditation for focus, mindfulness workshop",
  },

  // ── Unpublished pages (kept ready for when they go live) ─────────────
  "become-an-affiliate": {
    title: "Yoga Affiliate Program — Earn 10% Commission",
    description:
      "Join the Nirvana Yoga School affiliate program for yoga influencers and teachers and earn 10% commission on every course or retreat booking you refer.",
    keywords:
      "yoga affiliate program, yoga influencer program, earn commission yoga",
  },
  "kirtan-vocal-and-instrumental-music-training": {
    title: "Kirtan, Vocal & Instrumental Music Training in Rishikesh",
    description:
      "Kirtan, vocal and instrumental music training in Rishikesh, India. Learn bhajans, harmonium, tabla, rhythm and sacred mantra chanting.",
    keywords:
      "kirtan training Rishikesh, harmonium course, mantra chanting course, bhajan training, tabla course India",
  },
  "kundalini-yoga-teacher-training-in-rishikesh-india": {
    title: "Kundalini Yoga Teacher Training in Rishikesh, India",
    description:
      "Kundalini yoga teacher training in Rishikesh rooted in traditional wisdom. Learn to awaken energy, work with the chakras and teach Kundalini yoga.",
    keywords: `Kundalini yoga teacher training, Kundalini yoga school Rishikesh, chakra, ${BASE_KEYWORDS}`,
  },
  mindfulness: {
    title: "Mindfulness Workshop — Yoga & Meditation",
    description:
      "A mindfulness workshop showing how yoga and meditation help in daily life: feel calmer, reduce stress and build steady awareness.",
    keywords: "mindfulness workshop, meditation workshop, yoga for stress",
  },
  "stress-management": {
    title: "Stress Management Workshop — Yoga & Meditation",
    description:
      "A stress management workshop using yoga, breathwork and meditation to restore calm, deepen relaxation and ease anxiety.",
    keywords:
      "stress management workshop, yoga for anxiety, meditation for stress",
  },
  "well-being-and-happiness": {
    title: "Well-being & Happiness Workshop",
    description:
      "A well-being and happiness workshop that teaches what truly makes you happy and how to build productive daily habits through yoga and reflection.",
    keywords: "well-being workshop, happiness workshop, yoga for wellbeing",
  },
};

type PageRow = {
  id: string;
  slug: string;
  type: string;
  image: string | null;
  title: string | null;
  description: string | null;
  seo_exists: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_og: string | null;
  seo_keywords: string | null;
};

/**
 * Applies the SEO copy to every page row.
 */
async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const overwrite = process.argv.includes("--overwrite");
  const pool = getPool() as unknown as {
    query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
  };

  const { rows } = await pool.query<PageRow>(
    `SELECT p.id, p.slug, p.type, p.image, p.title, p.description,
            (s.page_id IS NOT NULL) AS seo_exists,
            s.title AS seo_title, s.description AS seo_description,
            s.og_image AS seo_og, s.keywords AS seo_keywords
       FROM pages p LEFT JOIN page_seo s ON s.page_id = p.id
      ORDER BY p.type, p.slug`,
  );

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  IMG.home = bySlug.get("home")?.seo_og?.trim() || "";
  IMG.onlineHub =
    bySlug.get("online-yoga-teacher-training-courses")?.image?.trim() || "";

  const pick = (current: string | null | undefined, next: string) =>
    overwrite || !current?.trim() ? next : current.trim();

  let written = 0;
  const missing: string[] = [];

  for (const row of rows) {
    const copy = COPY[row.slug];
    if (!copy) {
      missing.push(row.slug);
    }

    const fallbackTitle = row.title?.trim() || row.slug;
    const fallbackDescription = row.description?.trim() || "";

    const title = pick(row.seo_title, copy?.title ?? fallbackTitle);
    const description = pick(
      row.seo_description,
      copy?.description ?? fallbackDescription,
    );
    const keywords = pick(row.seo_keywords, copy?.keywords ?? "");
    // OG image: keep an existing one; else the page's own image; else a
    // related fallback (online hub for online courses, homepage otherwise).
    const ogImage =
      row.seo_og?.trim() ||
      copy?.ogImage ||
      row.image?.trim() ||
      (row.type === "online" ? IMG.onlineHub : "") ||
      IMG.home;

    console.log(
      `${row.seo_exists ? "update" : "insert"} ${row.type.padEnd(7)} ${row.slug}\n` +
        `    title (${title.length}): ${title}\n` +
        `    desc  (${description.length}): ${description.slice(0, 90)}…\n` +
        `    og: ${ogImage ? ogImage.split("/").pop() : "(none)"}`,
    );

    if (dryRun) continue;

    await pool.query(
      `INSERT INTO page_seo (page_id, title, description, og_image, keywords, no_index, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (page_id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         og_image = EXCLUDED.og_image,
         keywords = EXCLUDED.keywords,
         no_index = page_seo.no_index OR EXCLUDED.no_index,
         updated_at = CURRENT_TIMESTAMP`,
      [row.id, title, description, ogImage, keywords, copy?.noIndex === true],
    );
    written++;
  }

  if (missing.length) {
    console.log(
      `\nNo hand-written copy for: ${missing.join(", ")} — used the page's own title/description.`,
    );
  }
  console.log(
    `\n${dryRun ? "Dry run — nothing written." : `Wrote SEO for ${written} pages.`}` +
      ` Mode: ${overwrite ? "overwrite" : "fill empty fields only"}.`,
  );
  console.log(
    "Public pages refresh within an hour (content cache TTL), or immediately after a redeploy.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
