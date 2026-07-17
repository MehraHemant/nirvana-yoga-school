import { redirect } from "next/navigation";
import { AdminHeaderChromeEditor } from "@/components/admin/AdminHeaderChromeEditor";
import { AdminSiteChromeTabs } from "@/components/admin/AdminSiteChromeTabs";
import { getServerSession } from "@/lib/cms/auth";

/**
 * Global Header editor — branding, CTA, and primary navigation in one place.
 */
export default async function AdminHeaderComponentPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <section className="admin-cms-shell">
      <header className="admin-cms-header">
        <div>
          <p className="admin-cms-kicker">Site chrome</p>
          <h1 className="admin-cms-title">Header & Navigation</h1>
          <p className="admin-subtitle admin-subtitle--flush">
            Logos, ordered CTAs (Sign in, Enquire now), and the primary menu on
            every page. Save once to update branding and navigation together.
          </p>
        </div>
      </header>

      <AdminSiteChromeTabs />
      <AdminHeaderChromeEditor />
    </section>
  );
}
