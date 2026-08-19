"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { fetchAdminMedia } from "@/lib/api/admin-client";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import type { AdminMediaAsset } from "@/lib/types/admin-api";

type MediaPickerKind = "image" | "video";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  tagFilter?: string;
  /** Filter library to images (default) or videos */
  kind?: MediaPickerKind;
};

const PAGE_SIZE = 48;

/**
 * Builds searchable text from a media asset row.
 *
 * @param asset - Media library asset
 */
function mediaAssetHaystack(asset: AdminMediaAsset): string {
  const filename = asset.url.split("/").pop() ?? "";
  return [
    asset.caption,
    asset.alt,
    asset.description,
    filename,
    ...asset.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Modal grid to pick an image or video URL from the media library.
 *
 * @param props - Open state, close handler, selection callback, optional filters
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  tagFilter,
  kind = "image",
}: MediaPickerProps) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const title = kind === "video" ? "Choose video" : "Choose image";
  const emptyHint =
    kind === "video"
      ? "No videos yet. Upload a video from this field or the Media page first."
      : "No uploads yet. Upload images from the Media page first.";

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setAssets([]);
    setTotalPages(1);
    setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    fetchAdminMedia({
      tag: tagFilter,
      page,
      limit: PAGE_SIZE,
      kind,
    })
      .then((body) => {
        if (cancelled) return;
        setTotalPages(body.totalPages);
        setAssets((prev) => (page === 1 ? body.assets : [...prev, ...body.assets]));
      })
      .catch(() => {
        if (!cancelled && page === 1) setAssets([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, tagFilter, kind, page]);

  const visibleAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => mediaAssetHaystack(asset).includes(query));
  }, [assets, search]);

  if (!open) return null;

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
        aria-label="Media library"
      >
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{title}</h2>
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
          <AdminSearchField
            value={search}
            onChange={setSearch}
            placeholder="Search caption, file name, or tag…"
            ariaLabel="Search media"
            className="admin-media-picker-search"
          />
        </div>

        {loading ? <p className="admin-hint">Loading…</p> : null}

        {visibleAssets.length > 0 ? (
          <div className="admin-media-picker-grid">
            {visibleAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="admin-media-pick"
                onClick={() => {
                  onSelect(asset.url);
                  onClose();
                }}
              >
                {kind === "video" ? (
                  // biome-ignore lint/a11y/useMediaCaption: admin mute preview
                  <video src={asset.url} muted playsInline preload="metadata" />
                ) : (
                  // biome-ignore lint/performance/noImgElement: admin preview
                  <img
                    src={asset.thumbUrl || cloudinaryThumbUrl(asset.url, 240)}
                    alt={asset.caption ?? asset.alt ?? "Media asset"}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="admin-media-pick-label">
                  {asset.caption || "Untitled"}
                </span>
                {asset.tags.length > 0 ? (
                  <span className="admin-media-pick-tags">
                    {asset.tags.slice(0, 2).join(" · ")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {page < totalPages ? (
          <div className="admin-media-picker-more">
            <button
              type="button"
              className="admin-btn-sm"
              disabled={loadingMore}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}

        {!loading && visibleAssets.length === 0 ? (
          <div className="admin-empty-card">
            <p>
              {search.trim()
                ? "No media matches your search."
                : emptyHint}
            </p>
            {search.trim() ? (
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
