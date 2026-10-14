import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Course and retreat venues.
 * Lists venue pages in a table with View, Edit, and Publish actions.
 */
export default async function AdminVenuesSection() {
  const pages = await listSectionPages("venue");

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Venues</h1>
          <p className="admin-subtitle">
            Course and retreat venue pages. View, edit, or publish / unpublish
            from the table.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} venues</span>
      </div>
      <SectionPageTable pages={pages} sectionLabel="venues" />
    </div>
  );
}
