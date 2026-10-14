import { redirect } from "next/navigation";

/**
 * Legacy settings route — header + nav live under Site chrome.
 */
export default function HeaderSettingsPage() {
  redirect("/admin/components/header");
}
