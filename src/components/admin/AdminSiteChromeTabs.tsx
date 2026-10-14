"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/admin/components/header",
    label: "Header & Nav",
    hint: "Logos, CTA, primary menu",
  },
  {
    href: "/admin/components/footer",
    label: "Footer",
    hint: "Brand, columns, social, legal",
  },
  {
    href: "/admin/settings/site-config",
    label: "Site config",
    hint: "SEO defaults, WhatsApp, contact",
  },
] as const;

/**
 * Shared tab bar for Header, Footer, and Site config admin screens.
 */
export function AdminSiteChromeTabs() {
  const pathname = usePathname();

  return (
    <nav className="admin-chrome-tabs" aria-label="Site chrome sections">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`admin-chrome-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="admin-chrome-tab-label">{tab.label}</span>
            <span className="admin-chrome-tab-hint">{tab.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
