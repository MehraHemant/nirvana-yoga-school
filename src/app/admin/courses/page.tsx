import { redirect } from "next/navigation";

/**
 * Legacy courses list — redirects to the Courses section.
 */
export default function AdminCoursesPage() {
  redirect("/admin/sections/courses");
}
