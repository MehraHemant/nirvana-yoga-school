/**
 * Long date for when the next quiz chance opens, in the school's time zone.
 *
 * @param iso - ISO instant from the server
 */
export function formatQuizNextDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
