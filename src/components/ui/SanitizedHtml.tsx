import DOMPurify from "isomorphic-dompurify";
import { resolveInlineRichTextHtml } from "@/lib/cms/blog-html";

const DEFAULT_INLINE_TAGS = ["p", "br", "strong", "b", "em", "i", "u"];
const DEFAULT_LINK_ATTRS = ["href", "target", "rel"];

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
  const tags = allowLinks ? [...allowedTags, "a"] : allowedTags;
  const sanitized = DOMPurify.sanitize(resolved, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR: allowLinks ? DEFAULT_LINK_ATTRS : [],
  });

  if (!sanitized.trim()) return null;

  const mergedClassName = ["cms-inline-rich", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={mergedClassName}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
