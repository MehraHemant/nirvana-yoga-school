import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Residential yoga teacher training courses.
 * Lists course pages in a table with View, Edit, and Publish actions.
 */
export default async function AdminCoursesSection() {
  const pages = await listSectionPages("course");

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Courses</h1>
          <p className="admin-subtitle">
            Residential yoga teacher training programs. View the live page, edit
            content, or publish / unpublish from the table.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} courses</span>
      </div>
      <SectionPageTable pages={pages} sectionLabel="courses" />
    </div>
  );
}
