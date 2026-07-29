"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Certificate,
  ChevronRight,
  Compass,
  Layers,
  Leaf,
  Lotus,
  Send,
  Shield,
  Sunrise,
  Users,
  Wallet,
  Wifi,
} from "@/icons";
import { AdminLogoutButton } from "./AdminLogoutButton";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Pages",
    items: [
      { label: "Home", href: "/admin/sections/home", Icon: Lotus },
      { label: "Courses", href: "/admin/sections/courses", Icon: Certificate },
      { label: "Online Courses", href: "/admin/sections/online", Icon: Wifi },
      { label: "Retreats", href: "/admin/sections/retreats", Icon: Sunrise },
      { label: "Venues", href: "/admin/sections/venues", Icon: Leaf },
      { label: "Teachers", href: "/admin/sections/teachers", Icon: Users },
      { label: "Contact", href: "/admin/sections/contact", Icon: Send },
      { label: "Enquire", href: "/admin/sections/enquire", Icon: Compass },
      { label: "Blog", href: "/admin/blog", Icon: BookOpen },
      { label: "Other Pages", href: "/admin/sections/other", Icon: Layers },
    ],
  },
  {
    label: "Site chrome",
    items: [
      {
        label: "Header & Nav",
        href: "/admin/components/header",
        Icon: Compass,
      },
      { label: "Footer", href: "/admin/components/footer", Icon: Layers },
      {
        label: "Site config",
        href: "/admin/settings/site-config",
        Icon: Shield,
      },
    ],
  },
  {
    label: "CMS",
    items: [
      {
        label: "Shared sections",
        href: "/admin/sections/shared",
        Icon: Layers,
      },
      { label: "Media", href: "/admin/media", Icon: Leaf },
      {
        label: "Chat knowledge",
        href: "/admin/settings/chat",
        Icon: BookOpen,
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Leads", href: "/admin/leads", Icon: Send },
      { label: "Bookings", href: "/admin/bookings", Icon: Wallet },
      {
        label: "Booking add-ons",
        href: "/admin/bookings/addons",
        Icon: Layers,
      },
    ],
  },
];

/**
 * Left admin sidebar with branded header, sectioned nav, and logout.
 */
export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar-inner">
      <div className="admin-sidebar-brand">
        <Link href="/admin" className="admin-sidebar-brand-link">
          <span className="admin-sidebar-brand-mark" aria-hidden="true">
            N
          </span>
          <span className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-name">Nirvana CMS</span>
            <span className="admin-sidebar-brand-sub">Content admin</span>
          </span>
        </Link>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="admin-nav-section">
            <p className="admin-nav-section-label">{section.label}</p>
            <ul className="admin-nav-list">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const { Icon } = item;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`admin-nav-link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="admin-nav-icon" size={16} />
                      <span className="admin-nav-link-label">{item.label}</span>
                      {active ? (
                        <ChevronRight className="admin-nav-chevron" size={14} />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <p className="admin-sidebar-footer-about">
          Nirvana CMS — edit pages, media, and site chrome.
        </p>
        <Link href="/" className="admin-nav-link admin-nav-link--muted">
          View site
        </Link>
        <AdminLogoutButton />
      </div>
    </div>
  );
}
