import {
  AdminFilterSelect,
  AdminFilterSubmit,
} from "@/components/admin/AdminFilterSelect";
import { AdminIconLink } from "@/components/admin/AdminIconAction";
import { Pencil } from "@/icons";
import { listAdminCourses } from "@/lib/cms/admin-lists";

type AdminCoursesPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

/**
 * Admin courses list — residential and online YTT programs (server-rendered).
 *
 * @param props - URL search params for filtering
 */
export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const typeFilter = params.type ?? "all";

  const courses = await listAdminCourses();
  const filtered = courses.filter((course) => {
    if (typeFilter !== "all" && course.type !== typeFilter) return false;
    if (!query) return true;
    return (
      course.title.toLowerCase().includes(query) ||
      course.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h1 className="admin-title">Courses</h1>
      <p className="admin-subtitle">
        Edit residential and online yoga teacher training programs.
      </p>

      <form method="get" className="admin-toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          name="q"
          placeholder="Search by title or slug…"
          defaultValue={params.q ?? ""}
        />
        <AdminFilterSelect
          id="course-type"
          name="type"
          defaultValue={typeFilter}
        >
          <option value="all">All types</option>
          <option value="course">Residential</option>
          <option value="online">Online</option>
        </AdminFilterSelect>
        <AdminFilterSubmit>Search</AdminFilterSubmit>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.slug}</td>
                <td>{course.type === "online" ? "Online" : "Residential"}</td>
                <td>{course.published ? "Published" : "Draft"}</td>
                <td className="admin-row-actions">
                  <AdminIconLink
                    href={`/admin/courses/${course.slug}`}
                    label="Edit course"
                    icon={<Pencil size={16} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">
            No courses match your search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
