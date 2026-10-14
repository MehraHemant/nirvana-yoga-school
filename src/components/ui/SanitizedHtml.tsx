import { resolveInlineRichTextHtml } from "@/lib/cms/blog-html";
import { sanitizeInlineRichHtml } from "@/lib/html-sanitize";

const DEFAULT_INLINE_TAGS = ["p", "br", "strong", "b", "em", "i", "u"];

type SanitizedHtmlProps = {
  html: string;
  className?: string;
  allowedTags?: string[];
  /** When true, allows `<a>` tags with href, target, and rel */
  allowLinks?: boolean;
};

/**
 * Render sanitized inline HTML from CMS rich-text fields.
 *
 * @param props - HTML string, optional wrapper class, and allowed tags
 */
export function SanitizedHtml({
  html,
  className,
  allowedTags = DEFAULT_INLINE_TAGS,
  allowLinks = false,
}: SanitizedHtmlProps) {
  const resolved = resolveInlineRichTextHtml(html);
  const sanitized = sanitizeInlineRichHtml(resolved, {
    allowedTags,
    allowLinks,
  });

  if (!sanitized.trim()) return null;

  const mergedClassName = ["cms-inline-rich", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={mergedClassName}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via html-sanitize
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
