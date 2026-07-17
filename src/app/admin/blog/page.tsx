import Link from "next/link";
import { duplicateBlogPostAction } from "@/app/admin/blog/actions";
import { AdminActionForm } from "@/components/admin/AdminActionForm";
import { AdminFilterSubmit } from "@/components/admin/AdminFilterSelect";
import { Copy } from "@/icons";
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
      <p className="admin-subtitle">
        Articles and news posts. View the live post or open the editor.
      </p>

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
              <th>Slug</th>
              <th>Category</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>
                  <span className="admin-table-title">{post.title}</span>
                </td>
                <td>
                  <code className="admin-table-slug">/{post.slug}</code>
                </td>
                <td>{post.category || "—"}</td>
                <td>
                  <span
                    className={`admin-pill${post.published ? " admin-pill--published" : ""}`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="admin-row-actions">
                  <div className="admin-list-row-actions">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-sm admin-btn-sm--ghost"
                    >
                      View
                    </a>
                    <Link
                      href={`/admin/blog/${post.slug}`}
                      className="admin-btn-sm"
                    >
                      Edit
                    </Link>
                    <AdminActionForm
                      action={duplicateBlogPostAction}
                      fields={{ id: post.id }}
                      label="Copy"
                    >
                      <Copy size={16} />
                    </AdminActionForm>
                  </div>
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
