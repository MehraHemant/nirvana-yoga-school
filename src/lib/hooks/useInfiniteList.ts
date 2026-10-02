"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_ROOT_MARGIN = "480px 0px";

type UseInfiniteListOptions = {
  /** Total items available to reveal */
  itemCount: number;
  /** Items to reveal per intersection (default 12) */
  pageSize?: number;
  /** Change this to reset the window (e.g. active filter id) */
  resetKey?: string | number;
  /** IntersectionObserver rootMargin (default 480px ahead of the fold) */
  rootMargin?: string;
};

type UseInfiniteListResult = {
  shownCount: number;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Reveals the next page of items as a bottom sentinel approaches the viewport.
 *
 * @param options - List length, page size, and reset key
 */
export function useInfiniteList({
  itemCount,
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseInfiniteListOptions): UseInfiniteListResult {
  const [shownCount, setShownCount] = useState(() =>
    Math.min(pageSize, itemCount),
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey refreshes the window when the filter changes
  useEffect(() => {
    setShownCount(Math.min(pageSize, itemCount));
  }, [itemCount, pageSize, resetKey]);

  const hasMore = shownCount < itemCount;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-observe after each page so a still-visible sentinel keeps loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShownCount((count) => Math.min(count + pageSize, itemCount));
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, itemCount, pageSize, resetKey, rootMargin, shownCount]);

  return {
    shownCount: Math.min(shownCount, itemCount),
    hasMore,
    sentinelRef,
  };
}
