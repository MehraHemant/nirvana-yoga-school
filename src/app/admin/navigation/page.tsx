import { redirect } from "next/navigation";

/**
 * Legacy navigation route — menu editing lives under Header & Navigation.
 */
export default function NavigationPage() {
  redirect("/admin/components/header#navigation");
}
