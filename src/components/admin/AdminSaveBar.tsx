"use client";

type AdminSaveBarProps = {
  saving: boolean;
  saved: boolean;
  error: string;
  onSave: () => void;
  previewHref?: string;
};

/**
 * Sticky save bar for long admin editor forms.
 *
 * @param props - Save state and handlers
 */
export function AdminSaveBar({
  saving,
  saved,
  error,
  onSave,
  previewHref,
}: AdminSaveBarProps) {
  return (
    <div className="admin-save-bar">
      <div className="admin-save-bar-inner">
        <div className="admin-save-status">
          {error ? <span className="admin-error">{error}</span> : null}
          {saved && !error ? (
            <span className="admin-hint">All changes saved.</span>
          ) : null}
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
            className="admin-btn"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
