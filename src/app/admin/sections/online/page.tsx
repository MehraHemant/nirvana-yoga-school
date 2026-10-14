import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Online yoga teacher training courses.
 * Lists online course pages in a table with View, Edit, and Publish actions.
 */
export default async function AdminOnlineSection() {
  const pages = await listSectionPages("online");

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Online Courses</h1>
          <p className="admin-subtitle">
            Online yoga teacher training and short courses. View, edit, or
            publish / unpublish from the table.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} courses</span>
      </div>
      <SectionPageTable pages={pages} sectionLabel="online courses" />
    </div>
  );
}
