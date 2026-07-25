"use client";

import { useEffect, useState } from "react";
import { fetchAdminMedia } from "@/lib/api/admin-client";
import type { AdminMediaAsset } from "@/lib/types/admin-api";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  tagFilter?: string;
};

/**
 * Modal grid to pick an image URL from the media library.
 *
 * @param props - Open state, close handler, selection callback, optional tag filter
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  tagFilter,
}: MediaPickerProps) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetchAdminMedia(tagFilter)
      .then((body) =>
        setAssets(body.assets.filter((asset) => asset.mime.startsWith("image/"))),
      )
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [open, tagFilter]);

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
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Media library"
      >
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Choose image</h2>
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
        <div className="admin-media-picker-grid">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="admin-media-pick"
              onClick={() => {
                onSelect(asset.url);
                onClose();
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: admin preview */}
              <img
                src={asset.url}
                alt={asset.caption ?? asset.alt ?? "Media asset"}
              />
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
        {assets.length === 0 && !loading ? (
          <p className="admin-hint">
            No uploads yet. Upload images from the Media page first.
          </p>
        ) : null}
      </div>
    </div>
  );
}
