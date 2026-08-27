/**
 * Flatten CMS `content_data` and `page_modules` into indexable text blocks
 * for Qdrant chat RAG.
 */

/** Keys that are media/URL fields — skip as body text. */
const SKIP_KEYS = new Set([
  "src",
  "image",
  "images",
  "heroImage",
  "backgroundImage",
  "previewUrl",
  "poster",
  "mobilePoster",
  "desktopPoster",
  "mobileSrc",
  "desktopSrc",
  "url",
  "youtubeUrls",
  "youtubeUrl",
  "cloudinaryUrl",
  "publicId",
  "thumbnailUrl",
  "ctaHref",
  "ctaPrimaryHref",
  "ctaSecondaryHref",
  "primaryHref",
  "secondaryHref",
  "redirectUrl",
  "_id",
  "id",
  "kind",
  "type",
  "iconKey",
  "live",
  "show",
  "mode",
  "category",
  "tone",
  "statusColor",
  "previewType",
  "clickAction",
]);

/**
 * Whether a string looks like a media URL rather than prose.
 *
 * @param value - Candidate string
 */
function isMediaLike(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.startsWith("http://") || v.startsWith("https://")) {
    if (
      /\.(jpg|jpeg|png|webp|gif|svg|mp4|webm)(\?|$)/i.test(v) ||
      /cloudinary|youtube|youtu\.be|vimeo/i.test(v)
    ) {
      return true;
    }
  }
  if (v.startsWith("/") && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(v)) {
    return true;
  }
  return false;
}

/**
 * Recursively collect meaningful string leaves from a JSON-ish value.
 *
 * @param value - Nested CMS value
 * @param out - Accumulator
 * @param depth - Recursion depth guard
 */
function collectStrings(value: unknown, out: string[], depth = 0): void {
  if (depth > 8 || value == null) return;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length >= 2 && !isMediaLike(trimmed)) {
      out.push(trimmed);
    }
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") return;
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (SKIP_KEYS.has(key)) continue;
      if (key === "href" && typeof child === "string") {
        const href = child.trim();
        // Keep tel/mailto/wa links — useful contact signals.
        if (
          href.startsWith("tel:") ||
          href.startsWith("mailto:") ||
          href.includes("wa.me") ||
          href.includes("whatsapp")
        ) {
          out.push(href);
        }
        continue;
      }
      collectStrings(child, out, depth + 1);
    }
  }
}

/**
 * Deduplicate strings while preserving order.
 *
 * @param values - Raw strings
 */
function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

export type ExtractedTextBlock = {
  /** Suffix for chunk key, e.g. `contact-details` or `modules-overview` */
  keySuffix: string;
  /** Chunk title suffix / label */
  label: string;
  /** Body text */
  content: string;
};

/**
 * Extract contact page details into a dedicated block (phones, email, etc.).
 *
 * @param contentData - `pages.content_data` for slug=contact
 */
function extractContactBlocks(
  contentData: Record<string, unknown>,
): ExtractedTextBlock[] {
  const blocks: ExtractedTextBlock[] = [];
  const hero = contentData.hero;
  if (hero && typeof hero === "object") {
    const h = hero as Record<string, unknown>;
    const parts = [h.eyebrow, h.title, h.lead]
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim());
    if (parts.length > 0) {
      blocks.push({
        keySuffix: "contact-hero",
        label: "Contact",
        content: parts.join("\n"),
      });
    }
  }

  const details = contentData.details;
  if (Array.isArray(details) && details.length > 0) {
    const lines: string[] = ["Contact details for Nirvana Yoga School:"];
    for (const item of details) {
      if (!item || typeof item !== "object") continue;
      const d = item as Record<string, unknown>;
      const title = typeof d.title === "string" ? d.title.trim() : "";
      const value = typeof d.value === "string" ? d.value.trim() : "";
      const href = typeof d.href === "string" ? d.href.trim() : "";
      const action =
        typeof d.actionText === "string" ? d.actionText.trim() : "";
      if (!title && !value) continue;
      const line = [title && `${title}:`, value, href && `(${href})`, action]
        .filter(Boolean)
        .join(" ");
      if (line.trim()) lines.push(line.trim());
    }
    if (lines.length > 1) {
      blocks.push({
        keySuffix: "contact-details",
        label: "Contact details",
        content: lines.join("\n"),
      });
    }
  }

  const form = contentData.form;
  if (form && typeof form === "object") {
    const f = form as Record<string, unknown>;
    const parts = [f.eyebrow, f.title, f.lead]
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim());
    if (parts.length > 0) {
      blocks.push({
        keySuffix: "contact-form",
        label: "Contact form",
        content: parts.join("\n"),
      });
    }
  }

  return blocks;
}

