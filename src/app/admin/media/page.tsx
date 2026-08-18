"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminIconButton } from "@/components/admin/AdminIconAction";
import { MediaEditPanel } from "@/components/admin/MediaEditPanel";
import { MediaUploadPanel, type MediaUploadPanelHandle } from "@/components/admin/MediaUploadPanel";
import { Copy, ExternalLink, Layers, Pencil, Trash } from "@/icons";
import {
  deleteAdminMedia,
  fetchAdminMedia,
  fetchAdminMediaAsset,
  updateAdminMedia,
} from "@/lib/api/admin-client";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import { MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import { MEDIA_TAG_PRESETS } from "@/lib/cdn/media-tags";
import type { AdminMediaAsset } from "@/lib/types/admin-api";
import { ApiClientError } from "@/lib/types/api";

const PAGE_SIZE = 48;
const SKELETON_COUNT = 24;

type ViewMode = "grid" | "list";
type UsageFilter = "all" | "inUse" | "unused";
type LibraryKind = "image" | "video";

/**
 * Formats created date for card meta.
 *
 * @param iso - ISO date string
 */
function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats file size for display.
 *
 * @param bytes - Size in bytes
 */
function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Admin media library with stats, search, rich cards, and side-panel editing.
 */
export default function AdminMediaPage() {
  const uploadRef = useRef<MediaUploadPanelHandle>(null);
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [libraryKind, setLibraryKind] = useState<LibraryKind>("image");
  const [tagFilter, setTagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<AdminMediaAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body = await fetchAdminMedia({
        tag: tagFilter || undefined,
        page,
        limit: PAGE_SIZE,
        kind: libraryKind,
        includeUsage: true,
      });
      setAssets(body.assets);
      setTotal(body.total);
      setTotalPages(body.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setAssets([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [tagFilter, page, libraryKind]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return assets.filter((asset) => {
      if (usageFilter === "inUse" && !asset.usage?.inUse) return false;
      if (usageFilter === "unused" && asset.usage?.inUse) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        asset.caption,
        asset.alt,
        asset.description,
        ...asset.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [assets, searchQuery, usageFilter]);

  const pageInUseCount = assets.filter((asset) => asset.usage?.inUse).length;
  const pageUnusedCount = assets.length - pageInUseCount;

  /**
   * Applies a tag chip filter and resets to the first page.
   *
   * @param nextTag - Tag to filter by, or empty for all
   */
  function applyTagFilter(nextTag: string) {
    setTagFilter(nextTag);
    setPage(1);
    setEditingAsset(null);
  }

  /**
   * Opens the side panel editor and loads fresh usage for the asset.
   *
   * @param asset - Media asset to edit
   */
  function openEditor(asset: AdminMediaAsset) {
    setEditingAsset(asset);
    setSaveMessage("");
    void fetchAdminMediaAsset(asset.id)
      .then((body) => {
        setEditingAsset(body.asset);
        setAssets((prev) =>
          prev.map((item) => (item.id === body.asset.id ? body.asset : item)),
        );
      })
      .catch(() => undefined);
  }

  /**
   * Switches between the image and video libraries.
   *
   * @param nextKind - Library tab to show
   */
  function applyLibraryKind(nextKind: LibraryKind) {
    setLibraryKind(nextKind);
    setPage(1);
    setEditingAsset(null);
    setUsageFilter("all");
    setSearchQuery("");
  }

  /**
   * Persists metadata for the asset open in the editor.
   */
  async function saveEdit(patch: {
    caption: string;
    description: string;
    alt: string;
    tags: string[];
  }) {
    if (!editingAsset) return;

    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const body = await updateAdminMedia(editingAsset.id, patch);
      setEditingAsset(body.asset);
      setSaveMessage("Changes saved");
      setMessage("Image details saved");
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Deletes an unused media asset from the library and CDN.
   *
   * @param asset - Media asset to delete
   */
  async function deleteAsset(asset: AdminMediaAsset) {
    if (!window.confirm(`Delete this ${libraryKind} from the library and CDN?`)) return;

    try {
      await deleteAdminMedia(asset.id);
      setMessage(libraryKind === "video" ? "Video deleted" : "Image deleted");
      setEditingAsset(null);
      await loadAssets();
    } catch (err) {
      if (err instanceof ApiClientError && err.references?.length) {
        setError(`${err.message}: ${err.references.join(", ")}`);
      } else {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    }
  }

  /**
   * Copies the asset CDN URL to the clipboard.
   *
   * @param asset - Media asset
   */
  async function copyUrl(asset: AdminMediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      setMessage("URL copied to clipboard");
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy URL");
    }
  }

  const isVideoLibrary = libraryKind === "video";
  const assetNoun = isVideoLibrary ? "video" : "image";
  const assetNounPlural = isVideoLibrary ? "videos" : "images";
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showPagination = !loading && total > 0;
  const hasActiveFilters =
    Boolean(tagFilter) || Boolean(searchQuery.trim()) || usageFilter !== "all";

  /**
   * Renders action buttons shared by grid cards and list rows.
   *
   * @param asset - Media asset
   */
  function renderAssetActions(asset: AdminMediaAsset) {
    return (
      <>
        <AdminIconButton
          label="Edit metadata"
          onClick={() => openEditor(asset)}
          icon={<Pencil size={15} />}
        />
        <AdminIconButton
          label={copiedId === asset.id ? "Copied" : "Copy URL"}
          onClick={() => void copyUrl(asset)}
          icon={<Copy size={15} />}
        />
        <a
          href={asset.url}
          target="_blank"
          rel="noreferrer"
          className="admin-icon-btn admin-icon-btn--sm"
          aria-label={`Open full ${assetNoun}`}
          title={`Open full ${assetNoun}`}
        >
          <ExternalLink size={15} />
        </a>
        {!asset.usage?.inUse ? (
          <AdminIconButton
            label={`Delete ${assetNoun}`}
            variant="danger"
            onClick={() => deleteAsset(asset)}
            icon={<Trash size={15} />}
          />
        ) : null}
      </>
    );
  }

  /**
   * Renders one media grid card.
   *
   * @param asset - Media asset
   */
  function renderGridCard(asset: AdminMediaAsset) {
    const previewUrl = asset.thumbUrl || cloudinaryThumbUrl(asset.url, 360);
    const title = asset.caption || `Untitled ${assetNoun}`;
    const altText = asset.alt || asset.caption || "Media asset";
    const inUse = asset.usage?.inUse ?? false;

    return (
      <article
        key={asset.id}
        className={`admin-media-library__card${
          editingAsset?.id === asset.id ? " admin-media-library__card--active" : ""
        }`}
      >
        <button
          type="button"
          className="admin-media-library__card-thumb-btn"
          onClick={() => openEditor(asset)}
          aria-label={`Edit ${title}`}
        >
          <div className="admin-media-library__card-thumb">
            {isVideoLibrary ? (
              <video
                src={asset.url}
                muted
                playsInline
                preload="metadata"
                className="admin-media-library__card-video"
              />
            ) : (
              /* biome-ignore lint/performance/noImgElement: admin preview */
              <img
                src={previewUrl}
                alt={altText}
                loading="lazy"
                decoding="async"
                width={360}
                height={360}
              />
            )}
            <span
              className={`admin-status-chip admin-media-library__card-badge${
                inUse ? " admin-status-chip--warn" : " admin-status-chip--ok"
              }`}
            >
              {inUse ? "In use" : "Unused"}
            </span>
          </div>
        </button>

        <div className="admin-media-library__card-body">
          <p className="admin-media-library__card-title" title={title}>
            {title}
          </p>
          <p
            className={`admin-media-library__card-alt${
              asset.alt ? "" : " admin-media-library__card-alt--muted"
            }`}
            title={asset.alt ?? undefined}
          >
            {asset.alt || "No alt text"}
          </p>
          {asset.tags.length > 0 ? (
            <div className="admin-media-library__card-tags">
              {asset.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="admin-library-badge">
                  {tag}
                </span>
              ))}
              {asset.tags.length > 4 ? (
                <span className="admin-media-library__card-tag-more">
                  +{asset.tags.length - 4}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="admin-media-library__card-meta">
            {formatCreatedDate(asset.createdAt)} · {formatSize(asset.sizeBytes)}
          </p>
        </div>

        <div className="admin-media-library__card-actions">{renderAssetActions(asset)}</div>
      </article>
    );
  }

  /**
   * Renders one media list row.
   *
   * @param asset - Media asset
   */
  function renderListRow(asset: AdminMediaAsset) {
    const previewUrl = asset.thumbUrl || cloudinaryThumbUrl(asset.url, 120);
    const title = asset.caption || `Untitled ${assetNoun}`;
    const inUse = asset.usage?.inUse ?? false;

    return (
      <article
        key={asset.id}
        className={`admin-media-library__row${
          editingAsset?.id === asset.id ? " admin-media-library__row--active" : ""
        }`}
      >
        <button
          type="button"
          className="admin-media-library__row-thumb-btn"
          onClick={() => openEditor(asset)}
          aria-label={`Edit ${title}`}
        >
          <div className="admin-media-library__row-thumb">
            {isVideoLibrary ? (
              <video
                src={asset.url}
                muted
                playsInline
                preload="metadata"
                className="admin-media-library__row-video"
              />
            ) : (
              /* biome-ignore lint/performance/noImgElement: admin preview */
              <img src={previewUrl} alt="" loading="lazy" decoding="async" />
            )}
          </div>
        </button>

        <div className="admin-media-library__row-copy">
          <span className="admin-media-library__row-title">{title}</span>
          <span className="admin-media-library__row-alt">
            {asset.alt || "No alt text"}
          </span>
          {asset.tags.length > 0 ? (
            <div className="admin-media-library__row-tags">
              {asset.tags.map((tag) => (
                <span key={tag} className="admin-library-badge">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <span className="admin-media-library__row-meta">
            {formatCreatedDate(asset.createdAt)} · {formatSize(asset.sizeBytes)}
          </span>
        </div>

        <span
          className={`admin-status-chip${
            inUse ? " admin-status-chip--warn" : " admin-status-chip--ok"
          }`}
        >
          {inUse ? "In use" : "Unused"}
        </span>

        <div className="admin-media-library__row-actions">{renderAssetActions(asset)}</div>
      </article>
    );
  }

  return (
    <div className="admin-media-library">
      <header className="admin-media-library__header">
        <h1 className="admin-title">Media library</h1>
        <p className="admin-subtitle">
          Upload {assetNounPlural} for pages, courses, and room galleries (JPEG,
          PNG, WebP · max {MAX_UPLOAD_LABEL} each). Deletion is only allowed when
          an asset is not referenced anywhere — in-use {assetNounPlural} show where
          they appear so you can remove them first.
        </p>
      </header>

      <div className="admin-media-library__tabs" role="tablist" aria-label="Media type">
        {(
          [
            ["image", "Images"],
            ["video", "Videos"],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={libraryKind === kind}
            className={`admin-chip admin-media-library__tab${
              libraryKind === kind ? " admin-chip--active" : ""
            }`}
            onClick={() => applyLibraryKind(kind)}
          >
            {label}
          </button>
        ))}
      </div>

      {!isVideoLibrary ? (
        <MediaUploadPanel
          ref={uploadRef}
          onUploaded={() => {
            setMessage("Image uploaded");
            if (page !== 1) setPage(1);
            else void loadAssets();
          }}
          onBulkUploaded={(results) => {
            setMessage(
              `${results.length} image${results.length === 1 ? "" : "s"} uploaded`,
            );
            if (page !== 1) setPage(1);
            else void loadAssets();
          }}
          onError={setError}
        />
      ) : null}

      {loading ? (
        <div className="admin-media-library__stats admin-stat-grid admin-media-library__stats-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="admin-stat-card">
              <div className="admin-media-skeleton admin-media-skeleton--line admin-media-skeleton--short" />
              <div
                className="admin-media-skeleton admin-media-skeleton--line"
                style={{ marginTop: "0.5rem", height: "1.75rem" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-media-library__stats admin-stat-grid admin-media-library__stats-grid">
          <div className="admin-stat-card admin-stat-card--primary">
            <p className="admin-stat-label">Total assets</p>
            <p className="admin-stat-value">{total}</p>
            <p className="admin-stat-hint">
              {tagFilter ? `Tagged “${tagFilter}”` : "Entire library"}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">This page</p>
            <p className="admin-stat-value">{filteredAssets.length}</p>
            <p className="admin-stat-hint">
              {hasActiveFilters ? "After filters" : `Showing ${rangeStart}–${rangeEnd}`}
            </p>
          </div>
          <div className="admin-stat-card admin-stat-card--secondary">
            <p className="admin-stat-label">In use</p>
            <p className="admin-stat-value">{pageInUseCount}</p>
            <p className="admin-stat-hint">On current page</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Unused</p>
            <p className="admin-stat-value">{pageUnusedCount}</p>
            <p className="admin-stat-hint">Safe to delete</p>
          </div>
        </div>
      )}

      <div className="admin-toolbar admin-media-library__toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          aria-label="Search media"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search caption, alt, tags…"
        />
        <div className="admin-media-library__view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`admin-media-library__view-btn${
              viewMode === "grid" ? " admin-media-library__view-btn--active" : ""
            }`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
          >
            <Layers size={16} />
            Grid
          </button>
          <button
            type="button"
            className={`admin-media-library__view-btn${
              viewMode === "list" ? " admin-media-library__view-btn--active" : ""
            }`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title="List view"
          >
            List
          </button>
        </div>
      </div>

      <div className="admin-media-library__filters">
        <div className="admin-media-library__filter-group">
          <span className="admin-media-library__filter-label">Tags</span>
          <div className="admin-quick-add-chips">
            <button
              type="button"
              className={`admin-chip ${tagFilter === "" ? "admin-chip--active" : ""}`}
              onClick={() => applyTagFilter("")}
            >
              All
            </button>
            {MEDIA_TAG_PRESETS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`admin-chip ${tagFilter === tag ? "admin-chip--active" : ""}`}
                onClick={() => applyTagFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-media-library__filter-group">
          <span className="admin-media-library__filter-label">Usage</span>
          <div className="admin-quick-add-chips">
            {(
              [
                ["all", "All"],
                ["inUse", "In use"],
                ["unused", "Unused"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`admin-chip ${usageFilter === key ? "admin-chip--active" : ""}`}
                onClick={() => setUsageFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="admin-media-status admin-media-status--error"
          role="alert"
        >
          <p className="admin-media-status-title">Something went wrong</p>
          <p className="admin-media-status-body">{error}</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => void loadAssets()}
          >
            Try again
          </button>
        </div>
      ) : null}
      {message && !error ? (
        <p className="admin-hint admin-media-toast" role="status">
          {message}
        </p>
      ) : null}

      {showPagination ? (
        <div className="admin-media-pagination admin-media-pagination--top">
          <p className="admin-hint admin-hint--tight">
            Page {page} of {totalPages} · {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "admin-media-library__grid"
              : "admin-media-library__list"
          }
          role="region"
          aria-busy="true"
          aria-label="Loading media"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) =>
            viewMode === "grid" ? (
              <div
                key={`skeleton-${index}`}
                className="admin-media-library__card admin-media-library__card--skeleton"
              >
                <div className="admin-media-skeleton admin-media-skeleton--thumb" />
                <div className="admin-media-library__card-body">
                  <div className="admin-media-skeleton admin-media-skeleton--line" />
                  <div className="admin-media-skeleton admin-media-skeleton--line admin-media-skeleton--short" />
                </div>
              </div>
            ) : (
              <div
                key={`skeleton-${index}`}
                className="admin-media-library__row admin-media-library__row--skeleton"
              >
                <div className="admin-media-skeleton admin-media-library__skeleton-thumb" />
                <div className="admin-media-library__skeleton-copy">
                  <div className="admin-media-skeleton admin-media-skeleton--line" />
                  <div className="admin-media-skeleton admin-media-skeleton--line admin-media-skeleton--short" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : null}

      {!loading && !error && assets.length === 0 ? (
        <div className="admin-empty-state admin-media-library__empty">
          {tagFilter ? (
            <>
              <p className="admin-empty-state-title">
                No {assetNounPlural} tagged “{tagFilter}”
              </p>
              <p className="admin-hint">
                Try another tag, or upload {assetNounPlural} with this tag.
              </p>
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={() => applyTagFilter("")}
              >
                Clear tag filter
              </button>
            </>
          ) : (
            <>
              <p className="admin-empty-state-title">No {assetNounPlural} yet</p>
              <p className="admin-hint">
                {isVideoLibrary
                  ? "Upload videos from page editors or video fields — they will appear here."
                  : "Upload one or more files to start building your media library."}
              </p>
              {!isVideoLibrary ? (
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => uploadRef.current?.openFilePicker()}
                >
                  Upload images
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!loading && assets.length > 0 && filteredAssets.length === 0 ? (
        <div className="admin-empty-state admin-media-library__empty">
          <p className="admin-empty-state-title">No matches on this page</p>
          <p className="admin-hint">
            {searchQuery.trim()
              ? `Nothing matches “${searchQuery.trim()}”. Try another search.`
              : "No assets match the current usage filter on this page."}
          </p>
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() => {
              setSearchQuery("");
              setUsageFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {!loading && filteredAssets.length > 0 ? (
        viewMode === "grid" ? (
          <div className="admin-media-library__grid">{filteredAssets.map(renderGridCard)}</div>
        ) : (
          <div className="admin-media-library__list">{filteredAssets.map(renderListRow)}</div>
        )
      ) : null}

      {!loading && totalPages > 1 ? (
        <div className="admin-media-pagination">
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="admin-hint admin-hint--tight">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <MediaEditPanel
        asset={editingAsset}
        open={Boolean(editingAsset)}
        saving={saving}
        saveMessage={saveMessage}
        onClose={() => setEditingAsset(null)}
        onSave={saveEdit}
        onDelete={deleteAsset}
      />
    </div>
  );
}
