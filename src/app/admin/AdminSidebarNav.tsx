"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "@/icons";

const NAV_SECTIONS = [
  {
    label: "Content",
    items: [
      { label: "Pages", href: "/admin/pages" },
      { label: "Courses", href: "/admin/courses" },
      { label: "Blog", href: "/admin/blog" },
      { label: "Media", href: "/admin/media" },
      { label: "Library", href: "/admin/library" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Global Settings", href: "/admin/settings" },
      { label: "Navigation", href: "/admin/navigation" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Leads", href: "/admin/leads" },
      { label: "Bookings", href: "/admin/bookings" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Chatbot", href: "/admin/chatbot" },
    ],
  },
] as const;

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar-nav" aria-label="Admin navigation">
      <ul className="admin-nav-list">
        {NAV_SECTIONS.map((section) => (
          <li key={section.label} className="admin-nav-section">
            <span className="admin-nav-section-label">{section.label}</span>
            <ul className="admin-nav-items">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`admin-nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}
                  >
                    {item.label}
                    {pathname.startsWith(item.href) && (
                      <ChevronRight className="admin-nav-chevron" size={16} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