/**
 * Extract home / enquire / booking / generic content_data text blocks.
 *
 * @param contentData - Parsed content_data object
 */
function extractDedicatedBlocks(
  contentData: Record<string, unknown>,
): ExtractedTextBlock[] {
  const kind = typeof contentData.kind === "string" ? contentData.kind : "page";

  if (kind === "contact") {
    return extractContactBlocks(contentData);
  }

  const blocks: ExtractedTextBlock[] = [];

  if (kind === "enquire" || kind === "booking") {
    const hero = contentData.hero;
    if (hero && typeof hero === "object") {
      const strings: string[] = [];
      collectStrings(hero, strings);
      const content = unique(strings).join("\n");
      if (content.length >= 20) {
        blocks.push({
          keySuffix: `${kind}-hero`,
          label: kind === "booking" ? "Booking" : "Enquire",
          content,
        });
      }
    }
    const steps = contentData.steps;
    if (Array.isArray(steps) && steps.length > 0) {
      const strings: string[] = [];
      collectStrings(steps, strings);
      const content = unique(strings).join("\n");
      if (content.length >= 20) {
        blocks.push({
          keySuffix: `${kind}-steps`,
          label: `${kind === "booking" ? "Booking" : "Enquire"} steps`,
          content,
        });
      }
    }
    return blocks;
  }

  // Home and any other dedicated documents — section-level chunks.
  const sectionKeys = [
    "welcome",
    "whyRishikesh",
    "authenticYoga",
    "yogaAlliance",
    "teachersTeaser",
    "faqs",
    "finalCta",
    "hero",
  ] as const;

  for (const key of sectionKeys) {
    const section = contentData[key];
    if (!section || typeof section !== "object") continue;
    if (
      typeof section === "object" &&
      section !== null &&
      (section as { live?: boolean }).live === false
    ) {
      continue;
    }
    const strings: string[] = [];
    collectStrings(section, strings);
    const content = unique(strings).join("\n");
    if (content.length < 20) continue;
    blocks.push({
      keySuffix: `content-${key}`,
      label: key,
      content,
    });
  }

  // Fallback: whole document if nothing sectioned matched.
  if (blocks.length === 0) {
    const strings: string[] = [];
    collectStrings(contentData, strings);
    const content = unique(strings).join("\n");
    if (content.length >= 20) {
      blocks.push({
        keySuffix: "content-data",
        label: kind,
        content,
      });
    }
  }

  return blocks;
}

/**
 * Extract text blocks from `pages.content_data`.
 *
 * @param contentData - Raw JSON from DB
 */
export function extractContentDataBlocks(
  contentData: unknown,
): ExtractedTextBlock[] {
  if (!contentData || typeof contentData !== "object") return [];
  return extractDedicatedBlocks(contentData as Record<string, unknown>);
}

/**
 * Extract text blocks from live `page_modules` sections.
 *
 * @param pageModules - Raw JSON from DB
 */
