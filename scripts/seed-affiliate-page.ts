/**
 * Seeds the Become an Affiliate page (`pages.content_data`, kind "affiliate").
 *
 * Copy is based on https://www.nirvanayogaschoolindia.com/become-an-affiliate
 * (typos fixed, step images turned into editable steps). The hero image is an
 * existing Cloudinary asset, and calculator fees are read from the published
 * course pages so they match the live catalogue.
 *
 * Idempotent: overwrites this page's content_data and SEO row only. Edit
 * afterwards in Admin → Other pages → Become an Affiliate.
 *
 * Usage: npm run db:seed:affiliate
 */
import type { AffiliatePageContent } from "../src/content/types/dedicated-pages";
import { db, getPool } from "../src/lib/db/node";

const SLUG = "become-an-affiliate";
const HERO_ASSET_ID = "gezvawqp653x4nzdfj495rov"; // Ceremony Certificate
const RATE = 10;

/**
 * Whole-dollar amount from strings like "From 1449 USD" / "$79 USD".
 *
 * @param fee - Listing fee text
 */
function parseFee(fee: string | null): number {
  const match = (fee ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(Number(match[1])) : 0;
}

/**
 * Calculator options from published course pages (in-person first, then online).
 */
async function loadPrograms(): Promise<
  AffiliatePageContent["calculator"]["programs"]
> {
  const { rows } = await getPool().query<{
    type: string;
    title: string;
    fee: string | null;
  }>(
    "select type, title, fee from pages where published and type in ('course','online')",
  );
  return rows
    .map((row) => ({
      type: row.type,
      label: row.type === "online" ? row.title : `${row.title} (in person)`,
      feeUsd: parseFee(row.fee),
    }))
    .filter((row) => row.feeUsd > 0)
    .sort((a, b) =>
      a.type === b.type ? b.feeUsd - a.feeUsd : a.type === "course" ? -1 : 1,
    )
    .map(({ label, feeUsd }) => ({ label, feeUsd }));
}

async function main() {
  const { rows } = await getPool().query<{ url: string }>(
    "select url from media_assets where id = $1",
    [HERO_ASSET_ID],
  );
  const heroImage = rows[0]?.url ?? "";
  if (!heroImage) console.warn("Hero image asset not found — leaving empty");
  const programs = await loadPrograms();

  const content: AffiliatePageContent = {
    kind: "affiliate",
    meta: {
      title: "Yoga Affiliate Program — Earn 10% Commission",
      description:
        "Join the Nirvana Yoga School affiliate program for yoga influencers and teachers and earn 10% commission on every course or retreat booking you refer.",
      keywords:
        "yoga affiliate program, yoga affiliate marketing, earn commission yoga courses, yoga influencer program, Rishikesh yoga school affiliate",
      ogImage: heroImage,
    },
    commissionRate: RATE,
    hero: {
      image: heroImage,
      eyebrow: "Affiliate Program",
      title: "Earn 10% Affiliate Commission on Every Booking.",
      lead: "Build your platform and grow your earnings by sharing authentic yoga courses from Rishikesh — online and in person.",
      primaryCtaLabel: "Sign up — it's free",
      secondaryCtaLabel: "How it works",
      chips: ["Free to join", "Online & in-person courses", "Monthly payouts"],
    },
    stats: [
      { value: "10%", label: "Commission per booking" },
      { value: "Monthly", label: "Payouts" },
      { value: "PayPal / Bank", label: "Paid your way" },
      { value: "Real-time", label: "Booking dashboard" },
    ],
    tracksSection: {
      eyebrow: "How it works",
      title: "Two ways to earn 10%",
      lead: "Refer students to our online courses with your affiliate link, or to our Rishikesh courses with your personal code.",
    },
    tracks: [
      {
        id: "online",
        label: "Online Courses",
        title: "Get started with 4 easy steps and earn 10%",
        description:
          "Every online course gets its own unique link. Bookings made through your links are tracked automatically in your dashboard.",
        steps: [
          {
            iconKey: "user",
            title: "Sign up",
            body: "Fill in the short form below — your affiliate account is created for free.",
          },
          {
            iconKey: "link",
            title: "Get your affiliate links",
            body: "Receive a unique link for each of our online courses.",
          },
          {
            iconKey: "share",
            title: "Market your links",
            body: "Share them with your audience on social media, YouTube, your blog or newsletter.",
          },
          {
            iconKey: "wallet",
            title: "Start earning",
            body: "Earn 10% of the fee on every booking, paid out monthly.",
          },
        ],
      },
      {
        id: "in-person",
        label: "In-person Courses",
        title: "Get started with 4 easy steps and earn 10%",
        description:
          "Students enter your code in the “Reference code” field when they apply or book a course in Rishikesh.",
        steps: [
          {
            iconKey: "user",
            title: "Sign up",
            body: "Fill in the short form below — your affiliate account is created for free.",
          },
          {
            iconKey: "code",
            title: "Get your affiliate code",
            body: "We send you a personal reference code.",
          },
          {
            iconKey: "users",
            title: "Refer a student with your code",
            body: "Students add your code in the “Reference code” field when booking.",
          },
          {
            iconKey: "wallet",
            title: "Start earning",
            body: "Your 10% commission is paid once the student has checked in and paid their fee.",
          },
        ],
      },
    ],
    calculator: {
      eyebrow: "Earnings calculator",
      title: "See what you could earn",
      lead: "Pick a course and how many bookings you expect to refer each month.",
      note: "Estimate only, based on the current course fee. Your commission is 10% of the total fee paid by the student.",
      programs,
    },
    benefitsSection: {
      eyebrow: "Why partner with us",
      title: "Why choose our affiliate program",
      lead: "",
    },
    benefits: [
      {
        title: "High probability of conversion",
        body: "Situated in Rishikesh, the yoga capital of the world, Nirvana Yoga School has a team of highly experienced teachers of the Himalayan tradition who guide students to their highest potential.",
      },
      {
        title: "Easily keep track of bookings",
        body: "With real-time metrics in your affiliate dashboard, easily measure bookings and revenue. Stay up to date with your earnings, with transparent transactions and no hassle.",
      },
      {
        title: "Increasing demand for Indian yoga courses",
        body: "Demand for Indian yoga courses is at an all-time high as interest in yoga grows worldwide. All courses are carefully designed and taught by our Indian gurus.",
      },
      {
        title: "Email & WhatsApp support",
        body: "We know you need real-time help. Our dedicated affiliate support team is available on email and WhatsApp whenever you need us.",
      },
      {
        title: "10% affiliate commission",
        body: "Our commission plan makes sure your work is properly rewarded — a flat 10% on every booking, for both online and in-person courses.",
      },
      {
        title: "Monthly payouts",
        body: "Every achievement deserves a reward. Receive your commission every month to your PayPal or bank account — a reliable, steady source of income.",
      },
    ],
    reviews: {
      eyebrow: "Trusted by students worldwide",
      title: "What your audience will experience",
      description:
        "Real reviews from students who trained with us — the reason referrals turn into bookings.",
    },
    faqsSection: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
    },
    faqs: [
      {
        question: "How does the affiliate program work for online courses?",
        answer:
          "After you sign up, your affiliate account is created and you receive a unique link for each of our online courses. Promote these links to get bookings. Payouts are made monthly based on the number of bookings you bring.",
      },
      {
        question: "How can I refer a student for in-person courses?",
        answer:
          "After you sign up, we give you a unique code. When filling in the application or booking form, the student enters this code in the “Reference code” field. You receive your commission after the student has checked in at the school and paid their fee.",
      },
      {
        question: "How much commission do I receive as an affiliate?",
        answer:
          "You receive a flat 10% commission on the total fee, for both in-person and online courses.",
      },
      {
        question: "How can I keep track of my bookings?",
        answer:
          "Bookings made through your affiliate link are visible in your affiliate dashboard, which updates as soon as a new booking is made.",
      },
      {
        question: "How and when do I get my commission?",
        answer:
          "We calculate your commission once a month and pay it out every month to your PayPal or bank account — whichever you prefer.",
      },
      {
        question: "Who can become an affiliate?",
        answer:
          "Our affiliate program is open to everyone. Anyone with a passion for yoga or good marketing skills can join and start earning.",
      },
      {
        question: "Does it cost anything to join?",
        answer: "No. Joining the affiliate program is completely free.",
      },
    ],
    form: {
      eyebrow: "Join the program",
      title: "Sign up as an affiliate",
      lead: "Tell us a little about yourself and where you'll share our courses. We'll set up your account and send your affiliate link or code by email or WhatsApp.",
      submitLabel: "Sign up",
      successTitle: "Welcome aboard!",
      successBody:
        "Thanks for signing up. Our affiliate team will set up your account and send your link or code by email or WhatsApp shortly.",
      platforms: [
        "Instagram",
        "YouTube",
        "TikTok",
        "Facebook",
        "Blog / website",
        "Newsletter / email list",
        "Yoga studio or classes I teach",
        "WhatsApp / community groups",
        "Other",
      ],
    },
  };

  const existing = await db.page.findUnique({
    where: { slug: SLUG },
    select: { id: true },
  });
  const data = {
    type: "site" as never,
    title: "Become an Affiliate",
    eyebrow: "Affiliate Program",
    description: content.hero.lead,
    image: heroImage,
    published: true,
    contentData: content,
  };
  const page = existing
    ? await db.page.update({
        where: { id: existing.id },
        data,
        select: { id: true },
      })
    : await db.page.create({
        data: { slug: SLUG, ...data },
        select: { id: true },
      });

  const seo = {
    title: content.meta?.title ?? "",
    description: content.meta?.description ?? "",
    ogImage: content.meta?.ogImage ?? "",
    keywords: content.meta?.keywords ?? "",
    noIndex: false,
  };
  await db.pageSeo.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, ...seo },
    update: seo,
  });

  console.log(
    `${existing ? "Updated" : "Created"} ${SLUG} (${page.id}): ${content.tracks.length} tracks, ${content.benefits.length} benefits, ${content.faqs.length} FAQs, ${programs.length} calculator courses.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
