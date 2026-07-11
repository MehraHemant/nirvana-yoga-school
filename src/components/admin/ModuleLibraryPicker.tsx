"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  ModuleLibraryItemRecord,
  ModuleLibraryKey,
} from "@/content/types";
import { MODULE_LIBRARY_LABELS } from "@/content/types";
import { clonePayload } from "@/lib/cms/module-library";

type LibraryListItem = ModuleLibraryItemRecord & { preview: string };

type ModuleLibraryPickerProps = {
  open: boolean;
  moduleKey: ModuleLibraryKey;
  variant?: string;
  onClose: () => void;
  onSelect: (payload: unknown) => void;
};

/**
 * Modal to pick a reusable module snippet filtered by component type.
 *
 * @param props - Open state, module key, optional variant filter, and callbacks
 */
export function ModuleLibraryPicker({
  open,
  moduleKey,
  variant,
  onClose,
  onSelect,
}: ModuleLibraryPickerProps) {
  const [items, setItems] = useState<LibraryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError("");

    const params = new URLSearchParams({ moduleKey });
    if (variant) params.set("variant", variant);

    fetch(`/api/admin/module-library?${params}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load library");
        const body = (await response.json()) as { items: LibraryListItem[] };
        setItems(body.items);
      })
      .catch(() => {
        setItems([]);
        setError("Could not load library items");
      })
      .finally(() => setLoading(false));
  }, [open, moduleKey, variant]);

  if (!open) return null;

  const sectionLabel = MODULE_LIBRARY_LABELS[moduleKey];

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-modal admin-modal--library"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Module library picker"
      >
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            Insert {sectionLabel}
            {variant ? ` (${variant})` : ""}
          </h2>
          <button
            type="button"
            className="admin-btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? <p className="admin-hint">Loading…</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}

        {!loading && items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No saved items for this section type.</p>
            <Link href="/admin/library" className="admin-btn-sm">
              Open content library
            </Link>
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="admin-compact-table admin-compact-table--picker">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--name">
                Name
              </span>
              <span className="admin-compact-col admin-compact-col--preview">
                Preview
              </span>
              <span className="admin-compact-col admin-compact-col--pick" />
            </div>
            {items.map((item) => (
              <div key={item.id} className="admin-compact-table-row">
                <span
                  className="admin-compact-col admin-compact-col--name"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span
                  className="admin-compact-col admin-compact-col--preview"
                  title={item.preview}
                >
                  {item.preview}
                  {item.variant ? (
                    <span className="admin-library-badge admin-library-badge--inline">
                      {item.variant}
                    </span>
                  ) : null}
                </span>
                <span className="admin-compact-col admin-compact-col--pick">
                  <button
                    type="button"
                    className="admin-btn-xs"
                    onClick={() => {
                      onSelect(clonePayload(item.payload));
                      onClose();
                    }}
                  >
                    Insert
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
