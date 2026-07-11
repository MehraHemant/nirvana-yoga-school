import type { BlogContentBlock } from "@/content/types";

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
