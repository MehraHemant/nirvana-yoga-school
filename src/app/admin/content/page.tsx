import { redirect } from "next/navigation";

/**
 * Content items CMS was unused — site pages use module editors instead.
 */
export default function ContentItemsPage() {
  redirect("/admin");
}
