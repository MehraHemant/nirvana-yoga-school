"use client";

import { useEffect, useState } from "react";
import { AdminIconButton } from "@/components/admin/AdminIconAction";
import { MediaMetadataFields } from "@/components/admin/MediaMetadataFields";
import { Close, Trash } from "@/icons";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import type { AdminMediaAsset } from "@/lib/types/admin-api";

type MediaEditPanelProps = {
  asset: AdminMediaAsset | null;
  open: boolean;
  saving: boolean;
  saveMessage: string;
  onClose: () => void;
  onSave: (patch: {
    caption: string;
    description: string;
    alt: string;
    tags: string[];
  }) => void;
  onDelete: (asset: AdminMediaAsset) => void;
};

/**
 * Side drawer for editing a media asset — preview, metadata, usage, and actions.
 *
 * @param props - Asset, form state handlers, and save/delete callbacks
 */
export function MediaEditPanel({
  asset,
  open,
  saving,
  saveMessage,
  onClose,
  onSave,
  onDelete,
}: MediaEditPanelProps) {
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [alt, setAlt] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!asset) return;
    setCaption(asset.caption ?? "");
    setDescription(asset.description ?? "");
    setAlt(asset.alt ?? "");
    setTags(asset.tags ?? []);
  }, [asset]);

  if (!open || !asset) return null;

  const previewUrl = asset.thumbUrl || cloudinaryThumbUrl(asset.url, 480);
  const isVideo = asset.mime.startsWith("video/");
  const inUse = asset.usage?.inUse ?? false;
  const references = asset.usage?.references ?? [];

  return (
    <div className="admin-media-library__drawer-layer" role="presentation">
      <button
        type="button"
        className="admin-media-library__drawer-backdrop"
        onClick={onClose}
        aria-label="Close editor"
      />
      <aside
        className="admin-media-library__drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Edit media asset"
      >
        <div className="admin-media-library__drawer-header">
          <div>
            <h2 className="admin-media-library__drawer-title">Edit asset</h2>
            <p className="admin-media-library__drawer-subtitle">
              {asset.caption || "Untitled image"}
            </p>
          </div>
          <AdminIconButton label="Close editor" onClick={onClose} icon={<Close size={18} />} />
        </div>

        <div className="admin-media-library__drawer-body">
          <div className="admin-media-library__drawer-preview">
            {isVideo ? (
              <video
                src={asset.url}
                controls
                playsInline
                preload="metadata"
                className="admin-media-library__drawer-video"
              />
            ) : (
              /* biome-ignore lint/performance/noImgElement: admin preview */
              <img src={previewUrl} alt={alt || caption || "Media preview"} />
            )}
          </div>

          <div className="admin-media-library__drawer-usage">
            <span
              className={`admin-status-chip${
                inUse ? " admin-status-chip--warn" : " admin-status-chip--ok"
              }`}
            >
              {inUse ? "In use" : "Unused"}
            </span>
            {inUse ? (
              <div className="admin-media-library__references">
                <p className="admin-media-library__references-label">
                  Used on {references.length} page
                  {references.length === 1 ? "" : "s"}
                </p>
                <ul className="admin-media-library__references-list">
                  {references.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
                <p className="admin-hint admin-hint--tight">
                  Remove references before deleting this asset.
                </p>
              </div>
            ) : (
              <p className="admin-hint admin-hint--tight">
                Safe to delete — not referenced anywhere in the CMS.
              </p>
            )}
          </div>

          <MediaMetadataFields
            caption={caption}
            description={description}
            alt={alt}
            tags={tags}
            onCaptionChange={setCaption}
            onDescriptionChange={setDescription}
            onAltChange={setAlt}
            onTagsChange={setTags}
          />
        </div>

        <div className="admin-media-library__drawer-footer">
          {saveMessage ? (
            <p className="admin-media-library__save-feedback" role="status">
              {saveMessage}
            </p>
          ) : null}
          <div className="admin-media-library__drawer-actions">
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            {!inUse ? (
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--danger"
                disabled={saving}
                onClick={() => onDelete(asset)}
              >
                <Trash size={14} />
                Delete
              </button>
            ) : null}
            <button
              type="button"
              className="admin-btn-sm"
              disabled={saving}
              onClick={() =>
                onSave({
                  caption,
                  description,
                  alt: alt || caption,
                  tags,
                })
              }
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
