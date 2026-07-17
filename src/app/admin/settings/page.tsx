import { redirect } from "next/navigation";

/**
 * Legacy settings hub — Site chrome now lives under Header / Footer / Site config.
 */
export default function AdminSettingsPage() {
  redirect("/admin/components/header");
}
