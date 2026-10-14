import { redirect } from "next/navigation";

/**
 * Legacy settings route — footer lives under Site chrome.
 */
export default function FooterSettingsPage() {
  redirect("/admin/components/footer");
}
