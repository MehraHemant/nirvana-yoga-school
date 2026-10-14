import type { Metadata } from "next";
import { getServerSession } from "@/lib/cms/auth";
import { AdminSidebarNav } from "./AdminSidebarNav";
import "./admin.css";

export const metadata: Metadata = {
  title: "CMS Admin",
  robots: "noindex, nofollow",
};

/**
 * Admin shell layout with sidebar navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <div className="admin-shell">
      {session ? (
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <AdminSidebarNav />
          </aside>
          <div className="admin-content">
            <main className="admin-main">{children}</main>
          </div>
        </div>
      ) : (
        <main className="admin-main admin-main--auth">{children}</main>
      )}
    </div>
  );
}
