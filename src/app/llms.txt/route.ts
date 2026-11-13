import { getBlogPosts } from "@/content/repositories/blog-post";
import { getSiteConfig } from "@/content/repositories/global-settings";
import {
  listPublicPages,
  type PublicPageRow,
} from "@/content/repositories/page-seo";
import { publicPathForPage } from "@/lib/cms/cache";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

/** Rebuild hourly, matching the content cache TTL. */
export const revalidate = 3600;

/** Section order and headings for page types. */
const SECTIONS: { type: string; heading: string }[] = [
  { type: "course", heading: "Residential Yoga Teacher Training in Rishikesh" },
  { type: "retreat", heading: "Yoga Retreats in Rishikesh" },
  { type: "online", heading: "Online Yoga Courses & Teacher Training" },
  { type: "venue", heading: "Campus & Accommodation" },
  { type: "site", heading: "About, Teachers & Contact" },
];

/** Utility pages that add nothing for an assistant answering questions. */
const SKIP_SLUGS = new Set(["booking", "retreat-booking"]);

/**
 * Single Markdown line for a page.
 *
 * @param page - Public page row
 */
function pageLine(page: PublicPageRow): string {
  const title = page.title || page.seoTitle || page.slug;
  const url = absoluteUrl(publicPathForPage(page.slug, page.type));
  const description = (page.seoDescription || page.description)
    .replace(/\s+/g, " ")
    .trim();
  const facts = [
    page.duration ? `Duration: ${page.duration}` : "",
    page.fee ? `Fee: ${page.fee}` : "",
  ].filter(Boolean);
  const detail = [description, facts.join(". ")].filter(Boolean).join(" ");
  return `- [${title}](${url})${detail ? `: ${detail}` : ""}`;
}

/**
 * /llms.txt — a Markdown guide to the site for AI assistants (llmstxt.org).
 * Built from the database so programs, fees, and durations stay current.
 */
export async function GET(): Promise<Response> {
  const [pages, posts, config] = await Promise.all([
    listPublicPages(),
    getBlogPosts()
      .then((r) => r.data ?? [])
      .catch(() => []),
    getSiteConfig()
      .then((r) => r.data)
      .catch(() => null),
  ]);

  const email = config?.contactEmail?.trim();
  const address =
    config?.address?.trim() || "Tapovan, Rishikesh, Uttarakhand 249192, India";

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    "> Nirvana Yoga School is a Yoga Alliance registered yoga school in Upper Tapovan, Rishikesh, India (established 2012). It runs residential 200, 300 and 500 hour yoga teacher training courses (Hatha, Ashtanga Vinyasa, Kundalini, Ayurveda, Meditation & Yoga Nidra), specialty trainings in Yin Yoga and Sound Healing, 3 to 7 day yoga retreats, and self-paced online yoga courses with Yoga Alliance certification.",
    "",
    "Key facts:",
    `- Location: ${address}, in the Himalayan foothills near the Ganga river.`,
    "- Certification: Yoga Alliance (RYS 200 / 300 / 500); graduates can register as RYT 200, RYT 500.",
    "- Residential courses include private or twin rooms (every room has a balcony) and three sattvic vegetarian meals a day.",
    ...(email ? [`- Contact: ${email} or ${absoluteUrl("/enquire-now")}`] : []),
    `- Website: ${absoluteUrl("/")}`,
    "",
  ];

  const home = pages.find((p) => p.slug === "home");
  for (const section of SECTIONS) {
    const items = pages.filter(
      (p) => p.type === section.type && p !== home && !SKIP_SLUGS.has(p.slug),
    );
    if (!items.length) continue;
    lines.push(`## ${section.heading}`, "", ...items.map(pageLine), "");
  }

  const published = posts.filter((p) => p.published !== false);
  if (published.length) {
    lines.push("## Articles", "");
    for (const post of published) {
      const excerpt = post.excerpt?.replace(/\s+/g, " ").trim();
      lines.push(
        `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${excerpt ? `: ${excerpt}` : ""}`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Optional",
    "",
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): every public page and article.`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
