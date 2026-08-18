import DOMPurify from "isomorphic-dompurify";

type BlogHtmlContentProps = {
  html: string;
  className?: string;
};

/**
 * Render sanitized blog HTML from the CMS rich-text editor.
 *
 * @param props - HTML string and optional wrapper class
 */
export function BlogHtmlContent({ html, className }: BlogHtmlContentProps) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "loading", "class"],
  });

  if (!sanitized.trim()) return null;

  return (
    <div
      className={className ?? "prose-blog space-y-5"}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
