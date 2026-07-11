"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  ModuleLibraryItemRecord,
  ModuleLibraryKey,
} from "@/content/types";
import { HERO_VARIANT_LABELS, MODULE_LIBRARY_LABELS } from "@/content/types";

type LibraryListItem = ModuleLibraryItemRecord & { preview: string };

const MODULE_KEYS = Object.keys(MODULE_LIBRARY_LABELS) as ModuleLibraryKey[];

/**
 * Admin content library list with type and hero variant filters.
 */
export default function AdminLibraryPage() {
  const [moduleKey, setModuleKey] = useState<ModuleLibraryKey>("hero");
  const [variant, setVariant] = useState<string>("");
  const [items, setItems] = useState<LibraryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ moduleKey });
    if (moduleKey === "hero" && variant) {
      params.set("variant", variant);
    }

    const response = await fetch(`/api/admin/module-library?${params}`);
    if (!response.ok) {
      setError("Failed to load library");
      setItems([]);
      setLoading(false);
      return;
    }

    const body = (await response.json()) as { items: LibraryListItem[] };
    setItems(body.items);
    setLoading(false);
  }, [moduleKey, variant]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function duplicateItem(item: LibraryListItem) {
    const response = await fetch("/api/admin/module-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleKey: item.moduleKey,
        variant: item.variant,
        name: `${item.name} (copy)`,
        payload: item.payload,
      }),
    });

    if (!response.ok) {
      setError("Duplicate failed");
      return;
    }

    await loadItems();
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this library item?")) return;

    const response = await fetch(`/api/admin/module-library/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Delete failed");
      return;
    }

    await loadItems();
  }

  const sectionLabel = MODULE_LIBRARY_LABELS[moduleKey];
  const variantLabel =
    moduleKey === "hero" && variant
      ? HERO_VARIANT_LABELS[variant as keyof typeof HERO_VARIANT_LABELS]
      : null;

  return (
    <div>
      <h1 className="admin-title">Content library</h1>
      <p className="admin-subtitle">
        Reusable snippets by section type. Each row is one saved block you can
        copy into any page.
      </p>

      <section className="admin-section-block admin-section-block--filters">
        <h2 className="admin-section-label">Filter by section</h2>
        <div className="admin-toolbar admin-library-filters">
          <div className="admin-field">
            <label className="admin-label" htmlFor="lib-module-key">
              Section type
            </label>
            <select
              id="lib-module-key"
              className="admin-input admin-filter"
              value={moduleKey}
              onChange={(event) => {
                setModuleKey(event.target.value as ModuleLibraryKey);
                setVariant("");
              }}
            >
              {MODULE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {MODULE_LIBRARY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {moduleKey === "hero" ? (
            <div className="admin-field">
              <label className="admin-label" htmlFor="lib-variant">
                Hero layout
              </label>
              <select
                id="lib-variant"
                className="admin-input admin-filter"
                value={variant}
                onChange={(event) => setVariant(event.target.value)}
              >
                <option value="">All layouts</option>
                {(
                  Object.keys(
                    HERO_VARIANT_LABELS,
                  ) as (keyof typeof HERO_VARIANT_LABELS)[]
                ).map((key) => (
                  <option key={key} value={key}>
                    {HERO_VARIANT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </section>

      <section className="admin-section-block">
        <div className="admin-section-head">
          <h2 className="admin-section-label">
            {sectionLabel}
            {variantLabel ? ` · ${variantLabel}` : ""}
          </h2>
          <span className="admin-section-count">{items.length} items</span>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {loading ? <p className="admin-hint">Loading…</p> : null}

        {!loading && items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No items in this section yet.</p>
            <p className="admin-hint">
              Save from a page editor with &ldquo;Save to library&rdquo;.
            </p>
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="admin-compact-table">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--name">
                Name
              </span>
              <span className="admin-compact-col admin-compact-col--preview">
                Preview
              </span>
              <span className="admin-compact-col admin-compact-col--type">
                Type
              </span>
              <span className="admin-compact-col admin-compact-col--date">
                Updated
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                Actions
              </span>
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  {index + 1}
                </span>
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
                </span>
                <span className="admin-compact-col admin-compact-col--type">
                  <span className="admin-library-badge">
                    {item.variant ?? item.moduleKey}
                  </span>
                </span>
                <span className="admin-compact-col admin-compact-col--date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <Link
                    href={`/admin/library/${item.id}`}
                    className="admin-btn-xs admin-btn-xs--ghost"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-btn-xs admin-btn-xs--ghost"
                    onClick={() => duplicateItem(item)}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="admin-btn-xs admin-btn-xs--danger"
                    onClick={() => deleteItem(item.id)}
                  >
                    Del
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
