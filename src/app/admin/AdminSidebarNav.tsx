"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";

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
 * Returns whether a sidebar href matches the current admin route.
 *
 * @param href - Nav link target
 * @param pathname - Current pathname from the router
 * @param exact - When true, only match the href exactly
 */
function isSidebarLinkActive(
  href: string,
  pathname: string,
  exact?: boolean,
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Left sidebar navigation with active-route highlighting.
 */
export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <Link href="/admin" className="admin-brand">
        Nirvana CMS
      </Link>
      <nav className="admin-sidebar-nav" aria-label="CMS sections">
        {NAV_ITEMS.map((item) => {
          const active = isSidebarLinkActive(
            item.href,
            pathname,
            "exact" in item ? item.exact : false,
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link${active ? " admin-sidebar-link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
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
    </>
  );
}
