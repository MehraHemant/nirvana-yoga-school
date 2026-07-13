import { AdminFilterSubmit } from "@/components/admin/AdminFilterSelect";
import { AdminIconLink } from "@/components/admin/AdminIconAction";
import { Pencil } from "@/icons";
import { listAdminBlogPosts } from "@/lib/cms/admin-lists";

type AdminBlogPageProps = {
  searchParams: Promise<{ q?: string }>;
};

/**
 * Admin blog posts list (server-rendered).
 *
 * @param props - URL search params for filtering
 */
export default async function AdminBlogPage({
  searchParams,
}: AdminBlogPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const posts = await listAdminBlogPosts();
  const filtered = posts.filter((post) => {
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h1 className="admin-title">Blog</h1>
      <p className="admin-subtitle">Edit articles and news posts.</p>

      <form method="get" className="admin-toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          name="q"
          placeholder="Search posts…"
          defaultValue={params.q ?? ""}
        />
        <AdminFilterSubmit>Search</AdminFilterSubmit>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category || "—"}</td>
                <td>{post.published ? "Published" : "Draft"}</td>
                <td className="admin-row-actions">
                  <AdminIconLink
                    href={`/admin/blog/${post.slug}`}
                    label="Edit post"
                    icon={<Pencil size={16} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">No posts found.</p>
        ) : null}
      </div>
    </div>
  );
}
