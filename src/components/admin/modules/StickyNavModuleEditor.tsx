"use client";

import {
  DEFAULT_ONLINE_NAV,
  DEFAULT_RESIDENTIAL_NAV,
  DEFAULT_SITE_NAV,
} from "@/content/page-modules-defaults";
import type { StickyNavItem } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { COMMON_ANCHORS } from "./ModuleNav";
import type { ModulePanelProps } from "./types";

type StickyNavModuleEditorProps = ModulePanelProps & {
  items: StickyNavItem[];
  onChange: (items: StickyNavItem[]) => void;
};

const NAV_PRESETS: { label: string; items: StickyNavItem[] }[] = [
  { label: "Course page", items: DEFAULT_RESIDENTIAL_NAV },
  { label: "Site page", items: DEFAULT_SITE_NAV },
  { label: "Online course", items: DEFAULT_ONLINE_NAV },
];

/**
 * Sticky navigation module editor — anchor tags and labels.
 *
 * @param props - Nav items, panel state, and change handler
 */
export function StickyNavModuleEditor({
  items,
  onChange,
  panelId = "module-sticky-nav",
  step = 2,
  description = "Links that stick below the hero — must match section IDs on the page (e.g. #overview).",
  open,
  onOpenChange,
  hideLibraryActions = false,
}: StickyNavModuleEditorProps) {
  function updateItem(index: number, patch: Partial<StickyNavItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const usedAnchors = new Set(items.map((item) => item.id));
  const quickAdd = COMMON_ANCHORS.filter(
    (anchor) => !usedAnchors.has(anchor.id),
  );

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Sticky navigation"
      subtitle={`${items.length} links`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="stickyNav"
            payload={{ items }}
            hasContent={items.length > 0}
            onInsert={(payload) =>
              onChange((payload as { items: StickyNavItem[] }).items)
            }
          />
        )
      }
    >
      <div className="admin-preset-row">
        <span className="admin-preset-label">Load preset:</span>
        {NAV_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() => onChange([...preset.items])}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {quickAdd.length > 0 ? (
        <div className="admin-quick-add">
          <span className="admin-preset-label">Quick add:</span>
          <div className="admin-quick-add-chips">
            {quickAdd.map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                className="admin-chip"
                onClick={() =>
                  onChange([
                    ...items,
                    {
                      id: anchor.id,
                      label: anchor.label,
                      shortLabel: anchor.shortLabel,
                    },
                  ])
                }
              >
                + {anchor.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No navigation links yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() =>
              onChange([
                { id: "#overview", label: "Overview", shortLabel: "Overview" },
              ])
            }
          >
            Add first link
          </button>
        </div>
      ) : (
        <div className="admin-compact-table admin-compact-table--form admin-compact-table--nav">
          <div className="admin-compact-table-head admin-compact-table-row">
            <span className="admin-compact-col admin-compact-col--num">#</span>
            <span className="admin-compact-col admin-compact-col--anchor">
              Anchor
            </span>
            <span className="admin-compact-col admin-compact-col--short">
              Short label
            </span>
            <span className="admin-compact-col admin-compact-col--full">
              Full label
            </span>
            <span className="admin-compact-col admin-compact-col--actions" />
          </div>
          {items.map((item, index) => (
            <div
              key={`nav-${item.id}-${index}`}
              className="admin-compact-table-row"
            >
              <span className="admin-compact-col admin-compact-col--num">
                {index + 1}
              </span>
              <span className="admin-compact-col admin-compact-col--anchor">
                <input
                  className="admin-input admin-input--compact"
                  value={item.id}
                  placeholder="#overview"
                  onChange={(event) => {
                    const id = event.target.value;
                    updateItem(index, {
                      id: id.startsWith("#")
                        ? (id as StickyNavItem["id"])
                        : (`#${id}` as StickyNavItem["id"]),
                    });
                  }}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--short">
                <input
                  className="admin-input admin-input--compact"
                  value={item.shortLabel}
                  placeholder="Overview"
                  onChange={(event) =>
                    updateItem(index, { shortLabel: event.target.value })
                  }
                />
              </span>
              <span className="admin-compact-col admin-compact-col--full">
                <input
                  className="admin-input admin-input--compact"
                  value={item.label}
                  placeholder="Overview section"
                  onChange={(event) =>
                    updateItem(index, { label: event.target.value })
                  }
                />
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <ListRowActions
                  index={index}
                  total={items.length}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={() => onChange(items.filter((_, i) => i !== index))}
                />
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange([
            ...items,
            { id: "#section", label: "New section", shortLabel: "New" },
          ])
        }
      >
        Add nav item
      </button>
    </CollapsiblePanel>
  );
}
