import sanitizeHtml from "sanitize-html";

const INLINE_TAGS = ["p", "br", "strong", "b", "em", "i", "u"];
const LINK_ATTRS: Record<string, sanitizeHtml.AllowedAttribute[]> = {
  a: ["href", "target", "rel"],
};

const BLOG_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "blockquote",
  "br",
  "img",
];

const BLOG_ATTRS: Record<string, sanitizeHtml.AllowedAttribute[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "loading", "class"],
};

type SanitizeInlineOptions = {
  allowedTags?: string[];
  /** When true, allows `<a>` tags with href, target, and rel */
  allowLinks?: boolean;
};

/**
 * Sanitize CMS inline rich text without a DOM (safe for RSC / Edge).
 *
 * @param html - Raw HTML from CMS
 * @param options - Tag allowlist and optional link attributes
 */
export function sanitizeInlineRichHtml(
  html: string,
  options: SanitizeInlineOptions = {},
): string {
  const { allowedTags = INLINE_TAGS, allowLinks = false } = options;
  const tags = allowLinks ? [...allowedTags, "a"] : allowedTags;

  return sanitizeHtml(html, {
    allowedTags: tags,
    allowedAttributes: allowLinks ? LINK_ATTRS : {},
  });
}

/**
 * Sanitize blog body HTML from the CMS rich-text editor.
 *
 * @param html - Raw blog HTML
 */
export function sanitizeBlogBodyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: BLOG_TAGS,
    allowedAttributes: BLOG_ATTRS,
  });
}
