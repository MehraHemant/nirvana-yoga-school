"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  galleryCategoryFromTag,
  galleryMediaTagOptions,
} from "@/content/mappers/gallery-module";
import {
  fetchAdminMedia,
  fetchLodgingMediaImages,
} from "@/lib/api/admin-client";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";

export type MediaMultiPickResult = {
  url: string;
  /** CMS media_assets id when source is assets */
  mediaAssetId: string;
  /** Lodging media_images id when available */
  mediaImageId?: string;
  alt?: string;
  title?: string;
  /** Suggested gallery category from the active tag filter */
  category: string;
};

type PickerAsset = {
  id: string;
  url: string;
  thumbUrl: string;
  label: string;
  alt?: string;
  title?: string;
  tags: string[];
  mediaImageId?: string;
};

type MediaMultiPickerProps = {
  open: boolean;
  onClose: () => void;
  /** Called with selected assets when the user confirms */
  onConfirm: (items: MediaMultiPickResult[]) => void;
  /** Initial tag filter */
  initialTag?: string;
  title?: string;
  /**
   * `lodging` reads `media_images` (room/food). `assets` reads CMS media library.
   */
  source?: "assets" | "lodging";
};

const PAGE_SIZE = 48;

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
  source = "assets",
}: MediaMultiPickerProps) {
  const [assets, setAssets] = useState<PickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    setPage(1);
    setTotalPages(1);
    setAssets([]);
    setError("");
  }, [open, initialTag]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const isFirstPage = page === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);
    setError("");

    const load =
      source === "lodging"
        ? fetchLodgingMediaImages({
            tag: tag || undefined,
            page,
            limit: PAGE_SIZE,
          }).then((body) => ({
            images: (body.images ?? []).map(
              (image): PickerAsset => ({
                id: image.id,
                url: image.url,
                thumbUrl: image.thumbUrl || cloudinaryThumbUrl(image.url, 240),
                label:
                  image.title ||
                  image.alt ||
                  image.url.split("/").pop() ||
                  "Untitled",
                alt: image.alt || image.title,
                title: image.title,
                tags: image.tag ? [image.tag] : [],
                mediaImageId: image.id,
              }),
            ),
            totalPages: body.totalPages ?? 1,
          }))
        : fetchAdminMedia({
            tag: tag || undefined,
            page,
            limit: PAGE_SIZE,
            kind: "image",
          }).then((body) => ({
            images: body.assets.map(
                (asset): PickerAsset => ({
                  id: asset.id,
                  url: asset.url,
                  thumbUrl:
                    asset.thumbUrl || cloudinaryThumbUrl(asset.url, 240),
                  label:
                    asset.caption ||
                    asset.alt ||
                    asset.url.split("/").pop() ||
                    "Untitled",
                  alt: asset.alt ?? asset.caption ?? undefined,
                  title: asset.caption ?? undefined,
                  tags: asset.tags,
                }),
              ),
            totalPages: body.totalPages,
          }));

    load
      .then(({ images, totalPages: nextTotalPages }) => {
        if (cancelled) return;
        setTotalPages(nextTotalPages);
        setAssets((prev) => (page === 1 ? images : [...prev, ...images]));
        if (tag && images.length === 0 && page === 1 && !didTagFallback) {
          setDidTagFallback(true);
          setEmptyTagHint(tag);
          setPage(1);
          setAssets([]);
          setTag("");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (page === 1) setAssets([]);
        setError(
          err instanceof Error ? err.message : "Failed to load media library",
        );
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
  }, [open, tag, didTagFallback, source, page]);

  const visibleAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => {
      const haystack = [
        asset.label,
        asset.alt,
        asset.title,
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
          mediaImageId:
            asset.mediaImageId ?? (source === "lodging" ? asset.id : undefined),
          alt: asset.alt,
          title: asset.title,
          category,
        } satisfies MediaMultiPickResult,
      ];
    });
    onConfirm(items);
    onClose();
  }

  const canLoadMore = page < totalPages;

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
              Click photos to multi-select, then add them
              {source === "lodging" ? " to this room" : " to this section"}.
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
              setPage(1);
              setAssets([]);
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
                setDidTagFallback(false);
                setPage(1);
                setAssets([]);
                setTag(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {emptyTagHint ? (
          <p className="admin-tip-banner admin-tip-banner--inline">
            No library images tagged “{emptyTagHint}”. Showing all media — pick
            photos below, or upload on the{" "}
            <Link href="/admin/media">Media</Link> page.
          </p>
        ) : null}

        {error ? <p className="admin-error">{error}</p> : null}

        {loading ? (
          <div className="admin-media-picker-grid" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <div key={index} className="admin-media-skeleton" />
            ))}
          </div>
        ) : null}

        {!loading && visibleAssets.length > 0 ? (
          <div className="admin-media-picker-grid">
            {visibleAssets.map((asset) => {
              const selected = selectedIds.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`admin-media-pick ${selected ? "admin-media-pick--selected" : ""}`}
                  onClick={() => toggle(asset.id)}
                  aria-pressed={selected}
                >
                  {/* biome-ignore lint/performance/noImgElement: admin preview */}
                  <img
                    src={asset.thumbUrl}
                    alt={asset.label}
                    loading="lazy"
                    decoding="async"
                  />
                  {selected ? (
                    <span className="admin-media-pick-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                  <span className="admin-media-pick-label">{asset.label}</span>
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

        {canLoadMore ? (
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
              {error
                ? "Could not load the library."
                : tag
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
                    setPage(1);
                    setAssets([]);
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
              <Link
                href="/admin/media"
                className="admin-btn-sm admin-btn-sm--ghost"
              >
                Open Media library
              </Link>
            </div>
          </div>
        ) : null}

        <div className="admin-modal-footer">
          <p className="admin-hint" style={{ margin: 0 }}>
            {selectedIds.length} selected
            {visibleAssets.length > 0 ? ` · ${visibleAssets.length} shown` : ""}
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
