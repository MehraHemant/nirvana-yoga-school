import * as cheerio from "cheerio";
import { DEFAULT_ONLINE_NAV } from "../src/content/page-modules-defaults";
import type {
  CoursePricingOption,
  CourseSyllabusSection,
  FAQ,
  OnlineCourseDocument,
  Teacher,
} from "../src/content/types";
import { buildModulesFromOnlineCourse } from "../src/lib/cms/page-modules-builder";
import { db, getPool } from "../src/lib/db/node";
import { LIVE_SITE } from "../src/lib/live-site";

const HUB_SLUG = "online-yoga-teacher-training-courses";
const USER_AGENT =
  "Mozilla/5.0 (compatible; NirvanaYogaSchoolCMS/1.0; +https://www.nirvanayogaschoolindia.com)";

type ScrapeResult = {
  slug: string;
  url: string;
  document: OnlineCourseDocument;
};

type ImportAction = "created" | "skipped" | "updated" | "failed";

type ImportRow = {
  slug: string;
  action: ImportAction;
  reason?: string;
};

/**
 * Normalize a live-site absolute or root-relative URL.
 *
 * @param href - Raw href or src
 */
function absolutize(href: string | undefined): string {
  if (!href) return "";
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return `${LIVE_SITE}${trimmed}`;
  return `${LIVE_SITE}/${trimmed}`;
}

/**
 * Collapse whitespace in scraped text.
 *
 * @param value - Raw text
 */
function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Extract slug from a live course URL.
 *
 * @param url - Absolute course URL
 */
function slugFromUrl(url: string): string {
  const pathname = new URL(url).pathname.replace(/\/+$/, "");
  return pathname.split("/").filter(Boolean).pop() ?? "";
}

/**
 * Fetch HTML from the live site.
 *
 * @param url - Absolute URL
 */
async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

/**
 * Discover online course URLs from sitemap + hub page links.
 */
async function discoverOnlineCourseUrls(): Promise<string[]> {
  const urls = new Set<string>();

  const sitemapXml = await fetchHtml(`${LIVE_SITE}/sitemap.xml`);
  for (const match of sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = match[1]?.trim();
    if (!loc) continue;
    if (!/nirvanayogaschoolindia\.com/i.test(loc)) continue;
    if (!/online/i.test(loc)) continue;
    urls.add(loc.replace(/\/+$/, ""));
  }

  try {
    const hubHtml = await fetchHtml(
      `${LIVE_SITE}/online-yoga-teacher-training-courses`,
    );
    const $ = cheerio.load(hubHtml);
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const absolute = absolutize(href).replace(/\/+$/, "");
      if (!absolute.includes("nirvanayogaschoolindia.com")) return;
      if (!/online/i.test(absolute)) return;
      urls.add(absolute);
    });
  } catch (error) {
    console.warn(
      "Hub page discovery failed; continuing with sitemap only.",
      error instanceof Error ? error.message : error,
    );
  }

  return [...urls]
    .filter((url) => {
      const slug = slugFromUrl(url);
      if (!slug || slug === HUB_SLUG) return false;
      // Course pages, not the enroll subdomain / sign-in.
      if (url.includes("onlinecourses.")) return false;
      return (
        slug.includes("online") ||
        slug.endsWith("-online-yoga-teacher-training") ||
        /^(\d+-hour-)?online-/i.test(slug) ||
        /online-yoga-teacher-training$/i.test(slug)
      );
    })
    .sort((a, b) => slugFromUrl(a).localeCompare(slugFromUrl(b)));
}

/**
 * Parent section wrapper for an h2 (live site uses `.py-5` blocks).
 *
 * @param $ - Cheerio root
 * @param headingRe - Heading matcher
 */
function sectionForH2($: cheerio.CheerioAPI, headingRe: RegExp) {
  const heading = $("h2")
    .filter((_, el) => headingRe.test(cleanText($(el).text())))
    .first();
  if (!heading.length) return null;
  return heading.parent();
}

/**
 * Collect paragraph text from a section, including top-level `p` nodes.
 *
 * @param $ - Cheerio root
 * @param section - Section selection
 */
