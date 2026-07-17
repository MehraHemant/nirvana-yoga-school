import Link from "next/link";
import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Contact page.
 */
export default async function AdminContactSection() {
  const pages = (await listSectionPages("site")).filter(
    (page) => page.slug === "contact",
  );

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Contact</h1>
          <p className="admin-subtitle">
            Contact page hero, details, and form copy.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} page</span>
      </div>
      {pages.length > 0 ? (
        <SectionPageTable pages={pages} sectionLabel="contact" />
      ) : (
        <p className="admin-hint admin-empty">
          No contact page row yet.{" "}
          <Link href="/admin/pages/contact" className="admin-link">
            Open editor
          </Link>{" "}
          (creates on save) or run seed.
        </p>
      )}
    </div>
  );
}
