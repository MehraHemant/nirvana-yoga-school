/**
 * Shared live/visibility helpers for CMS page sections.
 *
 * Convention: `live?: boolean` on section JSON — omit or `true` means shown;
 * `live: false` hides the section. Legacy `show: false` (map/contact) is
 * treated the same for backward compatibility.
 */

import type { ExamCertificationContent } from "@/content/types/shared-sections";

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

/**
 * Whether exam & certification CMS has anything worth showing publicly.
 * Accepts intro copy, evaluation steps, or certificates — not both sides.
 *
 * @param content - Shared examCertification document
 */
export function hasExamCertificationContent(
  content: ExamCertificationContent | null | undefined,
): boolean {
  if (!content) return false;
  const hasCopy = Boolean(
    content.eyebrow?.trim() ||
      content.title?.trim() ||
      content.description?.trim(),
  );
  const hasSteps = Boolean(
    content.steps?.some(
      (step) =>
        step.title?.trim() ||
        step.tag?.trim() ||
        step.description?.trim() ||
        step.image?.trim(),
    ),
  );
  const hasCertificates = Boolean(
    content.certificates?.some(
      (cert) =>
        cert.title?.trim() || cert.subtitle?.trim() || cert.image?.trim(),
    ),
  );
  return hasCopy || hasSteps || hasCertificates;
}
