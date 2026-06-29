import {
  ONLINE_COURSES,
  type OnlineCourseDocument,
} from "@/content/data/online-courses";
import { fromJson, type RepositoryOptions } from "@/content/repositories/fetch";
import type { ContentResult } from "@/content/repositories/fetch";

export async function getOnlineCourse(
  slug: string,
  _options?: RepositoryOptions,
): Promise<ContentResult<OnlineCourseDocument | null>> {
  return fromJson(ONLINE_COURSES[slug] ?? null);
}

export async function getOnlineCourseSlugs(): Promise<string[]> {
  return Object.keys(ONLINE_COURSES);
}
