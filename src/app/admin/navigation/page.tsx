import { getServerSession } from "@/lib/cms/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminActionForm, AdminConfirmForm } from "@/components/admin/AdminActionForm";
import { Copy, Pencil, Trash, Plus } from "@/icons";
import type { NavItem, NavLink } from "@/content/data/navigation/types";
import { pagePath } from "@/content/pages/path";

/**
 * Admin navigation editor.
 */
export default async function NavigationPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const groups = await prisma.navigationGroup.findMany({
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { key: "asc" },
  });

  return (
    <div>
      <header className="admin-page-header">
        <h1 className="admin-title">Navigation Menus</h1>
        <p className="admin-subtitle">Manage navigation groups and items. Changes apply site-wide.</p>
      </header>

      {groups.map((group) => (
        <section key={group.id} className="admin-section-block">
          <div className="admin-section-head">
            <h2 className="admin-section-label">{group.label}</h2>
            <span className="admin-section-count">{group.items.length} items</span>
          </div>

          {group.items.length === 0 ? (
            <p className="admin-hint">No items in this group.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Label</th>
                    <th>Target</th>
                    <th>Type</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td className="admin-table-label">{item.label}</td>
                      <td>
                        {item.pageType && item.pageSlug ? (
                          <code>{item.pageType}:{item.pageSlug}</code>
                        ) : item.href ? (
                          <code>{item.href}</code>
                        ) : (
                          <span className="admin-hint">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${item.itemType === "page" ? "primary" : "neutral"}`}>
                          {item.itemType}
                        </span>
                      </td>
                      <td>{item.sortOrder}</td>
                      <td className="admin-table-actions">
                        <a href={`/admin/navigation/${item.id}`} className="admin-icon-btn" aria-label="Edit">
                          <Pencil size={16} />
                        </a>
                        <AdminActionForm
                          action={async (formData) => {
                            await prisma.navigationItem.delete({ where: { id: formData.get("id") as string } });
                          }}
                          fields={{ id: item.id }}
                          label="Delete"
                        >
                          <Trash size={16} />
                        </AdminActionForm>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <section className="admin-section-block">
        <h2 className="admin-section-label">Create New Group</h2>
        <form
          action={async (formData) => {
            await prisma.navigationGroup.create({
              data: { key: formData.get("key") as string, label: formData.get("label") as string },
            });
          }}
          className="admin-form-inline"
        >
          <input name="key" placeholder="key (e.g., primary)" required className="admin-input" />
          <input name="label" placeholder="Label (e.g., Primary Navigation)" required className="admin-input" />
          <button type="submit" className="admin-btn admin-btn--primary">
            <Plus size={16} /> Create Group
          </button>
        </form>
      </section>
    </div>
  );
}
