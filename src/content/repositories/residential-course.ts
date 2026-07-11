import { COURSES_MEDIA } from "@/content/data/media";
import {
  getStaticResidentialCourse,
  getStaticResidentialSlugs,
} from "@/content/data/residential";
import type { ContentResult } from "@/content/repositories/fetch";
import { fromJson, type RepositoryOptions } from "@/content/repositories/fetch";
import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";

export async function getResidentialCourse(
  slug: string,
  _options?: RepositoryOptions,
): Promise<ContentResult<ResidentialCourseDocument | null>> {
  return fromJson(getStaticResidentialCourse(slug));
}

export async function getResidentialCourseSlugs(): Promise<string[]> {
  return getStaticResidentialSlugs();
}

export async function getCourseMedia(slug: string): Promise<CourseMedia> {
  return COURSES_MEDIA[slug] ?? { images: [], videos: [] };
}
