"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section panel is in view using IntersectionObserver (scroll-spy).
 * Prefers the section intersecting a band near the top of the viewport.
 *
 * @param sectionIds - DOM ids of section panels in document order
 * @returns Active section id (defaults to the first id)
 */
export function useSectionScrollSpy(sectionIds: readonly string[]): string {
  const idsKey = sectionIds.join("|");
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const ids = idsKey ? idsKey.split("|") : [];
    if (ids.length === 0) return;

    setActiveId((prev) => (ids.includes(prev) ? prev : (ids[0] ?? "")));

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          visible.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId = ids[0] ?? "";
        let bestRatio = -1;
        for (const id of ids) {
          const ratio = visible.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestRatio <= 0) {
          const spyY = window.innerHeight * 0.25;
          let fallback = ids[0] ?? "";
          for (const id of ids) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (el.getBoundingClientRect().top <= spyY) fallback = id;
          }
          bestId = fallback;
        }

        setActiveId((prev) => (prev === bestId ? prev : bestId));
      },
      {
        root: null,
        rootMargin: "-15% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [idsKey]);

  return activeId;
}
