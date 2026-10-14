"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Fraction of the player that must be visible before muted autoplay starts. */
export const PLAYLIST_AUTOPLAY_THRESHOLD = 0.45;

/**
 * Sends a YouTube IFrame API command via postMessage (requires enablejsapi=1).
 *
 * @param iframe - YouTube embed iframe, or null
 * @param func - Command name
 */
export function postYouTubeCommand(
  iframe: HTMLIFrameElement | null,
  func: "playVideo" | "pauseVideo",
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  );
}

type UseViewportMutedAutoplayOptions = {
  /** Player shell observed for visibility */
  rootRef: RefObject<HTMLElement | null>;
  /** When true, skip autoplay / auto-resume (click-to-play still works) */
  prefersReduced: boolean;
  /** Whether the media element is mounted */
  started: boolean;
  /** First enter: mount media with muted autoplay */
  onStart: () => void;
  /** Re-enter after pause: resume playback */
  onResume: () => void;
  /** Leave view: pause to save resources */
  onPause: () => void;
};

/**
 * Muted autoplay when a playlist player enters the viewport; pause when it leaves.
 * No-ops autoplay/resume when prefers-reduced-motion is set; still pauses on leave.
 *
 * @param options - Observer target and play/pause callbacks
 */
export function useViewportMutedAutoplay({
  rootRef,
  prefersReduced,
  started,
  onStart,
  onResume,
  onPause,
}: UseViewportMutedAutoplayOptions) {
  const startedRef = useRef(started);
  const prefersReducedRef = useRef(prefersReduced);
  const onStartRef = useRef(onStart);
  const onResumeRef = useRef(onResume);
  const onPauseRef = useRef(onPause);

  startedRef.current = started;
  prefersReducedRef.current = prefersReduced;
  onStartRef.current = onStart;
  onResumeRef.current = onResume;
  onPauseRef.current = onPause;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          if (prefersReducedRef.current) return;
          if (!startedRef.current) {
            onStartRef.current();
          } else {
            onResumeRef.current();
          }
          return;
        }

        if (startedRef.current) {
          onPauseRef.current();
        }
      },
      { threshold: PLAYLIST_AUTOPLAY_THRESHOLD },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);
}
