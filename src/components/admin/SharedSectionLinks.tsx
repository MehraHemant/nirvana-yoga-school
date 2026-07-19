"use client";

import Link from "next/link";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";

export type SharedSectionLink = {
  /** Link label */
  label: string;
  /** Admin href */
  href: string;
  /** Optional hint */
  hint?: string;
};

type SharedSectionLinksProps = {
  /** Deep-links to shared global_settings editors */
  links: SharedSectionLink[];
  /** Panel step number */
  step?: number;
  /** Panel id */
  panelId?: string;
};

/**
 * Admin panel listing deep-links to shared global_settings editors.
 *
 * @param props - Link list and panel chrome
 */
export function SharedSectionLinks({
  links,
  step,
  panelId = "shared-section-links",
}: SharedSectionLinksProps) {
  if (links.length === 0) return null;

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Shared sections"
      subtitle="Edit once — reused across product pages"
      defaultOpen
    >
      <ul className="admin-shared-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="admin-link">
              {link.label}
            </Link>
            {link.hint ? (
              <span className="admin-hint"> — {link.hint}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="admin-hint" style={{ marginTop: "0.75rem" }}>
        Visibility for shared blocks on this page is controlled by the Shared
        sections (Live) toggles on this editor.
      </p>
    </CollapsiblePanel>
  );
}
