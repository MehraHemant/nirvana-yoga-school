/**
 * System content types (page components) scoped to page kinds.
 * Used by seed + Sync system types.
 *
 * Types are unified and reusable — one `Hero`, one `FAQ`, etc. shared across
 * every page kind. Pages store only their own field values (content_data),
 * referencing a type by key.
 */

import type { ContentFieldDefinition } from "@/content/types/content-schema";

/** CMS page kinds that match Neon `PageType` (except blog). */
export type CmsPageKind = "course" | "online" | "retreat" | "venue" | "site";

/** Human labels for page kinds in admin UI. */
export const CMS_PAGE_KIND_LABELS: Record<CmsPageKind, string> = {
  course: "Course",
  online: "Online course",
  retreat: "Retreat",
  venue: "Venue",
  site: "Site page",
};

/** Ordered page kinds for filters and badges. */
export const CMS_PAGE_KINDS: CmsPageKind[] = [
  "course",
  "online",
  "retreat",
  "venue",
  "site",
];

/** Every page kind — used for reusable components available everywhere. */
const ALL_KINDS: CmsPageKind[] = [...CMS_PAGE_KINDS];

export type DefaultContentTypeDef = {
  key: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  /**
   * `global` = site chrome (header/footer) — edited once, rendered from layout.
   * Never seeded as a page section. Default `page`.
   */
  scope?: "global" | "page";
  /** Page kinds this component applies to (empty when scope is global) */
  pageTypes: CmsPageKind[];
  fields: ContentFieldDefinition[];
};

const HERO_FIELDS: ContentFieldDefinition[] = [
  { key: "eyebrow", label: "Eyebrow", type: "text" },
  { key: "headline", label: "Headline", type: "text", required: true },
  { key: "summary", label: "Summary", type: "textarea" },
  { key: "hero_image", label: "Hero image", type: "image" },
  { key: "cta_label", label: "CTA label", type: "text" },
  { key: "cta_href", label: "CTA link", type: "text" },
  { key: "duration", label: "Duration", type: "text" },
  { key: "level", label: "Level", type: "text" },
  { key: "certification", label: "Certification", type: "text" },
  { key: "fee", label: "Fee", type: "text" },
  { key: "location", label: "Location", type: "text" },
];

const RICH_TEXT_FIELDS: ContentFieldDefinition[] = [
  { key: "eyebrow", label: "Eyebrow", type: "text" },
  { key: "title", label: "Title", type: "text", required: true },
  { key: "lead", label: "Lead", type: "textarea" },
  { key: "body", label: "Body", type: "richtext", required: true },
  { key: "image", label: "Side image", type: "image" },
  { key: "cta_label", label: "CTA label", type: "text" },
  { key: "cta_href", label: "CTA link", type: "text" },
];

/**
 * Built-in component content types — filtered on the page editor by page type.
 * Global components (header / footer / navigation) are excluded from page
 * sections. All page components are reusable across every page kind.
 */
