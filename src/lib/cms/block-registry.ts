/** CMS block type definitions — maps to frontend SectionContentBlock. */

export type BlockFieldType =
  | "text"
  | "textarea"
  | "url"
  | "select"
  | "boolean"
  | "string-list";

export type BlockFieldDef = {
  key: string;
  label: string;
  type: BlockFieldType;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** When true, URL field shows a live image preview beside the input. */
  showImagePreview?: boolean;
};

export type BlockTypeDef = {
  type: string;
  label: string;
  description: string;
  fields: BlockFieldDef[];
  create: () => Record<string, unknown>;
};

export const BLOCK_TYPE_DEFS: BlockTypeDef[] = [
  {
    type: "paragraph",
    label: "Paragraph",
    description: "Standard body copy. Use a blank line between paragraphs.",
    fields: [
      {
        key: "text",
        label: "Paragraph text",
        type: "textarea",
        hint: "Main descriptive copy for this part of the section.",
      },
    ],
    create: () => ({ type: "paragraph", text: "" }),
  },
  {
    type: "lead",
    label: "Lead paragraph",
    description: "Intro or emphasis text — rendered larger on the page.",
    fields: [
      {
        key: "text",
        label: "Lead text",
        type: "textarea",
        hint: "Opening sentence or summary for the section.",
      },
    ],
    create: () => ({ type: "lead", text: "" }),
  },
  {
    type: "bullets",
    label: "Bullet list",
    description: "Checklist or feature list with check icons.",
    fields: [
      {
        key: "items",
        label: "List items",
        type: "string-list",
        hint: "One bullet per line — e.g. duration, certification, fee.",
      },
    ],
    create: () => ({ type: "bullets", items: [] }),
  },
  {
    type: "faq",
    label: "FAQ accordion",
    description: "Question and answer pairs — renders as expandable accordion.",
    fields: [],
    create: () => ({ type: "faq", items: [{ question: "", answer: "" }] }),
  },
  {
    type: "cta",
    label: "CTA button",
    description:
      "Call-to-action button linking to a course, form, or external URL.",
    fields: [
      {
        key: "label",
        label: "Button label",
        type: "text",
        placeholder: "Book now",
      },
      {
        key: "href",
        label: "Link URL",
        type: "url",
        placeholder: "/contact or https://…",
      },
      {
        key: "variant",
        label: "Button style",
        type: "select",
        options: [
          { value: "primary", label: "Primary (maroon)" },
          { value: "secondary", label: "Secondary (dark)" },
          { value: "outline", label: "Outline" },
        ],
      },
      { key: "openInNewTab", label: "Open in new tab", type: "boolean" },
    ],
    create: () => ({
      type: "cta",
      label: "",
      href: "",
      variant: "primary",
      openInNewTab: false,
    }),
  },
  {
    type: "image",
    label: "Single image",
    description: "One image with optional alt text and caption.",
    fields: [
      { key: "url", label: "Image URL", type: "url", showImagePreview: true },
      {
        key: "alt",
        label: "Alt text",
        type: "text",
        hint: "Accessibility description.",
      },
      { key: "caption", label: "Caption", type: "text" },
    ],
    create: () => ({ type: "image", url: "", alt: "", caption: "" }),
  },
  {
    type: "gallery",
    label: "Image gallery",
    description:
      "Multiple images — carousel on SimplePage, grid on course pages.",
    fields: [
      {
        key: "urls",
        label: "Image URLs",
        type: "string-list",
        hint: "Add each gallery image URL.",
      },
    ],
    create: () => ({ type: "gallery", urls: [] }),
  },
  {
    type: "subsection",
    label: "Subsection card",
    description: "Nested card with title, copy, and optional bullets.",
    fields: [
      { key: "title", label: "Card title", type: "text" },
      { key: "paragraph", label: "Card description", type: "textarea" },
      {
        key: "imageUrl",
        label: "Card image URL",
        type: "url",
        showImagePreview: true,
      },
      { key: "bullets", label: "Bullet points", type: "string-list" },
    ],
    create: () => ({
      type: "subsection",
      title: "",
      paragraph: "",
      imageUrl: "",
      bullets: [],
    }),
  },
  {
    type: "video",
    label: "Video embed",
    description: "YouTube URL or video ID.",
    fields: [
      { key: "url", label: "YouTube URL or ID", type: "url" },
      { key: "caption", label: "Caption", type: "text" },
    ],
    create: () => ({ type: "video", url: "", caption: "" }),
  },
];

export function getBlockDef(type: string): BlockTypeDef | undefined {
  return BLOCK_TYPE_DEFS.find((d) => d.type === type);
}
