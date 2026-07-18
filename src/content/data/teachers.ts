/**
 * Teacher utilities — content loads from MySQL via `@/content/repositories/teachers`.
 * Kept for stable import paths used by the teachers page UI.
 *
 * Client-safe: `TEACHER_PAGE_SLUG`, `teacherSlug` (from teachers-slug).
 * Server-only: `getTeachers`, `getTeachersPage`, `mapTeachersFromPeople`.
 */
export { TEACHER_PAGE_SLUG, teacherSlug } from "@/content/teachers-slug";
export {
  getTeachers,
  getTeachersPage,
  mapTeachersFromPeople,
  type TeachersPageData,
  type TeachersPagePresentation,
} from "@/content/repositories/teachers";
