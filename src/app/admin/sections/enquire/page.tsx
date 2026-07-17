import Link from "next/link";
import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Enquire Now page.
 */
export default async function AdminEnquireSection() {
  const pages = (await listSectionPages("site")).filter(
    (page) => page.slug === "enquire-now",
  );

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Enquire</h1>
          <p className="admin-subtitle">
            Enquire-now hero, steps, and form copy.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} page</span>
      </div>
      {pages.length > 0 ? (
        <SectionPageTable pages={pages} sectionLabel="enquire" />
      ) : (
        <p className="admin-hint admin-empty">
          No enquire page row yet.{" "}
          <Link href="/admin/pages/enquire-now" className="admin-link">
            Open editor
          </Link>{" "}
          (creates on save) or run seed.
        </p>
      )}
    </div>
  );
}