function sectionParagraphs(
  $: cheerio.CheerioAPI,
  section: ReturnType<cheerio.CheerioAPI>,
): string[] {
  const texts: string[] = [];
  section.children("p").each((_, el) => {
    const text = cleanText($(el).text());
    if (text) texts.push(text);
  });
  if (texts.length) return texts;
  section.find("p").each((_, el) => {
    const text = cleanText($(el).text());
    if (text) texts.push(text);
  });
  return texts;
}

/**
 * Extract overview paragraphs from the Overview section.
 *
 * @param $ - Cheerio root
 */
function extractOverview($: cheerio.CheerioAPI): string {
  const section = sectionForH2($, /^overview\b/i);
  if (!section) return "";
  return sectionParagraphs($, section)
    .filter((text) => text.length > 40)
    .join("\n\n");
}

/**
 * Extract inclusion lines (check-marked paragraphs or list items).
 *
 * @param $ - Cheerio root
 */
function extractInclusions($: cheerio.CheerioAPI): string[] {
  const section = sectionForH2($, /^inclusions?\b/i);
  if (!section) return [];
  const fromLis = section
    .find("li")
    .toArray()
    .map((el) => cleanText($(el).text()))
    .filter(Boolean);
  if (fromLis.length) return [...new Set(fromLis)];

  return [
    ...new Set(
      sectionParagraphs($, section).filter(
        (text) => text.length > 8 && text.length < 300,
      ),
    ),
  ];
}

/**
 * Extract curriculum chapters as syllabus sections.
 *
 * @param $ - Cheerio root
 */
function extractSyllabus($: cheerio.CheerioAPI): CourseSyllabusSection[] {
  const section = sectionForH2($, /^curriculum\b/i);
  if (!section) return [];

  const chapters: CourseSyllabusSection[] = [];
  const h3s = section.find("h3").toArray();
  if (h3s.length === 0) {
    const items = section
      .find("li")
      .toArray()
      .map((el) => cleanText($(el).text()))
      .filter(Boolean);
    if (items.length) {
      chapters.push({
        title: "Curriculum",
        description: "",
        subtopics: items,
      });
    }
    return chapters;
  }

  for (const h3 of h3s) {
    const title = cleanText($(h3).text());
    if (!title) continue;
    const subtopics: string[] = [];
    let el = $(h3).next();
    while (el.length && !el.is("h2") && !el.is("h3")) {
      if (el.is("ul, ol")) {
        el.find("li").each((_, li) => {
          const text = cleanText($(li).text());
          if (text) subtopics.push(text);
        });
      } else {
        el.find("ul li, ol li").each((_, li) => {
          const text = cleanText($(li).text());
          if (text) subtopics.push(text);
        });
      }
      el = el.next();
    }
    chapters.push({
      title,
      description: "",
      subtopics,
    });
  }
  return chapters;
}

/**
 * Extract FAQ pairs from the custom accordion markup.
 *
 * @param $ - Cheerio root
 */
function extractFaqs($: cheerio.CheerioAPI): FAQ[] {
  const faqs: FAQ[] = [];
  $(".klundesaga-item").each((_, el) => {
    const question = cleanText(
      $(el).find(".klundesaga-title h6, .klundesaga-title").first().text(),
    )
      .replace(/\s*$/, "")
      .replace(/\s*<.*$/, "");
    const answer = cleanText($(el).find(".klundesaga-content").first().text());
    if (question && answer) faqs.push({ question, answer });
  });
  if (faqs.length) return faqs;

  // Fallback: Bootstrap-style accordion
  $(".accordion-item").each((_, el) => {
    const question = cleanText($(el).find(".accordion-button").first().text());
    const answer = cleanText($(el).find(".accordion-body").first().text());
    if (question && answer) faqs.push({ question, answer });
  });
  return faqs;
}

/**
 * Parse one teacher card root into a Teacher record.
 *
 * @param $ - Cheerio root
 * @param card - Card element
 */
