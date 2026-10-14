import { sanitizeBlogBodyHtml } from "@/lib/html-sanitize";

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
  const sanitized = sanitizeBlogBodyHtml(html);

  if (!sanitized.trim()) return null;

  return (
    <div
      className={className ?? "prose-blog space-y-5"}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via html-sanitize
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
