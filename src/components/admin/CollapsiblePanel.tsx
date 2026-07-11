"use client";

import { useState } from "react";

type CollapsiblePanelProps = {
  title: string;
  subtitle?: string;
  description?: string;
  step?: number;
  id?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

/**
 * Collapsible admin section panel with optional step badge and anchor id.
 *
 * @param props - Panel title, optional subtitle, step number, and child fields
 */
export function CollapsiblePanel({
  title,
  subtitle,
  description,
  step,
  id,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  actions,
}: CollapsiblePanelProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function toggle() {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <section
      id={id}
      className={`admin-panel ${open ? "admin-panel--open" : ""}`}
    >
      <div className="admin-panel-header">
        <button
          type="button"
          className="admin-panel-toggle"
          onClick={toggle}
          aria-expanded={open}
        >
          {step ? <span className="admin-panel-step">{step}</span> : null}
          <span className="admin-panel-chevron" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span className="admin-panel-heading">
            <span className="admin-panel-title">{title}</span>
            {subtitle ? (
              <span className="admin-panel-subtitle">{subtitle}</span>
            ) : null}
          </span>
        </button>
        {actions}
      </div>
      {open ? (
        <div className="admin-panel-body">
          {description ? (
            <p className="admin-panel-intro">{description}</p>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}
