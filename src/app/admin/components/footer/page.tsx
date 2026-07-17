import { redirect } from "next/navigation";
import { AdminFooterChromeEditor } from "@/components/admin/AdminFooterChromeEditor";
import { AdminSiteChromeTabs } from "@/components/admin/AdminSiteChromeTabs";
import { getServerSession } from "@/lib/cms/auth";

/**
 * Global Footer editor — brand, social, columns, contact, and legal links.
 */
export default async function AdminFooterComponentPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <section className="admin-cms-shell">
      <header className="admin-cms-header">
        <div>
          <p className="admin-cms-kicker">Site chrome</p>
          <h1 className="admin-cms-title">Footer</h1>
          <p className="admin-subtitle admin-subtitle--flush">
            Brand block, social icons, link columns, contact details, and legal
            links shown on every page.
          </p>
        </div>
      </header>

      <AdminSiteChromeTabs />
      <AdminFooterChromeEditor />
    </section>
  );
}
