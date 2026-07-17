/**
 * Shared live/visibility helpers for CMS page sections.
 *
 * Convention: `live?: boolean` on section JSON — omit or `true` means shown;
 * `live: false` hides the section. Legacy `show: false` (map/contact) is
 * treated the same for backward compatibility.
 */

/** Section objects that may carry a live / show flag. */
export type SectionVisibilityFields = {
  /** When false, section is hidden on the public site. Default true. */
  live?: boolean;
  /** Legacy visibility flag (map / contact / enquire). Prefer `live`. */
  show?: boolean;
};

/**
 * Returns whether a section should be considered live.
 * Missing section or missing flag defaults to live (backward compatible).
 *
 * @param section - Section object with optional `live` / `show`
 */
export function isSectionLive(
  section?: SectionVisibilityFields | null,
): boolean {
  if (section == null) return true;
  if (section.live === false) return false;
  if (section.show === false) return false;
  return true;
}

/**
 * Render gate: section must be live and have displayable content.
 *
 * @param section - Section object with optional visibility flags
 * @param hasData - Whether the section has meaningful content to show
 */
export function shouldRenderSection(
  section: SectionVisibilityFields | null | undefined,
  hasData: boolean,
): boolean {
  return hasData && isSectionLive(section);
}
