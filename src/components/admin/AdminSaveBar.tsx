"use client";

import { useEffect, useState } from "react";
import { Check } from "@/icons";

type AdminSaveBarProps = {
  /** Primary context label (page title, “Header”, etc.) */
  title?: string;
  /** Secondary context (slug, path, or short hint) */
  subtitle?: string;
  saving: boolean;
  saved: boolean;
  error: string;
  /** True when the form has edits that are not yet saved */
  dirty?: boolean;
  onSave: () => void;
  previewHref?: string;
};

/**
 * Sticky bottom save dock for admin editors — page context, status, preview, save.
 *
 * @param props - Save state, optional page context, and handlers
 */
export function AdminSaveBar({
  title,
  subtitle,
  saving,
  saved,
  error,
  dirty = false,
  onSave,
  previewHref,
}: AdminSaveBarProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!saved || error) {
      setShowSaved(false);
      return;
    }
    setShowSaved(true);
    const timer = window.setTimeout(() => setShowSaved(false), 3200);
    return () => window.clearTimeout(timer);
  }, [saved, error]);

  const status = (() => {
    if (error) {
      return (
        <span className="admin-save-status-msg admin-save-status-msg--error">
          {error}
        </span>
      );
    }
    if (saving) {
      return (
        <span className="admin-save-status-msg admin-save-status-msg--saving">
          Saving changes…
        </span>
      );
    }
    if (showSaved) {
      return (
        <span className="admin-save-status-msg admin-save-status-msg--ok">
          <Check size={14} aria-hidden />
          Saved
        </span>
      );
    }
    if (dirty) {
      return (
        <span className="admin-save-status-msg admin-save-status-msg--dirty">
          Unsaved changes
        </span>
      );
    }
    return (
      <span className="admin-save-status-msg">
        Ready — save when you finish editing
      </span>
    );
  })();

  return (
    <div className="admin-save-bar">
      <div className="admin-save-bar-inner">
        <div className="admin-save-about">
          {title || subtitle ? (
            <div className="admin-save-about-text">
              {title ? (
                <p className="admin-save-about-title" title={title}>
                  {title}
                </p>
              ) : null}
              {subtitle ? (
                <p className="admin-save-about-sub" title={subtitle}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="admin-save-status" aria-live="polite">
            {status}
          </div>
        </div>

        <div className="admin-save-actions">
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-sm admin-btn-sm--ghost"
            >
              Preview
            </a>
          ) : null}
          <button
            type="button"
            className="admin-btn admin-save-btn"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
