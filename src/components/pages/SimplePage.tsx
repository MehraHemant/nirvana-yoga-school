import type { SitePageDocument } from "@/content/types";
import SitePageLayout from "./SitePageLayout";

export default function SimplePage({ page }: { page: SitePageDocument }) {
  return <SitePageLayout page={page} />;
}
