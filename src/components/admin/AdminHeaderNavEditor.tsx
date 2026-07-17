"use client";

import type { NavItem, NavLink } from "@/content/data/navigation/types";
import type { PageType } from "@/content/types/page-ref";
import { ChevronDown, Copy, Link as LinkIcon, Plus, Trash } from "@/icons";
import {
  DragHandle,
  SortableList,
  SortableRow,
  reorderItems,
} from "./SortableList";
import { useStableListKeys } from "./useStableListKeys";

type AdminHeaderNavEditorProps = {
  /** Current primary nav tree */
  navigation: NavItem[];
  /** Called whenever the nav tree changes */
  onChange: (navigation: NavItem[]) => void;
};

const PAGE_TYPES: PageType[] = ["site", "course", "online", "retreat", "venue"];

/**
 * Deep-clones a nav tree for immutable edits.
 *
 * @param navigation - Source nav items
 */
function cloneNav(navigation: NavItem[]): NavItem[] {
  return structuredClone(navigation);
}

/**
 * Compact drag-and-drop editor for the live site header navigation tree.
 * Top-level order and dropdown children are persisted as the JSON array
 * order in global header settings (and mirrored to `navigation_items.sort_order`).
 *
 * @param props - Controlled navigation value and change handler
 */
export function AdminHeaderNavEditor({
  navigation,
  onChange,
}: AdminHeaderNavEditorProps) {
  const { keys, addKey, removeKey, insertKey, reorderKeys } = useStableListKeys(
    navigation.length,
  );

  const update = (next: NavItem[]) => onChange(next);

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    update(reorderItems(navigation, fromIndex, toIndex));
  }

  return (
    <div className="admin-nav-editor">
      <div className="admin-nav-editor-toolbar">
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => {
            addKey();
            update([
              ...navigation,
              { type: "link", label: "NEW LINK", href: "/" },
            ]);
          }}
        >
          <Plus size={14} /> Link
        </button>
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => {
            addKey();
            update([
              ...navigation,
              {
                type: "dropdown",
                label: "NEW MENU",
                items: [{ label: "First item", href: "/" }],
              },
            ]);
          }}
        >
          <Plus size={14} /> Dropdown
        </button>
      </div>

      {navigation.length === 0 ? (
        <p className="admin-hint">No menu items yet. Add a link or dropdown.</p>
      ) : null}

      <SortableList
        ids={keys}
        onReorder={handleReorder}
        className="admin-nav-editor-list"
      >
        {navigation.map((item, index) => (
          <SortableRow
            key={keys[index]}
            id={keys[index]}
            className="admin-nav-editor-item"
          >
            {({ dragHandleProps }) => (
              <>
                <div className="admin-nav-editor-row">
                  <DragHandle dragHandleProps={dragHandleProps} />
                  <span
                    className={`admin-nav-editor-badge${item.type === "dropdown" ? " admin-nav-editor-badge--dropdown" : ""}`}
                  >
                    {item.type === "dropdown" ? (
                      <ChevronDown size={12} />
                    ) : (
                      <LinkIcon size={12} />
                    )}
                    {item.type === "dropdown" ? "Menu" : "Link"}
                  </span>
                  <input
                    className="admin-input admin-nav-editor-label"
                    value={item.label}
                    aria-label="Menu label"
                    onChange={(event) => {
                      const next = cloneNav(navigation);
                      next[index] = { ...next[index], label: event.target.value };
                      update(next);
                    }}
                  />
                  <input
                    className="admin-input admin-nav-editor-target"
                    value={item.href ?? ""}
                    aria-label="Href"
                    placeholder="Href (optional)"
                    onChange={(event) => {
                      const next = cloneNav(navigation);
                      next[index] = {
                        ...next[index],
                        href: event.target.value || undefined,
                      };
                      update(next);
                    }}
                  />
                  <div className="admin-list-row-actions admin-list-row-actions--icons">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label="Copy item"
                      title="Copy"
                      onClick={() => {
                        const copy = cloneNav([item])[0];
                        copy.label = `${copy.label} (copy)`;
                        const next = cloneNav(navigation);
                        next.splice(index + 1, 0, copy);
                        insertKey(index + 1);
                        update(next);
                      }}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--danger"
                      aria-label="Remove item"
                      title="Remove"
                      onClick={() => {
                        removeKey(index);
                        update(navigation.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {item.type === "dropdown" ? (
                  <DropdownChildren
                    items={item.items}
                    onChange={(items) => {
                      const next = cloneNav(navigation);
                      const current = next[index];
                      if (current.type !== "dropdown") return;
                      current.items = items;
                      update(next);
                    }}
                  />
                ) : null}
              </>
            )}
          </SortableRow>
        ))}
      </SortableList>
    </div>
  );
}

type DropdownChildrenProps = {
  items: NavLink[];
  onChange: (items: NavLink[]) => void;
};

/**
 * Drag-reorderable child-link rows for a dropdown menu.
 *
 * @param props - Child links and change handler
 */
function DropdownChildren({ items, onChange }: DropdownChildrenProps) {
  const { keys, addKey, removeKey, insertKey, reorderKeys } = useStableListKeys(
    items.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(items, fromIndex, toIndex));
  }

  return (
    <div className="admin-nav-editor-children">
      {items.length === 0 ? (
        <p className="admin-hint admin-hint--tight">No items in this menu yet.</p>
      ) : (
        <SortableList
          ids={keys}
          onReorder={handleReorder}
          className="admin-nav-editor-children-list"
        >
          {items.map((child, index) => {
            const isHref = "href" in child;
            return (
              <SortableRow key={keys[index]} id={keys[index]}>
                {({ dragHandleProps }) => (
                  <div className="admin-nav-editor-child-row">
                    <DragHandle dragHandleProps={dragHandleProps} />
                    <input
                      className="admin-input admin-nav-editor-label"
                      value={child.label}
                      aria-label="Child label"
                      onChange={(event) => {
                        const next = structuredClone(items);
                        next[index] = {
                          ...next[index],
                          label: event.target.value,
                        };
                        onChange(next);
                      }}
                    />
                    <select
                      className="admin-input admin-nav-editor-kind"
                      value={isHref ? "href" : "page"}
                      aria-label="Child kind"
                      onChange={(event) => {
                        if (event.target.value === "href") {
                          onChange(
                            items.map((link, i) =>
                              i === index
                                ? { label: link.label, href: "/" }
                                : link,
                            ),
                          );
                        } else {
                          onChange(
                            items.map((link, i) =>
                              i === index
                                ? {
                                    label: link.label,
                                    type: "online" as const,
                                    slug: "",
                                  }
                                : link,
                            ),
                          );
                        }
                      }}
                    >
                      <option value="href">Href</option>
                      <option value="page">Page</option>
                    </select>
                    {isHref ? (
                      <input
                        className="admin-input admin-nav-editor-target"
                        value={child.href}
                        aria-label="Child href"
                        placeholder="/path"
                        onChange={(event) => {
                          const next = structuredClone(items);
                          next[index] = { ...child, href: event.target.value };
                          onChange(next);
                        }}
                      />
                    ) : (
                      <>
                        <select
                          className="admin-input admin-nav-editor-kind"
                          value={child.type}
                          aria-label="Page type"
                          onChange={(event) => {
                            const next = structuredClone(items);
                            next[index] = {
                              ...child,
                              type: event.target.value as PageType,
                            };
                            onChange(next);
                          }}
                        >
                          {PAGE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <input
                          className="admin-input admin-nav-editor-target"
                          value={child.slug}
                          aria-label="Page slug"
                          placeholder="page-slug"
                          onChange={(event) => {
                            const next = structuredClone(items);
                            next[index] = {
                              ...child,
                              slug: event.target.value,
                            };
                            onChange(next);
                          }}
                        />
                      </>
                    )}
                    <div className="admin-list-row-actions admin-list-row-actions--icons">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        aria-label="Copy child"
                        title="Copy"
                        onClick={() => {
                          const copy = structuredClone(child);
                          copy.label = `${copy.label} (copy)`;
                          const next = structuredClone(items);
                          next.splice(index + 1, 0, copy);
                          insertKey(index + 1);
                          onChange(next);
                        }}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        aria-label="Remove child"
                        title="Remove"
                        onClick={() => {
                          removeKey(index);
                          onChange(items.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </SortableRow>
            );
          })}
        </SortableList>
      )}
      <div className="admin-nav-editor-toolbar admin-nav-editor-toolbar--nested">
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => {
            addKey();
            onChange([...items, { label: "New item", href: "/" }]);
          }}
        >
          <Plus size={14} /> Href item
        </button>
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => {
            addKey();
            onChange([
              ...items,
              { label: "New page", type: "online", slug: "" },
            ]);
          }}
        >
          <Plus size={14} /> Page item
        </button>
      </div>
    </div>
  );
}