export function extractPageModulesBlocks(
  pageModules: unknown,
): ExtractedTextBlock[] {
  if (!pageModules || typeof pageModules !== "object") return [];
  const modules = pageModules as Record<string, unknown>;
  const blocks: ExtractedTextBlock[] = [];

  const moduleKeys = [
    "hero",
    "overview",
    "inclusions",
    "eligibility",
    "syllabus",
    "schedule",
    "pricing",
    "faqs",
    "programs",
    "gallery",
    "videos",
    "residentialLife",
    "retreatAccommodation",
  ] as const;

  for (const key of moduleKeys) {
    const mod = modules[key];
    if (!mod || typeof mod !== "object") continue;
    if ((mod as { live?: boolean }).live === false) continue;

    if (key === "faqs") {
      const items = (mod as { items?: unknown }).items;
      if (!Array.isArray(items)) continue;
      for (const [index, item] of items.entries()) {
        if (!item || typeof item !== "object") continue;
        const faq = item as Record<string, unknown>;
        const question =
          typeof faq.question === "string" ? faq.question.trim() : "";
        const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";
        if (!question || !answer) continue;
        blocks.push({
          keySuffix: `modules-faq-${index}`,
          label: "FAQ",
          content: `Q: ${question}\nA: ${answer}`,
        });
      }
      continue;
    }

    const strings: string[] = [];
    collectStrings(mod, strings);
    const content = unique(strings).join("\n");
    if (content.length < 20) continue;
    blocks.push({
      keySuffix: `modules-${key}`,
      label: key === "residentialLife" ? "Residential life" : key,
      content,
    });
  }

  return blocks;
}

/** JSON string-array fields on `page_people`. */
function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Flatten a faculty profile (`page_people` row) into one indexable text block.
 *
 * @param person - Teacher row fields
 */
export function extractTeacherProfileBlock(person: {
  name: string;
  summary?: string | null;
  bio?: string | null;
  education?: unknown;
  experience?: unknown;
  expertise?: unknown;
}): ExtractedTextBlock | null {
  const name = person.name.trim();
  if (!name) return null;

  const parts = [
    `Teacher: ${name}`,
    person.summary?.trim() ? `Summary: ${person.summary.trim()}` : "",
    person.bio?.trim() ? `Bio: ${person.bio.trim()}` : "",
  ];
  const education = asStringList(person.education);
  const experience = asStringList(person.experience);
  const expertise = asStringList(person.expertise);
  if (education.length) parts.push(`Education: ${education.join("; ")}`);
  if (experience.length) parts.push(`Experience: ${experience.join("; ")}`);
  if (expertise.length) parts.push(`Expertise: ${expertise.join("; ")}`);

  const content = unique(parts.filter(Boolean)).join("\n");
  if (content.length < 20) return null;
  return {
    keySuffix: "profile",
    label: name,
    content,
  };
}

/** Global settings keys worth indexing for chat RAG (skip nav/media noise). */
export const INDEXABLE_GLOBAL_SETTING_KEYS = [
  "siteConfig",
  "footer",
  "whyNirvana",
  "travel",
  "residentialLife",
  "reviews",
  "homeFaqs",
  "venueFaqs",
  "examCertification",
] as const;

export type IndexableGlobalSettingKey =
  (typeof INDEXABLE_GLOBAL_SETTING_KEYS)[number];

/**
 * Extract indexable blocks from a `global_settings` row.
 *
 * @param key - Settings key
 * @param value - JSON value
 */
