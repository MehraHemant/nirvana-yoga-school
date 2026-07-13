import Link from "next/link";
import {
  AdminFilterSelect,
  AdminFilterSubmit,
} from "@/components/admin/AdminFilterSelect";
import { AdminIconLink } from "@/components/admin/AdminIconAction";
import { Pencil } from "@/icons";
import { adminPageEditHref, listAdminPages } from "@/lib/cms/admin-lists";

type AdminPagesPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

/**
 * Admin pages list — site, retreat, and venue pages (server-rendered).
 *
 * @param props - URL search params for filtering
 */
export default async function AdminPagesPage({
  searchParams,
}: AdminPagesPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const typeFilter = params.type ?? "all";

  const pages = await listAdminPages();
  const filtered = pages.filter((page) => {
    if (page.type === "course" || page.type === "online") return false;
    if (typeFilter !== "all" && page.type !== typeFilter) return false;
    if (!query) return true;
    return (
      page.title.toLowerCase().includes(query) ||
      page.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h1 className="admin-title">Pages</h1>
      <p className="admin-subtitle">
        Edit site, retreat, and venue pages. Courses are under{" "}
        <Link href="/admin/courses">Courses</Link>.
      </p>

      <form method="get" className="admin-toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          name="q"
          placeholder="Search by title or slug…"
          defaultValue={params.q ?? ""}
        />
        <AdminFilterSelect id="page-type" name="type" defaultValue={typeFilter}>
          <option value="all">All types</option>
          <option value="site">Site</option>
          <option value="retreat">Retreat</option>
          <option value="venue">Venue</option>
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
            {filtered.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.slug}</td>
                <td>{page.type}</td>
                <td>{page.published ? "Published" : "Draft"}</td>
                <td className="admin-row-actions">
                  <AdminIconLink
                    href={adminPageEditHref(page)}
                    label="Edit page"
                    icon={<Pencil size={16} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">No pages match your search.</p>
        ) : null}
      </div>
    </div>
  );
}