export const DEFAULT_CONTENT_TYPES: DefaultContentTypeDef[] = [
  // —— Page container (routable item that links section components) ——
  {
    key: "page",
    name: "Page",
    description:
      "A routable page — SEO meta plus an ordered list of section components linked in.",
    icon: "page",
    sortOrder: 5,
    // Empty pageTypes → never offered as a section inside another page.
    pageTypes: [],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Meta description", type: "textarea" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "image", label: "Social / hero image", type: "image" },
      { key: "cta_label", label: "CTA label", type: "text" },
      { key: "cta_href", label: "CTA link", type: "text" },
      {
        key: "sections",
        label: "Sections",
        type: "reference",
        multiple: true,
        help: "Ordered section components rendered on this page.",
      },
    ],
  },

  // —— Global site chrome (layout only — not page sections) ——
  {
    key: "site_header",
    name: "Site · Header",
    description:
      "Global site header on every page — logos and ordered CTAs (Sign in, Enquire now). Rendered from the site layout.",
    icon: "header",
    sortOrder: 10,
    scope: "global",
    pageTypes: [],
    fields: [
      {
        key: "logo_light",
        label: "Logo (light backgrounds)",
        type: "image",
        required: true,
        defaultValue: "/logo.png",
        help: "Shown when the header is solid / over light content",
      },
      {
        key: "logo_dark",
        label: "Logo (dark / transparent)",
        type: "image",
        required: true,
        defaultValue: "/logo_white.png",
        help: "Shown over the home hero video",
      },
      {
        key: "logo_light_alt",
        label: "Light logo alt text",
        type: "text",
        defaultValue: "Nirvana Yoga School",
      },
      {
        key: "logo_dark_alt",
        label: "Dark logo alt text",
        type: "text",
        defaultValue: "Nirvana Yoga School",
      },
      {
        key: "logo_href",
        label: "Logo destination",
        type: "text",
        defaultValue: "/",
        help: "Internal path or full HTTPS URL used by both logo variants.",
      },
      {
        key: "ctas",
        label: "Header CTAs",
        type: "repeater",
        help: "Ordered actions (Sign in, Enquire now, custom). Drag in Header & Navigation admin to reorder.",
        subFields: [
          { key: "label", label: "Label", type: "text", required: true },
          { key: "href", label: "Link", type: "text", required: true },
          {
            key: "variant",
            label: "Style",
            type: "dropdown",
            defaultValue: "primary",
            options: [
              { value: "link", label: "Text link" },
              { value: "primary", label: "Primary (maroon)" },
              { value: "secondary", label: "Secondary (ink)" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "site_navigation",
    name: "Site · Navigation",
    description:
      "Primary menu — edited with Header & Navigation (logos, CTA, and menu together).",
    icon: "nav",
    sortOrder: 15,
    scope: "global",
    pageTypes: [],
    fields: [
      {
        key: "notes",
        label: "Editor notes",
        type: "textarea",
        help: "Optional internal notes. Open Header & Nav to edit the live menu.",
      },
    ],
  },
  {
    key: "site_footer",
    name: "Site · Footer",
    description:
      "Global footer on every page — brand, social, contact, and columns.",
    icon: "footer",
    sortOrder: 20,
    scope: "global",
    pageTypes: [],
    fields: [
      {
        key: "brand_logo",
        label: "Brand logo",
        type: "image",
        defaultValue: "/logo.png",
      },
      {
        key: "brand_tagline",
        label: "Tagline",
        type: "textarea",
        required: true,
      },
      {
        key: "brand_credentials",
        label: "Credentials line",
        type: "text",
        defaultValue: "Yoga Alliance RYS · Tapovan, Rishikesh",
      },
      {
        key: "contact_address",
        label: "Address",
        type: "textarea",
        required: true,
      },
      { key: "contact_email", label: "Email", type: "text", required: true },
      { key: "contact_phone", label: "Phone", type: "text", required: true },
      {
        key: "social_instagram",
        label: "Instagram URL",
        type: "text",
      },
      {
        key: "social_youtube",
        label: "YouTube URL",
        type: "text",
      },
      {
        key: "social_facebook",
        label: "Facebook URL",
        type: "text",
      },
      {
        key: "social_whatsapp",
        label: "WhatsApp URL",
        type: "text",
        help: "e.g. https://wa.me/918218564835",
      },
      {
        key: "column_programs",
        label: "Programs column links",
        type: "textarea",
        help: "One per line: Label | /path",
      },
      {
        key: "column_school",
        label: "School column links",
        type: "textarea",
        help: "One per line: Label | /path",
      },
      {
        key: "column_visit",
        label: "Visit column links",
        type: "textarea",
        help: "One per line: Label | /path (booking, student login, etc.)",
      },
      {
        key: "legal_links",
        label: "Legal links",
        type: "textarea",
        help: "One per line: Label | /path",
      },
    ],
  },

  // —— Reusable page sections (shared across every page kind) ——
  {
    key: "hero",
    name: "Hero",
    description:
      "Page hero — headline, summary, media, CTA, and optional meta (duration, level, fee, location).",
    icon: "hero",
    sortOrder: 100,
    pageTypes: ALL_KINDS,
    fields: HERO_FIELDS,
  },
  {
    key: "rich_text",
    name: "Rich text section",
    description:
      "Free editorial section — title, body, optional image and CTA. Use for syllabus, schedule, eligibility, curriculum, etc.",
    icon: "text",
    sortOrder: 120,
    pageTypes: ALL_KINDS,
    fields: RICH_TEXT_FIELDS,
  },
  {
    key: "feature_list",
    name: "Feature list",
    description: "A list of items you add row by row (label + optional note).",
    icon: "list",
    sortOrder: 130,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "intro", label: "Intro", type: "textarea" },
      {
        key: "items",
        label: "Items",
        type: "repeater",
        help: "Add a row per item",
        subFields: [
          { key: "text", label: "Item", type: "text" },
          { key: "note", label: "Note", type: "text" },
        ],
      },
    ],
  },
  {
    key: "checklist",
    name: "Included / excluded",
    description: "What’s included and not included (one item per line).",
    icon: "list",
    sortOrder: 140,
    pageTypes: ALL_KINDS,
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        defaultValue: "What’s included",
      },
      {
        key: "includes",
        label: "Included items",
        type: "textarea",
        help: "One item per line",
      },
      {
        key: "excludes",
        label: "Not included",
        type: "textarea",
        help: "One item per line",
      },
      {
        key: "items",
        label: "Items (generic)",
        type: "textarea",
        help: "One item per line — used when Included is empty",
      },
      { key: "body", label: "Extra notes", type: "richtext" },
    ],
  },
  {
    key: "gallery",
    name: "Gallery",
    description:
      "Image gallery — add a row per image with an optional caption.",
    icon: "gallery",
    sortOrder: 150,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "images",
        label: "Images",
        type: "repeater",
        help: "Add a row per image",
        subFields: [
          { key: "image", label: "Image", type: "image" },
          { key: "caption", label: "Caption", type: "text" },
        ],
      },
    ],
  },
  {
    key: "cards",
    name: "Cards",
    description:
      "A grid of cards — add a row per card (image, title, text, link).",
    icon: "cards",
    sortOrder: 160,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      {
        key: "cards",
        label: "Cards",
        type: "repeater",
        help: "Add a row per card",
        subFields: [
          { key: "image", label: "Image", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
          { key: "cta_label", label: "Link label", type: "text" },
          { key: "cta_href", label: "Link URL", type: "text" },
        ],
      },
    ],
  },
  {
    key: "pricing_table",
    name: "Pricing table",
    description:
      "Plans compared side by side — add a row per plan (name, price, note, button).",
    icon: "pricing",
    sortOrder: 180,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "title", label: "Title", type: "text", defaultValue: "Pricing" },
      {
        key: "plans",
        label: "Plans",
        type: "repeater",
        help: "Add a row per plan",
        subFields: [
          { key: "name", label: "Plan", type: "text" },
          { key: "price", label: "Price", type: "text" },
          { key: "note", label: "Note", type: "text" },
          { key: "cta_label", label: "Button label", type: "text" },
          { key: "cta_href", label: "Button link", type: "text" },
        ],
      },
    ],
  },
  {
    key: "faq",
    name: "FAQ",
    description:
      "Frequently asked questions — add a row per question, or use rich text.",
    icon: "faq",
    sortOrder: 190,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", defaultValue: "FAQ" },
      {
        key: "title",
        label: "Title",
        type: "text",
        defaultValue: "Frequently asked questions",
      },
      {
        key: "items",
        label: "Questions",
        type: "repeater",
        help: "Add a row per question",
        subFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
      {
        key: "body",
        label: "FAQ content (alternative to rows)",
        type: "richtext",
        help: "Optional — use headings for questions if you prefer rich text over rows.",
      },
    ],
  },
  {
    key: "contact",
    name: "Contact",
    description: "Contact details block — email, phone, WhatsApp, address.",
    icon: "contact",
    sortOrder: 200,
    pageTypes: ALL_KINDS,
    fields: [
      {
        key: "headline",
        label: "Headline",
        type: "text",
        defaultValue: "Get in touch",
      },
      { key: "summary", label: "Intro", type: "textarea" },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "whatsapp", label: "WhatsApp", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "hours", label: "Hours", type: "text" },
      { key: "body", label: "Notes", type: "richtext" },
    ],
  },
  {
    key: "about",
    name: "About story",
    description: "Mission, vision, and school story with a feature image.",
    icon: "about",
    sortOrder: 210,
    pageTypes: ALL_KINDS,
    fields: [
      { key: "headline", label: "Headline", type: "text", required: true },
      { key: "summary", label: "Lead", type: "textarea" },
      { key: "mission", label: "Mission", type: "textarea" },
      { key: "vision", label: "Vision", type: "textarea" },
      { key: "body", label: "Our story", type: "richtext" },
      { key: "portrait_image", label: "Feature image", type: "image" },
    ],
  },
];

