"use client";

import { scrollToSection } from "@/components/admin/sectionDomId";

export type AdminSectionJumpItem = {
  /** DOM id of the target section panel */
  id: string;
  /** Human-readable label shown in the nav */
  label: string;
  /** Optional step badge (module editors) */
  step?: number;
  /** Optional secondary hint under the label */
  hint?: string;
};

type AdminSectionJumpNavProps = {
  /** Sections listed in document order */
  items: AdminSectionJumpItem[];
  /** Currently highlighted section id (from scroll-spy) */
  activeId: string;
  /**
   * Optional click handler; defaults to smooth-scroll to the section id.
   *
   * @param id - Section DOM id
   */
  onJump?: (id: string) => void;
};

/**
 * Sticky “Jump to section” list for multi-panel admin editors.
 * On narrow viewports becomes a horizontal chip row.
 *
 * @param props - Section items, active id, and optional jump handler
 */
export function AdminSectionJumpNav({
  items,
  activeId,
  onJump,
}: AdminSectionJumpNavProps) {
  if (items.length === 0) return null;

  function handleJump(id: string) {
    if (onJump) {
      onJump(id);
      return;
    }
    scrollToSection(id);
  }

  return (
    <nav
      className="admin-module-nav admin-section-jump-nav"
      aria-label="Jump to section"
    >
      <p className="admin-module-nav-label">Jump to section</p>
      <ul className="admin-module-nav-list">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`admin-module-nav-link ${isActive ? "admin-module-nav-link--active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleJump(item.id)}
              >
                {item.step != null ? (
                  <span className="admin-module-nav-step">{item.step}</span>
                ) : null}
                <span>
                  <span className="admin-module-nav-text">{item.label}</span>
                  {item.hint ? (
                    <span className="admin-module-nav-hint">{item.hint}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
