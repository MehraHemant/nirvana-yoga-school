"use client";

import {
  DEFAULT_ONLINE_HUB_NAV,
  DEFAULT_ONLINE_NAV,
  DEFAULT_RESIDENTIAL_NAV,
  DEFAULT_SITE_NAV,
} from "@/content/page-modules-defaults";
import type { StickyNavItem } from "@/content/types";
import { Plus } from "@/icons";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { SectionIdField } from "../SectionIdField";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "../SortableList";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import { COMMON_ANCHORS } from "./ModuleNav";
import type { ModulePanelProps } from "./types";

type StickyNavModuleEditorProps = ModulePanelProps & {
  items: StickyNavItem[];
  onChange: (items: StickyNavItem[]) => void;
  /** Optional live flag for the sticky nav module */
  live?: boolean;
  /** Persist sticky-nav live flag */
  onLiveChange?: (live: boolean) => void;
  /** Optional HTML `_id` for the sticky nav band */
  sectionId?: string;
  /** Persist sticky-nav `_id` */
  onSectionIdChange?: (value: string) => void;
};

const NAV_PRESETS: { label: string; items: StickyNavItem[] }[] = [
  { label: "Course page", items: DEFAULT_RESIDENTIAL_NAV },
  { label: "Site page", items: DEFAULT_SITE_NAV },
  { label: "Online course", items: DEFAULT_ONLINE_NAV },
  { label: "Online hub", items: DEFAULT_ONLINE_HUB_NAV },
];

const EMPTY_ITEM: StickyNavItem = {
  id: "#section",
  label: "New section",
  shortLabel: "New",
};

/**
 * Ensures an anchor value starts with `#` while typing (empty stays empty).
 *
 * @param value - Raw input from the anchor field
 * @returns Anchor id suitable for sticky nav
 */
function normalizeAnchorId(value: string): StickyNavItem["id"] {
  if (!value) return "" as StickyNavItem["id"];
  return (value.startsWith("#") ? value : `#${value}`) as StickyNavItem["id"];
}

/**
 * Sticky navigation module editor — anchor tags and labels.
 *
 * @param props - Nav items, panel state, and change handler
 */
export function StickyNavModuleEditor({
  items,
  onChange,
  live,
  onLiveChange,
  sectionId,
  onSectionIdChange,
  panelId = "module-sticky-nav",
  step = 2,
  description = "Links that stick below the hero — anchors must match section IDs on the page (e.g. #overview).",
  open,
  onOpenChange,
}: StickyNavModuleEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    items.length,
  );

  function updateItem(index: number, patch: Partial<StickyNavItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(
      withSortField(reorderItems(items, fromIndex, toIndex)) as StickyNavItem[],
    );
  }

  function addItem(item: StickyNavItem = EMPTY_ITEM) {
    addKey();
    onChange([...items, item]);
  }

  function applyPreset(presetItems: StickyNavItem[]) {
    if (
      items.length > 0 &&
      !window.confirm("Replace the current sticky nav links with this preset?")
    ) {
      return;
    }
    onChange(presetItems.map((item) => ({ ...item })));
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
        onLiveChange ? (
          <ModuleLiveField
            id={`${panelId}-live`}
            value={live}
            onChange={onLiveChange}
          />
        ) : null
      }
    >
      {onSectionIdChange ? (
        <SectionIdField
          fieldId={`${panelId}-section-id`}
          value={sectionId}
          onChange={onSectionIdChange}
        />
      ) : null}
      <div className="admin-sticky-nav-toolbar">
        <div className="admin-sticky-nav-toolbar-block">
          <span className="admin-preset-label">Load preset</span>
          <div className="admin-sticky-nav-preset-btns">
            {NAV_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                title={`Load ${preset.label} links (${preset.items.length})`}
                onClick={() => applyPreset(preset.items)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {quickAdd.length > 0 ? (
          <div className="admin-sticky-nav-toolbar-block">
            <span className="admin-preset-label">Quick add</span>
            <div className="admin-quick-add-chips">
              {quickAdd.map((anchor) => (
                <button
                  key={anchor.id}
                  type="button"
                  className="admin-chip"
                  title={`Add ${anchor.id}`}
                  onClick={() =>
                    addItem({
                      id: anchor.id,
                      label: anchor.label,
                      shortLabel: anchor.shortLabel,
                    })
                  }
                >
                  <Plus size={12} aria-hidden />
                  {anchor.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Nav links</span>
            <p className="admin-hint admin-hint--tight">
              Short label shows on mobile; full label on desktop.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => addItem()}
          >
            Add link
          </button>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No navigation links yet.</p>
            <div className="admin-empty-card-actions">
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() =>
                  addItem({
                    id: "#overview",
                    label: "Overview",
                    shortLabel: "Overview",
                  })
                }
              >
                Add first link
              </button>
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={() => applyPreset(DEFAULT_RESIDENTIAL_NAV)}
              >
                Load course preset
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--form admin-compact-table--nav">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--anchor">
                  Anchor
                </span>
                <span className="admin-compact-col admin-compact-col--short">
                  Short
                </span>
                <span className="admin-compact-col admin-compact-col--full">
                  Full label
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <span className="sr-only">Actions</span>
                </span>
              </div>
              <SortableList ids={keys} onReorder={handleReorder}>
                {items.map((item, index) => {
                  const listId = `sticky-nav-anchors-${keys[index]}`;
                  return (
                    <SortableRow key={keys[index]} id={keys[index]}>
                      {({ dragHandleProps }) => (
                        <div className="admin-compact-table-row">
                          <span className="admin-compact-col admin-compact-col--num">
                            {index + 1}
                          </span>
                          <span className="admin-compact-col admin-compact-col--anchor">
                            <input
                              className="admin-input admin-input--compact admin-input--mono"
                              value={item.id}
                              placeholder="#overview"
                              list={listId}
                              spellCheck={false}
                              onChange={(event) =>
                                updateItem(index, {
                                  id: normalizeAnchorId(event.target.value),
                                })
                              }
                            />
                            <datalist id={listId}>
                              {COMMON_ANCHORS.map((anchor) => (
                                <option key={anchor.id} value={anchor.id}>
                                  {anchor.label}
                                </option>
                              ))}
                            </datalist>
                          </span>
                          <span className="admin-compact-col admin-compact-col--short">
                            <input
                              className="admin-input admin-input--compact"
                              value={item.shortLabel}
                              placeholder="Overview"
                              onChange={(event) =>
                                updateItem(index, {
                                  shortLabel: event.target.value,
                                })
                              }
                            />
                          </span>
                          <span className="admin-compact-col admin-compact-col--full">
                            <input
                              className="admin-input admin-input--compact"
                              value={item.label}
                              placeholder="Overview section"
                              onChange={(event) => {
                                const label = event.target.value;
                                const prev = items[index];
                                const shouldSyncShort =
                                  !prev.shortLabel ||
                                  prev.shortLabel === prev.label;
                                updateItem(index, {
                                  label,
                                  ...(shouldSyncShort
                                    ? { shortLabel: label }
                                    : {}),
                                });
                              }}
                            />
                          </span>
                          <span className="admin-compact-col admin-compact-col--actions">
                            <ListRowActions
                              dragHandleProps={dragHandleProps}
                              onRemove={() => {
                                removeKey(index);
                                onChange(items.filter((_, i) => i !== index));
                              }}
                            />
                          </span>
                        </div>
                      )}
                    </SortableRow>
                  );
                })}
              </SortableList>
            </div>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
