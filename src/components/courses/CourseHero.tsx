"use client";

import CourseHeroGalleryFeature from "./hero-elegant/CourseHeroGalleryFeature";
import type { CourseHeroProps } from "./hero-variants/shared";

export type { CourseHeroProps };

/**
 * Course hero — Gallery Feature layout.
 *
 * @param props - CMS course hero content
 */
export default function CourseHero(props: CourseHeroProps) {
  return <CourseHeroGalleryFeature {...props} />;
}
