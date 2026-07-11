import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "@/lib/cms/auth";
import { AdminLogoutButton } from "./AdminLogoutButton";
import "./admin.css";

export const metadata: Metadata = {
  title: "CMS Admin",
  robots: "noindex, nofollow",
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/leads", label: "Enquiries" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/library", label: "Content Library" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/chatbot", label: "AI Chatbot" },
] as const;

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
            <Link href="/admin" className="admin-brand">
              Nirvana CMS
            </Link>
            <nav className="admin-sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-sidebar-link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="admin-sidebar-footer">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-sidebar-link"
              >
                View site ↗
              </Link>
              <AdminLogoutButton />
            </div>
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
