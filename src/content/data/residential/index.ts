import { COURSES_DATA } from "@/data/coursesData";

/** Residential course static data — large hand-authored records. */
export { COURSES_DATA as RESIDENTIAL_COURSES };
export type { CourseData as ResidentialCourseRecord } from "@/data/coursesData";

export function getStaticResidentialCourse(slug: string) {
  return COURSES_DATA[slug] ?? null;
}

export function getStaticResidentialSlugs(): string[] {
  return Object.keys(COURSES_DATA);
}