export function extractGlobalSettingBlocks(
  key: string,
  value: unknown,
): ExtractedTextBlock[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (record.live === false) return [];

  if (key === "siteConfig") {
    const lines = [
      typeof record.siteName === "string" ? `Site: ${record.siteName}` : "",
      typeof record.contactEmail === "string"
        ? `Email: ${record.contactEmail}`
        : "",
      typeof record.contactPhone === "string"
        ? `Phone: ${record.contactPhone}`
        : "",
      typeof record.whatsappNumber === "string"
        ? `WhatsApp: ${record.whatsappNumber}`
        : "",
      typeof record.address === "string" ? `Address: ${record.address}` : "",
      record.defaultSeo &&
      typeof record.defaultSeo === "object" &&
      typeof (record.defaultSeo as { description?: unknown }).description ===
        "string"
        ? String((record.defaultSeo as { description: string }).description)
        : "",
    ].filter(Boolean);
    const content = lines.join("\n");
    if (content.length < 20) return [];
    return [
      {
        keySuffix: "site-config",
        label: "Site contact",
        content,
      },
    ];
  }

  if (key === "footer") {
    const contact =
      record.contact && typeof record.contact === "object"
        ? (record.contact as Record<string, unknown>)
        : null;
    const brand =
      record.brand && typeof record.brand === "object"
        ? (record.brand as Record<string, unknown>)
        : null;
    const lines = [
      brand && typeof brand.tagline === "string" ? brand.tagline.trim() : "",
      brand && typeof brand.credentials === "string"
        ? brand.credentials.trim()
        : "",
      contact && typeof contact.address === "string"
        ? `Address: ${contact.address}`
        : "",
      contact && typeof contact.email === "string"
        ? `Email: ${contact.email}`
        : "",
      contact && typeof contact.phone === "string"
        ? `Phone: ${contact.phone}`
        : "",
    ].filter(Boolean);

    if (Array.isArray(record.social)) {
      for (const item of record.social) {
        if (!item || typeof item !== "object") continue;
        const s = item as Record<string, unknown>;
        const label = typeof s.label === "string" ? s.label.trim() : "";
        const href = typeof s.href === "string" ? s.href.trim() : "";
        if (label && href) lines.push(`${label}: ${href}`);
      }
    }

    const content = lines.join("\n");
    if (content.length < 20) return [];
    return [
      {
        keySuffix: "footer-contact",
        label: "Footer contact",
        content,
      },
    ];
  }

  if (key === "homeFaqs" || key === "venueFaqs") {
    const faqs = Array.isArray(record.faqs) ? record.faqs : [];
    const blocks: ExtractedTextBlock[] = [];
    for (const [index, item] of faqs.entries()) {
      if (!item || typeof item !== "object") continue;
      const faq = item as Record<string, unknown>;
      const question =
        typeof faq.question === "string" ? faq.question.trim() : "";
      const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";
      if (!question || !answer) continue;
      blocks.push({
        keySuffix: `faq-${index}`,
        label: "FAQ",
        content: `Q: ${question}\nA: ${answer}`,
      });
    }
    return blocks;
  }

  if (key === "reviews") {
    const reviews = Array.isArray(record.reviews) ? record.reviews : [];
    const lines: string[] = [];
    // Keep reviews short — index a sample for tone / proof, not every essay.
    for (const item of reviews.slice(0, 12)) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      const name = typeof r.name === "string" ? r.name.trim() : "";
      const title = typeof r.title === "string" ? r.title.trim() : "";
      const message = typeof r.message === "string" ? r.message.trim() : "";
      const source = typeof r.source === "string" ? r.source.trim() : "";
      if (!message) continue;
      const head = [name, title, source && `(${source})`]
        .filter(Boolean)
        .join(" — ");
      lines.push(head ? `${head}: ${message}` : message);
    }
    const content = lines.join("\n");
    if (content.length < 20) return [];
    return [
      {
        keySuffix: "reviews",
        label: "Student reviews",
        content,
      },
    ];
  }

  // whyNirvana, travel, residentialLife, examCertification — generic flatten.
  const strings: string[] = [];
  collectStrings(record, strings);
  const content = unique(strings).join("\n");
  if (content.length < 20) return [];
  const labels: Record<string, string> = {
    whyNirvana: "Why Nirvana",
    travel: "Travel guide",
    residentialLife: "Residential life",
    examCertification: "Exam & certification",
  };
  return [
    {
      keySuffix: "content",
      label: labels[key] ?? key,
      content,
    },
  ];
}
