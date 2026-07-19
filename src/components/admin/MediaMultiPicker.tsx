"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  galleryCategoryFromTag,
  galleryMediaTagOptions,
} from "@/content/mappers/gallery-module";
import { fetchAdminMedia } from "@/lib/api/admin-client";
import type { AdminMediaAsset } from "@/lib/types/admin-api";

export type MediaMultiPickResult = {
  url: string;
  mediaAssetId: string;
  alt?: string;
  title?: string;
  /** Suggested gallery category from the active tag filter */
  category: string;
};

type MediaMultiPickerProps = {
  open: boolean;
  onClose: () => void;
  /** Called with selected assets when the user confirms */
  onConfirm: (items: MediaMultiPickResult[]) => void;
  /** Initial tag filter */
  initialTag?: string;
  title?: string;
};

/**
 * Modal multi-select media library picker with tag filtering and search.
 *
 * @param props - Open state, confirm/close handlers, optional initial tag
 */
export function MediaMultiPicker({
  open,
  onClose,
  onConfirm,
  initialTag = "",
  title = "Add images from media",
}: MediaMultiPickerProps) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState(initialTag);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [emptyTagHint, setEmptyTagHint] = useState("");
  const [didTagFallback, setDidTagFallback] = useState(false);

  const tagOptions = useMemo(() => galleryMediaTagOptions(), []);

  useEffect(() => {
    if (!open) return;
    setTag(initialTag);
    setSearch("");
    setSelectedIds([]);
    setEmptyTagHint("");
    setDidTagFallback(false);
  }, [open, initialTag]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetchAdminMedia(tag || undefined)
      .then((body) => {
        if (cancelled) return;
        setAssets(body.assets);
        // Section tag hints often have no library matches — fall back once to all media.
        if (
          tag &&
          body.assets.length === 0 &&
          !didTagFallback &&
          tag === initialTag
        ) {
          setDidTagFallback(true);
          setEmptyTagHint(tag);
          setTag("");
        }
      })
      .catch(() => {
        if (!cancelled) setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, tag, didTagFallback, initialTag]);

  const visibleAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => {
      const haystack = [
        asset.caption,
        asset.alt,
        asset.url,
        ...asset.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [assets, search]);

  if (!open) return null;

  /**
   * Toggles one asset in the multi-select set.
   *
   * @param id - Media asset id
   */
  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function selectVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const asset of visibleAssets) next.add(asset.id);
      return [...next];
    });
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function handleConfirm() {
    const byId = new Map(assets.map((asset) => [asset.id, asset]));
    const category = galleryCategoryFromTag(tag || initialTag || undefined);
    const items = selectedIds.flatMap((id) => {
      const asset = byId.get(id);
      if (!asset) return [];
      return [
        {
          url: asset.url,
          mediaAssetId: asset.id,
          alt: asset.alt ?? asset.caption ?? undefined,
          title: asset.caption ?? undefined,
          category,
        } satisfies MediaMultiPickResult,
      ];
    });
    onConfirm(items);
    onClose();
  }

  return (
    <div className="admin-modal-layer">
      <button
        type="button"
        className="admin-modal-backdrop"
        onClick={onClose}
        aria-label="Close media library"
      />
      <div
        className="admin-modal admin-modal--library"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">{title}</h2>
            <p className="admin-hint admin-hint--tight">
              Click photos to multi-select, then add them to this section.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="admin-media-picker-toolbar">
          <input
            type="search"
            className="admin-input admin-media-picker-search"
            placeholder="Search caption, file name, or tag…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={selectVisible}
              disabled={visibleAssets.length === 0}
            >
              Select visible
            </button>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={clearSelection}
              disabled={selectedIds.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="admin-chip-row admin-media-picker-tags">
          <button
            type="button"
            className={`admin-chip ${tag === "" ? "admin-chip--active" : ""}`}
            onClick={() => {
              setEmptyTagHint("");
              setTag("");
            }}
          >
            All media
          </button>
          {tagOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`admin-chip ${tag === option ? "admin-chip--active" : ""}`}
              onClick={() => {
                setEmptyTagHint("");
                setDidTagFallback(true);
                setTag(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {emptyTagHint ? (
          <p className="admin-tip-banner admin-tip-banner--inline">
            No library images tagged “{emptyTagHint}”. Showing all media —
            pick photos below, or tag uploads on the{" "}
            <Link href="/admin/media">Media</Link> page.
          </p>
        ) : null}

        {loading ? <p className="admin-hint">Loading media…</p> : null}

        {!loading && visibleAssets.length > 0 ? (
          <div className="admin-media-picker-grid">
            {visibleAssets.map((asset) => {
              const selected = selectedIds.includes(asset.id);
              const label =
                asset.caption ||
                asset.alt ||
                asset.url.split("/").pop() ||
                "Untitled";
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`admin-media-pick ${selected ? "admin-media-pick--selected" : ""}`}
                  onClick={() => toggle(asset.id)}
                  aria-pressed={selected}
                >
                  {/* biome-ignore lint/performance/noImgElement: admin preview */}
                  <img src={asset.url} alt={label} />
                  {selected ? (
                    <span className="admin-media-pick-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                  <span className="admin-media-pick-label">{label}</span>
                  {asset.tags.length > 0 ? (
                    <span className="admin-media-pick-tags">
                      {asset.tags.slice(0, 2).join(" · ")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {!loading && visibleAssets.length === 0 ? (
          <div className="admin-empty-card">
            <p>
              {tag
                ? `No media matches “${tag}”.`
                : search.trim()
                  ? "No media matches your search."
                  : "No media in the library yet."}
            </p>
            <div className="admin-empty-card-actions">
              {tag ? (
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    setEmptyTagHint("");
                    setTag("");
                  }}
                >
                  Show all media
                </button>
              ) : null}
              {search.trim() ? (
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              ) : null}
              <Link href="/admin/media" className="admin-btn-sm admin-btn-sm--ghost">
                Open Media library
              </Link>
            </div>
          </div>
        ) : null}

        <div className="admin-modal-footer">
          <p className="admin-hint" style={{ margin: 0 }}>
            {selectedIds.length} selected
            {visibleAssets.length > 0
              ? ` · ${visibleAssets.length} shown`
              : ""}
            {tag ? ` · ${tag}` : ""}
          </p>
          <div className="admin-actions">
            <button type="button" className="admin-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
            >
              Add {selectedIds.length > 0 ? selectedIds.length : ""} selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
