"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIconButton } from "@/components/admin/AdminIconAction";
import { MediaMetadataFields } from "@/components/admin/MediaMetadataFields";
import { MediaUploadPanel } from "@/components/admin/MediaUploadPanel";
import { Check, Close, Pencil, Trash } from "@/icons";
import {
  deleteAdminMedia,
  fetchAdminMedia,
  updateAdminMedia,
} from "@/lib/api/admin-client";
import { MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import { MEDIA_TAG_PRESETS } from "@/lib/cdn/media-tags";
import type { AdminMediaListResponse } from "@/lib/types/admin-api";
import { ApiClientError } from "@/lib/types/api";

type MediaAsset = AdminMediaListResponse["assets"][number];

/**
 * Admin media library with metadata, tags, and safe delete.
 */
export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body = await fetchAdminMedia(tagFilter || undefined);
      setAssets(body.assets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [tagFilter]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  function startEdit(asset: MediaAsset) {
    setEditingId(asset.id);
    setEditCaption(asset.caption ?? "");
    setEditDescription(asset.description ?? "");
    setEditTags(asset.tags ?? []);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError("");

    try {
      await updateAdminMedia(id, {
        caption: editCaption,
        description: editDescription,
        tags: editTags,
        alt: editCaption,
      });
      setEditingId(null);
      setMessage("Image details saved");
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset(asset: MediaAsset) {
    if (asset.usage.inUse) {
      setError(`Cannot delete — used in: ${asset.usage.references.join(", ")}`);
      return;
    }

    if (!window.confirm("Delete this image from the library and CDN?")) return;

    try {
      await deleteAdminMedia(asset.id);
      setMessage("Image deleted");
      if (editingId === asset.id) setEditingId(null);
      await loadAssets();
    } catch (err) {
      if (err instanceof ApiClientError && err.references?.length) {
        setError(`${err.message}: ${err.references.join(", ")}`);
      } else {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    }
  }

  return (
    <div>
      <h1 className="admin-title">Media library</h1>
      <p className="admin-subtitle">
        Upload with caption, description, and tags. Max size: {MAX_UPLOAD_LABEL}
        . Delete only works when the image is not used on any page.
      </p>

      <MediaUploadPanel
        onUploaded={() => {
          setMessage("Image uploaded");
          loadAssets();
        }}
        onError={setError}
      />

      <section className="admin-section-block admin-section-block--filters">
        <h2 className="admin-section-label">Filter by tag</h2>
        <div className="admin-quick-add-chips">
          <button
            type="button"
            className={`admin-chip ${tagFilter === "" ? "admin-chip--active" : ""}`}
            onClick={() => setTagFilter("")}
          >
            All
          </button>
          {MEDIA_TAG_PRESETS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`admin-chip ${tagFilter === tag ? "admin-chip--active" : ""}`}
              onClick={() => setTagFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-hint">{message}</p> : null}
      {loading ? <p className="admin-hint">Loading…</p> : null}

      {!loading && assets.length === 0 ? (
        <div className="admin-empty-card">
          <p>No images{tagFilter ? ` tagged “${tagFilter}”` : ""} yet.</p>
        </div>
      ) : null}

      <div className="admin-media-list">
        {assets.map((asset) => (
          <div key={asset.id} className="admin-media-list-item">
            <div className="admin-media-list-thumb">
              {/* biome-ignore lint/performance/noImgElement: admin preview */}
              <img
                src={asset.url}
                alt={asset.caption ?? asset.alt ?? "Media asset"}
              />
            </div>

            <div className="admin-media-list-body">
              {editingId === asset.id ? (
                <MediaMetadataFields
                  caption={editCaption}
                  description={editDescription}
                  tags={editTags}
                  onCaptionChange={setEditCaption}
                  onDescriptionChange={setEditDescription}
                  onTagsChange={setEditTags}
                />
              ) : (
                <>
                  <p className="admin-media-list-title">
                    {asset.caption || "Untitled image"}
                  </p>
                  {asset.description ? (
                    <p className="admin-media-list-desc">{asset.description}</p>
                  ) : null}
                  <div className="admin-selected-tags">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="admin-library-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="admin-hint admin-hint--tight">
                    {Math.round(asset.sizeBytes / 1024)}KB · {asset.mime}
                  </p>
                </>
              )}

              {asset.usage.inUse ? (
                <p className="admin-media-in-use">
                  In use: {asset.usage.references.join(" · ")}
                </p>
              ) : (
                <p className="admin-media-unused">
                  Not attached — safe to delete
                </p>
              )}
            </div>

            <div className="admin-media-list-actions admin-row-actions">
              {editingId === asset.id ? (
                <>
                  <AdminIconButton
                    label={saving ? "Saving…" : "Save changes"}
                    disabled={saving}
                    onClick={() => saveEdit(asset.id)}
                    icon={<Check size={16} />}
                  />
                  <AdminIconButton
                    label="Cancel editing"
                    onClick={() => setEditingId(null)}
                    icon={<Close size={16} />}
                  />
                </>
              ) : (
                <>
                  <AdminIconButton
                    label="Edit metadata"
                    onClick={() => startEdit(asset)}
                    icon={<Pencil size={16} />}
                  />
                  <AdminIconButton
                    label={
                      asset.usage.inUse
                        ? `Cannot delete — in use: ${asset.usage.references.join(", ")}`
                        : "Delete image"
                    }
                    variant="danger"
                    disabled={asset.usage.inUse}
                    onClick={() => deleteAsset(asset)}
                    icon={<Trash size={16} />}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