function teacherFromCard(
  $: cheerio.CheerioAPI,
  card: Parameters<cheerio.CheerioAPI>[0],
): Teacher | null {
  const $card = $(card);
  const name = cleanText($card.find("h3").first().text());
  if (!name || name.length > 80) return null;

  const experienceSummary = cleanText(
    $card.find("p.h5, p .fw-bold, i.fw-bold, p i").first().text(),
  );
  const image =
    absolutize($card.find("img").first().attr("src")) ||
    absolutize($card.find("img").first().attr("data-src"));

  const bioParts: string[] = [];
  $card.find(".js-excerpt > p, .excerpt-hidden > p").each((_, p) => {
    const text = cleanText($(p).text());
    if (text) bioParts.push(text);
  });
  if (!bioParts.length) {
    const firstP = cleanText($card.find("p").not(".h5").first().text());
    if (firstP) bioParts.push(firstP);
  }

  const listAfter = (label: RegExp): string[] => {
    const heading = $card
      .find("h4, h5, strong")
      .toArray()
      .find((el) => label.test(cleanText($(el).text())));
    if (!heading) return [];
    const ul = $(heading).nextAll("ul").first();
    return ul
      .find("li")
      .toArray()
      .map((li) => cleanText($(li).text()))
      .filter(Boolean);
  };

  return {
    name,
    experienceSummary,
    image: image || "",
    bio: bioParts.join("\n\n"),
    education: listAfter(/^education/i),
    detailedExperience: listAfter(/^experience/i),
    expertise: listAfter(/^expertise/i),
  };
}

/**
 * Extract teacher cards from the Teachers section (including HTML comments).
 *
 * @param $ - Cheerio root
 * @param html - Raw HTML (for commented-out teacher blocks)
 */
