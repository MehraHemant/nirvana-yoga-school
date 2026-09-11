"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type UseLineClampReadMoreResult = {
  ref: React.RefObject<HTMLParagraphElement | null>;
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  isTruncated: boolean;
  clampClassName: string;
};

/**
 * Tracks line-clamp truncation and expanded/collapsed read-more state.
 *
 * @param text - Content to measure; resets expansion when it changes
 */
export function useLineClampReadMore(text: string): UseLineClampReadMoreResult {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setIsExpanded(false);
  }, [text]);

  useLayoutEffect(() => {
    if (isExpanded) return;

    const element = ref.current;
    if (!element) return;

    const measure = () => {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    };

    measure();
    const frame = requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isExpanded, text]);

  return {
    ref,
    isExpanded,
    expand: () => setIsExpanded(true),
    collapse: () => setIsExpanded(false),
    isTruncated,
    clampClassName: isExpanded ? "" : "line-clamp-3",
  };
}
