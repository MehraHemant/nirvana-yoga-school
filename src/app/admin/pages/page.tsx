import { redirect } from "next/navigation";

/**
 * Legacy pages list — redirects to Other Pages section.
 */
export default function AdminPagesPage() {
  redirect("/admin/sections/other");
}