/**
 * Maps legacy per-kind content-type keys onto the unified reusable keys.
 * Field keys are preserved, so remapping is a safe rename of a page block’s
 * `typeKey` (no data reshaping).
 */
export const LEGACY_TYPE_REMAP: Record<string, string> = {
  course_hero: "hero",
  online_hero: "hero",
  retreat_hero: "hero",
  venue_hero: "hero",
  site_hero: "hero",
  // `overview` / `pricing` were merged into `rich_text` / `pricing_table`.
  overview: "rich_text",
  course_overview: "rich_text",
  online_overview: "rich_text",
  retreat_overview: "rich_text",
  venue_overview: "rich_text",
  course_syllabus: "rich_text",
  course_schedule: "rich_text",
  course_eligibility: "rich_text",
  online_curriculum: "rich_text",
  retreat_packages: "rich_text",
  retreat_schedule: "rich_text",
  site_body: "rich_text",
  course_faq: "faq",
  online_faq: "faq",
  retreat_faq: "faq",
  site_faq: "faq",
  pricing: "pricing_table",
  course_pricing: "pricing_table",
  online_pricing: "pricing_table",
  course_inclusions: "checklist",
  venue_amenities: "checklist",
  site_contact: "contact",
  site_about: "about",
};

/**
 * Labels for page-kind filters in the admin.
 */
