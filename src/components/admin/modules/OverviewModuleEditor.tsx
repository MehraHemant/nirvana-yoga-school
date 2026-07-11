"use client";

import type { OverviewModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ImageField } from "../ImageField";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { TextField } from "../TextField";
import type { ModulePanelProps } from "./types";

type OverviewModuleEditorProps = ModulePanelProps & {
  overview: OverviewModule;
  onChange: (overview: OverviewModule) => void;
};

/**
 * Overview module editor — eyebrow, title, copy, media, quote, glance grid.
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
  hideLibraryActions = false,
}: OverviewModuleEditorProps) {
  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Overview"
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="overview"
            payload={overview}
            hasContent={Boolean(
              overview.title?.trim() || overview.lead?.trim(),
            )}
            onInsert={(payload) => onChange(payload as OverviewModule)}
          />
        )
      }
    >
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
        label="Lead description (left column)"
        value={overview.lead}
        onChange={(lead) => onChange({ ...overview, lead })}
        multiline
        rows={6}
      />
      <TextField
        label="Supporting copy"
        value={overview.supportingCopy ?? ""}
        onChange={(supportingCopy) => onChange({ ...overview, supportingCopy })}
        multiline
        rows={3}
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="media-mode">
          Right panel media mode
        </label>
        <select
          id="media-mode"
          className="admin-input"
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
      </div>

      {overview.media.items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: media rows lack stable ids
        <div key={`media-${index}`} className="admin-nested-card">
          <div className="admin-field">
            <label className="admin-label" htmlFor={`media-type-${index}`}>
              Media type
            </label>
            <select
              id={`media-type-${index}`}
              className="admin-input"
              value={item.type}
              onChange={(e) => {
                const items = [...overview.media.items];
                items[index] = {
                  ...item,
                  type: e.target.value as "image" | "video",
                };
                onChange({ ...overview, media: { ...overview.media, items } });
              }}
            >
              <option value="image">Image</option>
              <option value="video">Video / YouTube ID</option>
            </select>
          </div>
          {item.type === "image" ? (
            <ImageField
              label="Image"
              value={item.url}
              onChange={(url) => {
                const items = [...overview.media.items];
                items[index] = { ...item, url };
                onChange({ ...overview, media: { ...overview.media, items } });
              }}
            />
          ) : (
            <TextField
              label="Video URL or YouTube ID"
              value={item.url}
              onChange={(url) => {
                const items = [...overview.media.items];
                items[index] = { ...item, url };
                onChange({ ...overview, media: { ...overview.media, items } });
              }}
            />
          )}
          <TextField
            label="Media title"
            value={item.title ?? ""}
            onChange={(title) => {
              const items = [...overview.media.items];
              items[index] = { ...item, title };
              onChange({ ...overview, media: { ...overview.media, items } });
            }}
          />
          <TextField
            label="Media description"
            value={item.description ?? ""}
            onChange={(description) => {
              const items = [...overview.media.items];
              items[index] = { ...item, description };
              onChange({ ...overview, media: { ...overview.media, items } });
            }}
            multiline
          />
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() => {
              const items = overview.media.items.filter((_, i) => i !== index);
              onChange({ ...overview, media: { ...overview.media, items } });
            }}
          >
            Remove media
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...overview,
            media: {
              ...overview.media,
              items: [...overview.media.items, { type: "image", url: "" }],
            },
          })
        }
      >
        Add media item
      </button>

      <TextField
        label="Quote text"
        value={overview.quote?.text ?? ""}
        onChange={(text) =>
          onChange({
            ...overview,
            quote: { text, attribution: overview.quote?.attribution ?? "" },
          })
        }
        multiline
      />
      <TextField
        label="Quote attribution"
        value={overview.quote?.attribution ?? ""}
        onChange={(attribution) =>
          onChange({
            ...overview,
            quote: { text: overview.quote?.text ?? "", attribution },
          })
        }
      />

      <p className="admin-label">Course at a glance</p>
      {overview.glance.map((item, index) => (
        <div key={`glance-${item.label}`} className="admin-nested-card">
          <div className="admin-grid-2">
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => {
                const glance = [...overview.glance];
                glance[index] = { ...item, label };
                onChange({ ...overview, glance });
              }}
            />
            <TextField
              label="Value"
              value={item.value}
              onChange={(value) => {
                const glance = [...overview.glance];
                glance[index] = { ...item, value };
                onChange({ ...overview, glance });
              }}
            />
          </div>
          <TextField
            label="Hint"
            value={item.hint ?? ""}
            onChange={(hint) => {
              const glance = [...overview.glance];
              glance[index] = { ...item, hint };
              onChange({ ...overview, glance });
            }}
          />
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() =>
              onChange({
                ...overview,
                glance: overview.glance.filter((_, i) => i !== index),
              })
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...overview,
            glance: [...overview.glance, { label: "", value: "" }],
          })
        }
      >
        Add glance item
      </button>
    </CollapsiblePanel>
  );
}
