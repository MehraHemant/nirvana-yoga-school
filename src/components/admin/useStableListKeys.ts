"use client";

import { useEffect, useState } from "react";
import { reorderItems } from "./SortableList";

/**
 * Creates a batch of unique row keys.
 *
 * @param count - How many keys to generate
 * @returns Fresh UUID list
 */
function createKeys(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

/**
 * Stable React keys for editable CMS rows that have no persisted id.
 * Call `addKey` / `removeKey` / `reorderKeys` alongside list mutations so keys stay aligned.
 *
 * @param length - Current list length (keeps keys in sync if length changes)
 * @returns Keys plus helpers for add/remove/reorder
 */
export function useStableListKeys(length: number) {
  const [keys, setKeys] = useState(() => createKeys(length));

  useEffect(() => {
    setKeys((prev) => {
      if (prev.length === length) return prev;
      if (prev.length < length) {
        return [...prev, ...createKeys(length - prev.length)];
      }
      return prev.slice(0, length);
    });
  }, [length]);

  return {
    keys,
    /** Append a key when a row is added */
    addKey() {
      setKeys((prev) => [...prev, crypto.randomUUID()]);
    },
    /**
     * Drop the key at `index` when a row is removed.
     *
     * @param index - Row index being removed
     */
    removeKey(index: number) {
      setKeys((prev) => prev.filter((_, i) => i !== index));
    },
    /**
     * Insert a fresh key at `index` (e.g. after duplicating a row).
     *
     * @param index - Insertion index for the new key
     */
    insertKey(index: number) {
      setKeys((prev) => {
        const next = [...prev];
        next.splice(index, 0, crypto.randomUUID());
        return next;
      });
    },
    /**
     * Reorder keys to match a drag-and-drop move.
     *
     * @param fromIndex - Drag source index
     * @param toIndex - Drop target index
     */
    reorderKeys(fromIndex: number, toIndex: number) {
      setKeys((prev) => reorderItems(prev, fromIndex, toIndex));
    },
    /**
     * Swap keys with an adjacent row when reordering.
     *
     * @param index - Row being moved
     * @param direction - `-1` up, `1` down
     * @deprecated Prefer {@link reorderKeys} with drag-and-drop
     */
    moveKey(index: number, direction: -1 | 1) {
      setKeys((prev) => {
        const target = index + direction;
        if (target < 0 || target >= prev.length) return prev;
        return reorderItems(prev, index, target);
      });
    },
  };
}