export const PAGE_KIND_LABELS: Record<CmsPageKind | "all" | "blog", string> = {
  all: "All pages",
  course: "Course",
  online: "Online course",
  retreat: "Retreat",
  venue: "Venue",
  site: "Site",
  blog: "Blog",
};

/**
 * Content type keys that should be auto-added when opening a page of this kind.
 * Global components (empty pageTypes) are never included.
 */
export function defaultBlocksForPageKind(kind: CmsPageKind): string[] {
  return DEFAULT_CONTENT_TYPES.filter(
    (t) => (t.scope ?? "page") === "page" && t.pageTypes.includes(kind),
  ).map((t) => t.key);
}

/**
 * Global (layout) content type keys — not editable as page sections.
 */
export function isGlobalContentTypeKey(key: string): boolean {
  const def = DEFAULT_CONTENT_TYPES.find((t) => t.key === key);
  return (
    def?.scope === "global" ||
    key === "site_header" ||
    key === "site_footer" ||
    key === "site_navigation"
  );
}

/**
 * Admin editor URLs for global layout components.
 */
export const GLOBAL_COMPONENT_EDIT_HREF: Record<string, string> = {
  site_header: "/admin/components/header",
  site_footer: "/admin/components/footer",
  site_navigation: "/admin/components/header#navigation",
};
