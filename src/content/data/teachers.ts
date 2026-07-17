/**
 * Teacher utilities — content loads from MySQL via `@/content/repositories/teachers`.
 * Kept for stable import paths used by the teachers page UI.
 */
export { teacherSlug } from "@/content/teachers-slug";
export {
  getTeachers,
  getTeachersPage,
  mapTeachersFromPeople,
  TEACHER_PAGE_SLUG,
  type TeachersPageData,
  type TeachersPagePresentation,
} from "@/content/repositories/teachers";
