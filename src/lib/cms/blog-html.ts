import type { BlogContentBlock } from "@/content/types";

/**
 * Detect whether a string contains HTML markup.
 *
 * @param text - Raw CMS field value
 */
export function containsHtmlMarkup(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

/**
 * Escape plain text for safe HTML insertion when migrating legacy blocks.
 *
 * @param text - Raw block text
 * @returns HTML-escaped string
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert legacy structured blog blocks into HTML for the rich-text editor.
 *
 * @param blocks - Legacy content blocks from JSON seed or CMS
 * @returns HTML string suitable for Tiptap
 */
export function blogBlocksToHtml(blocks: BlogContentBlock[]): string {
  return blocks
    .filter((block) => block.type !== "date")
    .map((block) => {
      if (block.type === "heading") {
        return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
      }
      if (block.type === "list") {
        const items = block.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (block.type === "paragraph") {
        return `<p>${escapeHtml(block.text)}</p>`;
      }
      return "";
    })
    .join("");
}

/**
 * Resolve the HTML body for editing or rendering.
 *
 * @param bodyHtml - Stored rich-text HTML, if any
 * @param blocks - Legacy block content fallback
 * @returns HTML string (may be empty)
 */
export function resolveBlogBodyHtml(
  bodyHtml: string | null | undefined,
  blocks: BlogContentBlock[],
): string {
  if (bodyHtml?.trim()) return bodyHtml;
  return blogBlocksToHtml(blocks);
}

/**
 * Convert plain text (with optional line breaks) into paragraph HTML.
 *
 * @param text - Plain text CMS value
 * @returns HTML with `p` and `br` tags only
 */
export function plainTextToParagraphHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const inner = escapeHtml(paragraph).replace(/\n/g, "<br>");
      return `<p>${inner}</p>`;
    })
    .join("");
}

/**
 * Resolve inline rich text for rendering — keep HTML or upgrade legacy plain text.
 *
 * @param text - Stored CMS value (plain text or HTML)
 */
export function resolveInlineRichTextHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (containsHtmlMarkup(trimmed)) return trimmed;
  return plainTextToParagraphHtml(trimmed);
}

/**
 * Normalize a CMS value for the TipTap editor (plain text → paragraph HTML).
 *
 * @param text - Stored CMS value (plain text or HTML)
 */
export function resolveEditorHtml(text: string): string {
  if (!text.trim()) return "<p></p>";
  if (containsHtmlMarkup(text)) return text;
  return plainTextToParagraphHtml(text) || "<p></p>";
}

/**
 * Strip HTML tags to plain text (for previews or meta fallbacks).
 *
 * @param html - HTML string
 * @returns Plain text without tags
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