function extractTeachers($: cheerio.CheerioAPI, html: string): Teacher[] {
  const teachers: Teacher[] = [];
  const cards = $(".showteachers .teachers, .showteachers .shadow").toArray();
  const roots = cards.length ? cards : $(".showteachers > div").toArray();

  for (const card of roots) {
    const teacher = teacherFromCard($, card);
    if (teacher) teachers.push(teacher);
  }

  // Some live pages leave teacher cards as line-by-line HTML comments.
  if (teachers.length === 0) {
    const showteachersHtml =
      html.match(
        /<div class="showteachers">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="py-5">\s*<h2>\s*Frequently/i,
      )?.[1] ??
      html.match(
        /<div class="showteachers">([\s\S]*?)<h2>\s*Frequently/i,
      )?.[1] ??
      "";
    const unwrapped = showteachersHtml
      .replace(/<!--\s?/g, "")
      .replace(/\s?-->/g, "");
    if (/<h3>/i.test(unwrapped)) {
      const $$ = cheerio.load(`<div class="showteachers">${unwrapped}</div>`);
      $$(".teachers, .shadow").each((_, card) => {
        const teacher = teacherFromCard($$, card);
        if (teacher) teachers.push(teacher);
      });
      if (!teachers.length) {
        $$(".showteachers h3").each((_, h3) => {
          const card = $$(h3)
            .closest("div.teachers, div.shadow, div.row")
            .first();
          const teacher = teacherFromCard(
            $$,
            card.length
              ? (card.get(0) as Parameters<cheerio.CheerioAPI>[0])
              : h3,
          );
          if (teacher) teachers.push(teacher);
        });
      }
    }
  }

  const seen = new Set<string>();
  return teachers.filter((teacher) => {
    const key = teacher.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Pick the first usable fee string like `$139 USD`.
 *
 * @param $ - Cheerio root
 * @param html - Raw HTML for regex fallback
 */
function extractFee($: cheerio.CheerioAPI, html: string): string {
  const amounts: string[] = [];
  $("span, p, div, strong, b, del").each((_, el) => {
    const text = cleanText($(el).text());
    const match = text.match(/\$\s*([\d,]+(?:\.\d{2})?)\s*USD/i);
    if (match?.[1]) amounts.push(match[1]);
  });
  if (amounts[0]) return `$${amounts[0]} USD`;

  const fallback = html.match(/\$\s*([\d,]+(?:\.\d{2})?)\s*USD/i);
  return fallback?.[1] ? `$${fallback[1]} USD` : "";
}

/**
 * Resolve primary enroll / buy URL when present.
 *
 * @param $ - Cheerio root
 */
function extractEnrollHref($: cheerio.CheerioAPI): string {
  const preferred: string[] = [];
  $("a[href*='onlinecourses.nirvanayogaschoolindia.com/enroll']").each(
    (_, el) => {
      const href = ($(el).attr("href") ?? "").split("#")[0];
      if (!href) return;
      if (href.includes("et=free_trial")) return;
      preferred.push(href);
    },
  );
  if (preferred[0]) return preferred[0];

  let trial = "";
  $("a[href*='onlinecourses.nirvanayogaschoolindia.com/enroll']").each(
    (_, el) => {
      const href = ($(el).attr("href") ?? "").split("#")[0];
      if (href && !trial) trial = href.replace(/\?et=free_trial$/, "");
    },
  );
  return trial;
}

/**
 * Resolve free-preview enroll URL when present.
 *
 * @param $ - Cheerio root
 * @param enrollHref - Primary enroll URL fallback
 */
function extractPreviewHref($: cheerio.CheerioAPI, enrollHref: string): string {
  let preview = "";
  $("a[href*='onlinecourses.nirvanayogaschoolindia.com/enroll']").each(
    (_, el) => {
      const href = $(el).attr("href") ?? "";
      const label = cleanText($(el).text()).toLowerCase();
      if (href.includes("et=free_trial") || label.includes("free preview")) {
        if (!preview) preview = href.split("#")[0] ?? href;
      }
    },
  );
  if (preview) return preview;
  if (!enrollHref) return "";
  return enrollHref.includes("?")
    ? `${enrollHref}&et=free_trial`
    : `${enrollHref}?et=free_trial`;
}

/**
 * Infer certification label from visible hero / overview text.
 *
 * @param $ - Cheerio root
 * @param overview - Overview text
 */
function extractCertification($: cheerio.CheerioAPI, overview: string): string {
  const heroBlob = cleanText($("h1").first().parent().text());
  if (/yoga alliance/i.test(heroBlob)) return "Yoga Alliance";
  if (/yacep/i.test(overview)) {
    return "YACEP, Yoga Alliance";
  }
  if (/ryt-?200/i.test(overview)) return "RYT-200, Yoga Alliance";
  if (/yoga alliance/i.test(overview)) return "Yoga Alliance";
  return "";
}

/**
 * Build a duration string from visible chips / copy.
 *
 * @param $ - Cheerio root
 * @param title - Course title
 */
function extractDuration($: cheerio.CheerioAPI, title: string): string {
  const body = cleanText($("body").text());
  if (/self[-\s]?paced/i.test(body)) return "Self-Paced";
  const hourMatch = title.match(/(\d+)\s*-?\s*Hour/i);
  return hourMatch ? `${hourMatch[1]} Hours` : "";
}

/**
 * Scrape one live online course page into an OnlineCourseDocument.
 *
 * @param url - Absolute course URL
 */
async function scrapeOnlineCourse(url: string): Promise<ScrapeResult> {
  const slug = slugFromUrl(url);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title =
    cleanText($("h1").first().text()) ||
    cleanText($("title").first().text()).replace(/\s*[|-].*$/, "");
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const overview = extractOverview($);
  const inclusions = extractInclusions($);
  const syllabus = extractSyllabus($);
  const faqs = extractFaqs($);
  const teachers = extractTeachers($, html);
  const fee = extractFee($, html);
  const enrollHref = extractEnrollHref($);
  const previewHref = extractPreviewHref($, enrollHref);
  const certification = extractCertification($, overview);
  const duration = extractDuration($, title);

  const bgMatch = html.match(
    /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/i,
  );
  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="og:image"]').attr("content") ||
    "";
  const image =
    absolutize(bgMatch?.[1]) ||
    absolutize(ogImage) ||
    absolutize($("h1").closest("section, div").find("img").first().attr("src"));

  const highlights = [
    /risk-free|money back/i.test(html) ? "14-Day Money Back Guarantee" : "",
    /self[-\s]?paced/i.test(html) ? "Self-Paced" : "",
    /lifetime access/i.test(html) ? "Lifetime Access" : "",
    /yoga alliance/i.test(html) ? "Yoga Alliance Certified" : "",
  ].filter(Boolean);

  const pricing: CoursePricingOption[] = fee
    ? [
        {
          roomType: "Full Online Course",
          price: fee,
          description: [
            duration ? `${duration}` : "",
            "one-time payment",
            /lifetime access/i.test(html) ? "lifetime access" : "",
          ]
            .filter(Boolean)
            .join(" · "),
          features: inclusions.slice(0, 6),
          image: image || undefined,
        },
      ]
    : [];

  const document: OnlineCourseDocument = {
    slug,
    title: title || slug,
    subtitle: metaDescription,
    level: "",
    duration,
    certification,
    fee,
    image,
    overview,
    highlights,
    syllabusDescription: "",
    syllabus,
    scheduleDescription: "",
    schedule: [],
    pricingDescription: "",
    pricing,
    inclusions,
    faqs,
    teachers,
    testimonials: [],
    ctaPrimary: enrollHref ? "Buy Now" : "Enquire Now",
    ctaPrimaryHref: enrollHref || "/enquire-now",
    ctaSecondary: previewHref ? "Free Preview" : "Enquire Now",
    ctaSecondaryHref: previewHref || "/enquire-now",
    navItems: [...DEFAULT_ONLINE_NAV],
  };

  return { slug, url, document };
}

/**
 * Merge scraped values into an existing document without overwriting filled fields.
 *
 * @param existing - Stored document
 * @param scraped - Fresh scrape
 */
function mergeOnlineDocuments(
  existing: OnlineCourseDocument,
  scraped: OnlineCourseDocument,
): { document: OnlineCourseDocument; changedFields: string[] } {
  const changedFields: string[] = [];
  const next: OnlineCourseDocument = structuredClone(existing);

  const fillString = (key: keyof OnlineCourseDocument) => {
    const current = next[key];
    const incoming = scraped[key];
    if (typeof current === "string" && typeof incoming === "string") {
      if (!current.trim() && incoming.trim()) {
        (next as Record<string, unknown>)[key as string] = incoming;
        changedFields.push(String(key));
      }
    }
  };

  const fillArray = (key: keyof OnlineCourseDocument) => {
    const current = next[key];
    const incoming = scraped[key];
    if (Array.isArray(current) && Array.isArray(incoming)) {
      if (current.length === 0 && incoming.length > 0) {
        (next as Record<string, unknown>)[key as string] = incoming;
        changedFields.push(String(key));
      }
    }
  };

  for (const key of [
    "title",
    "subtitle",
    "level",
    "duration",
    "certification",
    "fee",
    "image",
    "overview",
    "syllabusDescription",
    "scheduleDescription",
    "pricingDescription",
    "ctaPrimary",
    "ctaPrimaryHref",
    "ctaSecondary",
    "ctaSecondaryHref",
  ] as const) {
    fillString(key);
  }

  for (const key of [
    "highlights",
    "syllabus",
    "schedule",
    "pricing",
    "inclusions",
    "faqs",
    "teachers",
    "testimonials",
    "navItems",
  ] as const) {
    fillArray(key);
  }

  return { document: next, changedFields };
}

/**
 * Persist a scraped online course as pages + course_documents + page_modules.
 *
 * @param scraped - Scraped course payload
 * @param mode - create, convert site→online, or merge empty fields
 */
async function persistOnlineCourse(
  scraped: ScrapeResult,
  mode: "create" | "convert-site" | "merge-missing",
): Promise<string[]> {
  const modules = buildModulesFromOnlineCourse(scraped.document);
  const description =
    scraped.document.subtitle ||
    scraped.document.overview.split("\n\n")[0] ||
    "";

  if (mode === "create") {
    const page = await db.page.create({
      data: {
        slug: scraped.slug,
        type: "online",
        eyebrow: "Online Course",
        title: scraped.document.title,
        description,
        image: scraped.document.image,
        fee: scraped.document.fee,
        duration: scraped.document.duration,
        published: true,
        pageModules: modules,
      },
      select: { id: true },
    });
    await db.courseDocument.create({
      data: {
        pageId: page.id,
        document: scraped.document,
      },
    });
    return ["created"];
  }

  const page = await db.page.findUnique({
    where: { slug: scraped.slug },
    select: { id: true, pageModules: true, type: true },
  });
  if (!page) {
    throw new Error(`Missing page for ${mode}: ${scraped.slug}`);
  }

  const existingDocRow = await db.courseDocument.findFirst({
    where: { pageId: page.id },
    select: { pageId: true, document: true },
  });

  let document = scraped.document;
  let changedFields: string[] = ["document"];

  if (mode === "merge-missing" && existingDocRow?.document) {
    const merged = mergeOnlineDocuments(
      existingDocRow.document as OnlineCourseDocument,
      scraped.document,
    );
    document = merged.document;
    changedFields = merged.changedFields;
    if (changedFields.length === 0 && page.pageModules) {
      return [];
    }
  }

  const finalModules = buildModulesFromOnlineCourse(document);

  if (!existingDocRow) {
    await db.courseDocument.create({
      data: { pageId: page.id, document },
    });
  } else if (changedFields.length > 0) {
    await db.courseDocument.upsert({
      where: { pageId: page.id },
      create: { pageId: page.id, document },
      update: { document },
    });
  }

  const pageUpdate: Record<string, unknown> = {
    type: "online",
    eyebrow: "Online Course",
    published: true,
  };
  if (
    !page.pageModules ||
    mode === "convert-site" ||
    changedFields.length > 0
  ) {
    pageUpdate.pageModules = finalModules;
  }
  if (document.title) pageUpdate.title = document.title;
  if (description) pageUpdate.description = description;
  if (document.image) pageUpdate.image = document.image;
  if (document.fee) pageUpdate.fee = document.fee;
  if (document.duration) pageUpdate.duration = document.duration;

  await db.page.update({
    where: { id: page.id },
    data: pageUpdate,
  });

  return changedFields.length ? changedFields : ["page_modules"];
}

/**
 * Import all discoverable live online courses into Neon CMS.
 */
async function main() {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const before = await pool.query(
    `SELECT COUNT(*)::int AS count FROM pages WHERE type = 'online'`,
  );
  const beforeCount = before.rows[0]?.count ?? 0;
  console.log(`Online pages before: ${beforeCount}`);

  console.log("Discovering online course URLs…");
  const urls = await discoverOnlineCourseUrls();
  console.log(`Found ${urls.length} online course URL(s):`);
  for (const url of urls) console.log(`  - ${url}`);

  const report: ImportRow[] = [];

  for (const url of urls) {
    const slug = slugFromUrl(url);
    try {
      const existing = await db.page.findUnique({
        where: { slug },
        select: {
          id: true,
          type: true,
          published: true,
        },
      });

      console.log(`SCRAPE ${slug}`);
      const scraped = await scrapeOnlineCourse(url);

      if (!existing) {
        await persistOnlineCourse(scraped, "create");
        report.push({ slug, action: "created" });
        console.log(
          `CREATE ${slug} — ${scraped.document.title} (${scraped.document.fee || "no fee"})`,
        );
        continue;
      }

      if (existing.type === "online") {
        const changed = await persistOnlineCourse(scraped, "merge-missing");
        if (changed.length === 0) {
          report.push({
            slug,
            action: "skipped",
            reason: "online course already populated",
          });
          console.log(`SKIP  ${slug} (online course already populated)`);
        } else {
          report.push({
            slug,
            action: "updated",
            reason: `filled: ${changed.join(", ")}`,
          });
          console.log(`UPDATE ${slug} — filled ${changed.join(", ")}`);
        }
        continue;
      }

      if (existing.type === "site") {
        // Convert thin/mis-typed site stubs that match a live online course URL.
        const changed = await persistOnlineCourse(scraped, "convert-site");
        report.push({
          slug,
          action: "updated",
          reason: `converted site → online (${changed.join(", ")})`,
        });
        console.log(`CONVERT ${slug} site → online`);
        continue;
      }

      report.push({
        slug,
        action: "skipped",
        reason: `slug exists as type=${existing.type}`,
      });
      console.log(`SKIP  ${slug} (slug exists as type=${existing.type})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({ slug, action: "failed", reason: message });
      console.error(`FAIL  ${slug}: ${message}`);
    }
  }

  const after = await pool.query(
    `SELECT slug, title, published, fee, duration
     FROM pages WHERE type = 'online' ORDER BY slug`,
  );
  console.log(`\nOnline pages after: ${after.rows.length}`);
  for (const row of after.rows) {
    console.log(
      `  - ${row.slug} | published=${row.published} | fee=${row.fee || "—"} | ${row.title}`,
    );
  }

  const created = report.filter((r) => r.action === "created");
  const updated = report.filter((r) => r.action === "updated");
  const skipped = report.filter((r) => r.action === "skipped");
  const failed = report.filter((r) => r.action === "failed");

  console.log("\nSummary");
  console.log(`  created: ${created.map((r) => r.slug).join(", ") || "—"}`);
  console.log(`  updated: ${updated.map((r) => r.slug).join(", ") || "—"}`);
  console.log(`  skipped: ${skipped.map((r) => r.slug).join(", ") || "—"}`);
  console.log(
    `  failed:  ${
      failed.map((r) => `${r.slug} (${r.reason})`).join(", ") || "—"
    }`,
  );

  await pool.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
