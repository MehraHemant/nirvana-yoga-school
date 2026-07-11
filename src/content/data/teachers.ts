import { mapSiteTeachers } from "@/app/(site)/_shared/site/data";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { getStaticSitePage } from "@/content/data/site-pages";

export const TEACHER_PAGE_SLUG = "teacher";

export const TEACHERS_HERO_QUOTE =
  "Yoga Is A Light, Which Once Lit Will Never Dim. The Better Your Practice, The Brighter Your Flame.";

export function getTeachersPageDocument() {
  const page = getStaticSitePage(TEACHER_PAGE_SLUG);
  if (!page) {
    throw new Error("Teacher page data is missing from site-pages.json");
  }
  return page;
}

export function getTeachers(): TeacherProfile[] {
  return mapSiteTeachers(getTeachersPageDocument().people);
}

export function teacherSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
