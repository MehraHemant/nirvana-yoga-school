/**
 * Keeps post-login redirects on this site.
 *
 * @param value - Raw `next` query value
 */
export function safeNextPath(value: string | undefined): string {
  if (!value) return "/";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }
  return value;
}
