import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Yoga retreats.
 * Lists retreat pages in a table with View, Edit, and Publish actions.
 */
export default async function AdminRetreatsSection() {
  const pages = await listSectionPages("retreat");

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Retreats</h1>
          <p className="admin-subtitle">
            Yoga meditation and wellness retreats. View, edit, or publish /
            unpublish from the table.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} retreats</span>
      </div>
      <SectionPageTable pages={pages} sectionLabel="retreats" />
    </div>
  );
}
