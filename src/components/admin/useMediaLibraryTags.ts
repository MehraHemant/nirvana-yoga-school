"use client";

import { useEffect, useState } from "react";
import { fetchAdminMedia } from "@/lib/api/admin-client";
import { mergeMediaTagOptions } from "@/lib/cdn/media-tags";

/**
 * Preset tags plus custom tags already stored on media.
 *
 * @param enabled - Skip the request until the form is open
 */
export function useMediaLibraryTags(enabled = true): string[] {
  const [tags, setTags] = useState<string[]>(() => mergeMediaTagOptions());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchAdminMedia({ page: 1, limit: 1 })
      .then((body) => {
        if (!cancelled) setTags(mergeMediaTagOptions(body.availableTags ?? []));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return tags;
}
