import { redirect } from "next/navigation";

/**
 * Navigation is edited inside Header & Navigation — keep a stable redirect.
 */
export default function AdminNavigationComponentPage() {
  redirect("/admin/components/header#navigation");
}
