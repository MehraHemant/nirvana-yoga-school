import { redirect } from "next/navigation";

/**
 * Legacy site settings URL — forwards to the Site config chrome tab.
 */
export default function LegacySiteSettingsPage() {
  redirect("/admin/settings/site-config");
}
