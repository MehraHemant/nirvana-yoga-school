"use client";

import type { OverviewMediaItem, OverviewModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ImageField } from "../ImageField";
import { ListRowActions } from "../ListRowActions";
import { SectionIdField } from "../SectionIdField";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type OverviewModuleEditorProps = ModulePanelProps & {
  overview: OverviewModule;
  onChange: (overview: OverviewModule) => void;
};

const EMPTY_MEDIA: OverviewMediaItem = { type: "image", url: "", alt: "" };

/**
 * Overview module editor — lead/supporting copy, media table, and glance grid.
 *
 * @param props - Overview config and change handler
 */
export function OverviewModuleEditor({
  overview,
  onChange,
  panelId = "module-overview",
  step = 3,
  description,
  open,
  onOpenChange,
}: OverviewModuleEditorProps) {
  const mediaKeys = useStableListKeys(overview.media.items.length);
  const glanceKeys = useStableListKeys(overview.glance.length);

  function updateMedia(index: number, patch: Partial<OverviewMediaItem>) {
    const items = [...overview.media.items];
    items[index] = { ...items[index], ...patch };
    onChange({ ...overview, media: { ...overview.media, items } });
  }

  function handleMediaReorder(fromIndex: number, toIndex: number) {
    mediaKeys.reorderKeys(fromIndex, toIndex);
    const items = withSortField(
      reorderItems(overview.media.items, fromIndex, toIndex),
    ) as typeof overview.media.items;
    onChange({ ...overview, media: { ...overview.media, items } });
  }

  function addMedia() {
    mediaKeys.addKey();
    onChange({
      ...overview,
      media: {
        ...overview.media,
        items: [...overview.media.items, { ...EMPTY_MEDIA }],
      },
    });
  }

  function handleGlanceReorder(fromIndex: number, toIndex: number) {
    glanceKeys.reorderKeys(fromIndex, toIndex);
    const glance = withSortField(
      reorderItems(overview.glance, fromIndex, toIndex),
    ) as typeof overview.glance;
    onChange({ ...overview, glance });
  }

  function addGlance() {
    glanceKeys.addKey();
    onChange({
      ...overview,
      glance: [...overview.glance, { label: "", value: "", hint: "" }],
    });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Overview"
      subtitle={`${overview.media.items.length} media · ${overview.glance.length} glance`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={overview.live}
          onChange={(live) => onChange({ ...overview, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={overview._id}
        onChange={(_id) => onChange({ ...overview, _id })}
      />
      <div className="admin-grid-2">
        <TextField
          label="Eyebrow"
          value={overview.eyebrow}
          onChange={(eyebrow) => onChange({ ...overview, eyebrow })}
        />
        <TextField
          label="Title"
          value={overview.title}
          onChange={(title) => onChange({ ...overview, title })}
        />
      </div>
      <TextField
        label="Lead description"
        value={overview.lead}
        onChange={(lead) => onChange({ ...overview, lead })}
        multiline
        rows={10}
        hint="Full overview body — no length limit."
      />
      <TextField
        label="Supporting copy"
        value={overview.supportingCopy ?? ""}
        onChange={(supportingCopy) => onChange({ ...overview, supportingCopy })}
        multiline
        rows={8}
        hint="Optional second paragraph — no length limit."
      />

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Media</span>
            <p className="admin-hint admin-hint--tight">
              Right-side image, video, or carousel for the overview section.
            </p>
          </div>
          <button type="button" className="admin-btn-sm" onClick={addMedia}>
            Add media
          </button>
        </div>

        <label className="admin-label" htmlFor="media-mode">
          Display mode
        </label>
        <select
          id="media-mode"
          className="admin-input admin-input--compact admin-input--inline"
          value={overview.media.mode}
          onChange={(e) =>
            onChange({
              ...overview,
              media: {
                ...overview.media,
                mode: e.target.value as OverviewModule["media"]["mode"],
              },
            })
          }
        >
          <option value="image">Single image</option>
          <option value="video">Video</option>
          <option value="carousel">Image carousel</option>
        </select>

        {overview.media.items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No media yet.</p>
            <button type="button" className="admin-btn-sm" onClick={addMedia}>
              Add first media
            </button>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--form admin-compact-table--overview-media">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--type">
                  Type
                </span>
                <span className="admin-compact-col admin-compact-col--image">
                  Media
                </span>
                <span className="admin-compact-col admin-compact-col--alt">
                  Alt text
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <span className="sr-only">Actions</span>
                </span>
              </div>
              <SortableList ids={mediaKeys.keys} onReorder={handleMediaReorder}>
                {overview.media.items.map((item, index) => (
                  <SortableRow
                    key={mediaKeys.keys[index]}
                    id={mediaKeys.keys[index]}
                  >
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row admin-compact-table-row--tall">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--type">
                          <select
                            className="admin-input admin-input--compact"
                            value={item.type}
                            aria-label={`Media type ${index + 1}`}
                            onChange={(e) =>
                              updateMedia(index, {
                                type: e.target.value as "image" | "video",
                              })
                            }
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </span>
                        <span className="admin-compact-col admin-compact-col--image">
                          {item.type === "image" ? (
                            <div className="admin-image-cell">
                              <ImageField
                                label={`Overview media ${index + 1}`}
                                value={item.url}
                                hideLabel
                                compact
                                onChange={(url) => updateMedia(index, { url })}
                              />
                            </div>
                          ) : (
                            <input
                              className="admin-input admin-input--compact"
                              value={item.url}
                              placeholder="YouTube URL or video ID"
                              aria-label={`Video URL ${index + 1}`}
                              onChange={(e) =>
                                updateMedia(index, { url: e.target.value })
                              }
                            />
                          )}
                        </span>
                        <span className="admin-compact-col admin-compact-col--alt">
                          {item.type === "image" ? (
                            <input
                              className="admin-input admin-input--compact"
                              value={item.alt ?? ""}
                              placeholder="Describe the image"
                              aria-label={`Alt text ${index + 1}`}
                              onChange={(e) =>
                                updateMedia(index, { alt: e.target.value })
                              }
                            />
                          ) : (
                            <span className="admin-muted-cell">—</span>
                          )}
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => {
                              mediaKeys.removeKey(index);
                              onChange({
                                ...overview,
                                media: {
                                  ...overview.media,
                                  items: overview.media.items.filter(
                                    (_, i) => i !== index,
                                  ),
                                },
                              });
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </SortableList>
            </div>
          </div>
        )}
      </div>

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Course at a glance</span>
            <p className="admin-hint admin-hint--tight">
              Spec chips under the overview (level, duration, fee, etc.).
            </p>
          </div>
          <button type="button" className="admin-btn-sm" onClick={addGlance}>
            Add row
          </button>
        </div>

        {overview.glance.length === 0 ? (
          <div className="admin-empty-card">
            <p>No glance items yet.</p>
            <button type="button" className="admin-btn-sm" onClick={addGlance}>
              Add first row
            </button>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--form admin-compact-table--glance">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--label">
                  Label
                </span>
                <span className="admin-compact-col admin-compact-col--value">
                  Value
                </span>
                <span className="admin-compact-col admin-compact-col--hint">
                  Hint
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <span className="sr-only">Actions</span>
                </span>
              </div>
              <SortableList
                ids={glanceKeys.keys}
                onReorder={handleGlanceReorder}
              >
                {overview.glance.map((item, index) => (
                  <SortableRow
                    key={glanceKeys.keys[index]}
                    id={glanceKeys.keys[index]}
                  >
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--label">
                          <input
                            className="admin-input admin-input--compact"
                            value={item.label}
                            placeholder="Focus Level"
                            aria-label={`Glance label ${index + 1}`}
                            onChange={(e) => {
                              const glance = [...overview.glance];
                              glance[index] = {
                                ...item,
                                label: e.target.value,
                              };
                              onChange({ ...overview, glance });
                            }}
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--value">
                          <input
                            className="admin-input admin-input--compact"
                            value={item.value}
                            placeholder="Beginner+"
                            aria-label={`Glance value ${index + 1}`}
                            onChange={(e) => {
                              const glance = [...overview.glance];
                              glance[index] = {
                                ...item,
                                value: e.target.value,
                              };
                              onChange({ ...overview, glance });
                            }}
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--hint">
                          <input
                            className="admin-input admin-input--compact"
                            value={item.hint ?? ""}
                            placeholder="Optional hint"
                            aria-label={`Glance hint ${index + 1}`}
                            onChange={(e) => {
                              const glance = [...overview.glance];
                              glance[index] = { ...item, hint: e.target.value };
                              onChange({ ...overview, glance });
                            }}
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => {
                              glanceKeys.removeKey(index);
                              onChange({
                                ...overview,
                                glance: overview.glance.filter(
                                  (_, i) => i !== index,
                                ),
                              });
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </SortableList>
            </div>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
