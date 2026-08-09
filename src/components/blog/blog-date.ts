/**
 * Formats a CMS publication date for journal surfaces.
 *
 * @param value - ISO publication date from the CMS
 */
export function formatBlogPublishedDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
