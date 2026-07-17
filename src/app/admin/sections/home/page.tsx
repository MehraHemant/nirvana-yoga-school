import Link from "next/link";
import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Homepage only.
 * Lists the home page with View, Edit, and Publish actions.
 */
export default async function AdminHomeSection() {
  const pages = (await listSectionPages("site")).filter(
    (page) => page.slug === "home",
  );

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Home</h1>
          <p className="admin-subtitle">
            Homepage content_data (hero, welcome, CTAs).{" "}
            <Link href="/admin/pages/home" className="admin-link">
              Open editor
            </Link>
          </p>
        </div>
        <span className="admin-page-count">{pages.length} page</span>
      </div>
      {pages.length > 0 ? (
        <SectionPageTable pages={pages} sectionLabel="home" />
      ) : (
        <p className="admin-hint admin-empty">
          No home page found.{" "}
          <Link href="/admin/pages/home" className="admin-link">
            Open /admin/pages/home
          </Link>{" "}
          after seeding, or create a site page with slug <code>home</code>.
        </p>
      )}
    </div>
  );
}
