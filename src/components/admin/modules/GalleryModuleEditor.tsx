"use client";

import { useMemo, useState } from "react";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { MediaMultiPicker } from "@/components/admin/MediaMultiPicker";
import { ModuleLiveField } from "@/components/admin/modules/ModuleLiveField";
import {
  DragHandle,
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import {
  createEmptyGalleryModule,
  flattenGallerySections,
  galleryCategoryLabel,
  normalizeGalleryVideos,
  resolveGallerySections,
  sectionOrderFromResolved,
  type ResolvedGallerySection,
} from "@/content/mappers/gallery-module";
import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import type { ModulePanelProps } from "./types";

type GalleryModuleEditorProps = ModulePanelProps & {
  gallery: GalleryModule;
  onChange: (gallery: GalleryModule) => void;
};

const SECTION_TAG_HINTS: Record<string, string> = {
  yogahall: "Yoga hall",
  dinning: "Dining",
  private: "Private room",
  "2 shared": "2 shared room",
  "3 shared": "3 shared room",
  "4 shared": "4 shared room",
  premisis: "Campus",
  campus: "Campus",
};

/**
 * Emits an updated gallery module from ordered sections.
 *
 * @param gallery - Current gallery module
 * @param sections - Ordered sections with images
 */
function commitSections(
  gallery: GalleryModule,
  sections: ResolvedGallerySection[],
): GalleryModule {
  return {
    ...gallery,
    images: flattenGallerySections(sections),
    sectionOrder: sectionOrderFromResolved(sections),
  };
}

/**
 * Admin editor for venue gallery sections, images, and videos.
 * Supports media multi-select, tag filter, and drag reorder.
 *
 * @param props - Gallery document and panel chrome
 */
export function GalleryModuleEditor({
  gallery,
  onChange,
  panelId = "module-gallery",
  step = 1,
  description = "Photo album for this venue. Add images from Media (multi-select + tag filter), organize into sections, and drag to reorder. Saves to the database.",
  open,
  onOpenChange,
}: GalleryModuleEditorProps) {
  const doc = gallery ?? createEmptyGalleryModule();
  const sections = useMemo(() => resolveGallerySections(doc), [doc]);
  const sectionKeys = useStableListKeys(sections.length);
  const [pickerSectionId, setPickerSectionId] = useState<string | null>(null);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const photoCount = doc.images?.length ?? 0;

  const pickerSection = sections.find(
    (section) => section.id === pickerSectionId,
  );

  /**
   * Updates one section and persists the full gallery document.
   *
   * @param sectionId - Section to patch
   * @param patch - Partial section fields
   */
  function updateSection(
    sectionId: string,
    patch: Partial<ResolvedGallerySection>,
  ) {
    onChange(
      commitSections(
        doc,
        sections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section,
        ),
      ),
    );
  }

  function addSection() {
    const label = newSectionLabel.trim() || "New section";
    const id = label.toLowerCase().replace(/\s+/g, " ").trim();
    if (sections.some((section) => section.id === id)) return;
    sectionKeys.addKey();
    setNewSectionLabel("");
    onChange(
      commitSections(doc, [
        ...sections,
        { id, label, description: "", images: [] },
      ]),
    );
  }

  function removeSection(sectionId: string) {
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index >= 0) sectionKeys.removeKey(index);
    onChange(
      commitSections(
        doc,
        sections.filter((section) => section.id !== sectionId),
      ),
    );
  }

  function reorderSections(fromIndex: number, toIndex: number) {
    sectionKeys.reorderKeys(fromIndex, toIndex);
    onChange(commitSections(doc, reorderItems(sections, fromIndex, toIndex)));
  }

  function reorderImages(
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      images: reorderItems(section.images, fromIndex, toIndex),
    });
  }

  function removeImage(sectionId: string, imageIndex: number) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      images: section.images.filter((_, index) => index !== imageIndex),
    });
  }

  return (
    <>
      <CollapsiblePanel
        id={panelId}
        step={step}
        title="Photo gallery"
        subtitle={`${photoCount} photos · ${sections.length} sections`}
        description={description}
        open={open}
        onOpenChange={onOpenChange}
        actions={
          <ModuleLiveField
            id={`${panelId}-live`}
            value={doc.live}
            onChange={(live) => onChange({ ...doc, live })}
          />
        }
      >
        <TextField
          label="Eyebrow"
          value={doc.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...doc, eyebrow })}
        />
        <TextField
          label="Title"
          value={doc.title ?? ""}
          onChange={(title) => onChange({ ...doc, title })}
        />
        <TextField
          label="Description"
          value={doc.description ?? ""}
          onChange={(descriptionValue) =>
            onChange({ ...doc, description: descriptionValue })
          }
          multiline
        />

        <div className="admin-nested-card">
          <TextField
            label="New section label"
            value={newSectionLabel}
            onChange={setNewSectionLabel}
            hint="e.g. Yoga Hall, Private Room, Premises"
          />
          <button type="button" className="admin-btn" onClick={addSection}>
            Add section
          </button>
        </div>

        <SortableList
          ids={sectionKeys.keys}
          onReorder={reorderSections}
          className="admin-stack"
        >
          {sections.map((section, sectionIndex) => {
            const sectionKey = sectionKeys.keys[sectionIndex];
            const imageIds = section.images.map(
              (_, imageIndex) => `${sectionKey}-img-${imageIndex}`,
            );
            return (
              <SortableRow key={sectionKey} id={sectionKey}>
                {({ dragHandleProps }) => (
                  <div className="admin-nested-card">
                    <div className="admin-row-between">
                      <div className="admin-actions">
                        <DragHandle dragHandleProps={dragHandleProps} />
                        <strong>
                          {section.label || galleryCategoryLabel(section.id)}
                        </strong>
                      </div>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => removeSection(section.id)}
                      >
                        Remove section
                      </button>
                    </div>
                    <TextField
                      label="Section label"
                      value={section.label}
                      onChange={(label) => updateSection(section.id, { label })}
                    />
                    <TextField
                      label="Section description"
                      value={section.description ?? ""}
                      onChange={(descriptionValue) =>
                        updateSection(section.id, {
                          description: descriptionValue,
                        })
                      }
                      multiline
                    />

                    <div className="admin-gallery-section-toolbar">
                      <p className="admin-hint" style={{ margin: 0 }}>
                        {section.images.length} photo
                        {section.images.length === 1 ? "" : "s"} — drag to
                        reorder
                      </p>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => setPickerSectionId(section.id)}
                      >
                        Add images from media
                      </button>
                    </div>

                    {section.images.length > 0 ? (
                      <SortableList
                        ids={imageIds}
                        layout="grid"
                        onReorder={(from, to) =>
                          reorderImages(section.id, from, to)
                        }
                        className="admin-gallery-image-grid"
                      >
                        {section.images.map((image, imageIndex) => (
                          <SortableRow
                            key={imageIds[imageIndex]}
                            id={imageIds[imageIndex]}
                            className="admin-gallery-tile-wrap"
                          >
                            {({
                              dragHandleProps: imageHandle,
                              isDragging,
                            }) => (
                              <div
                                className={`admin-gallery-tile${isDragging ? " admin-gallery-tile--dragging" : ""}`}
                              >
                                {/* biome-ignore lint/performance/noImgElement: admin preview */}
                                <img
                                  src={image.url}
                                  alt={image.alt ?? section.label}
                                />
                                <div className="admin-gallery-tile-bar">
                                  <DragHandle
                                    dragHandleProps={imageHandle}
                                  />
                                  <span className="admin-gallery-tile-name">
                                    {image.title ||
                                      image.url.split("/").pop()}
                                  </span>
                                  <button
                                    type="button"
                                    className="admin-btn-xs admin-btn-xs--danger"
                                    onClick={() =>
                                      removeImage(section.id, imageIndex)
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </SortableRow>
                        ))}
                      </SortableList>
                    ) : (
                      <div className="admin-empty-card">
                        <p>No images in this section yet.</p>
                        <div className="admin-empty-card-actions">
                          <button
                            type="button"
                            className="admin-btn-sm"
                            onClick={() => setPickerSectionId(section.id)}
                          >
                            Add images from media
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SortableRow>
            );
          })}
        </SortableList>

        <CollapsiblePanel
          title="Videos"
          subtitle="YouTube clips"
          description="Paste YouTube urls or 11-character video ids. Shown below the photo gallery."
          defaultOpen={Boolean(doc.videos?.length)}
        >
          <StringListField
            label="Video urls / ids"
            items={(doc.videos ?? []).map((video) => video.url)}
            onChange={(urls) => {
              const previous = doc.videos ?? [];
              onChange({
                ...doc,
                videos: normalizeGalleryVideos(
                  urls.map((url, index) => ({
                    url,
                    title: previous[index]?.title,
                  })),
                ),
              });
            }}
            hint="One YouTube link or id per row."
          />
        </CollapsiblePanel>
      </CollapsiblePanel>

      <MediaMultiPicker
        open={Boolean(pickerSectionId)}
        onClose={() => setPickerSectionId(null)}
        initialTag={
          pickerSectionId
            ? SECTION_TAG_HINTS[pickerSectionId]
            : undefined
        }
        title={`Add images — ${pickerSection?.label ?? "section"}`}
        onConfirm={(items) => {
          if (!pickerSectionId) return;
          const section = sections.find((item) => item.id === pickerSectionId);
          if (!section) return;
          const existing = new Set(section.images.map((image) => image.url));
          const nextImages: SitePageGalleryImage[] = [
            ...section.images,
            ...items
              .filter((item) => !existing.has(item.url))
              .map((item) => ({
                url: item.url,
                category: pickerSectionId,
                alt: item.alt,
                title: item.title,
                type: "image" as const,
                mediaAssetId: item.mediaAssetId,
              })),
          ];
          updateSection(pickerSectionId, { images: nextImages });
        }}
      />
    </>
  );
}
