"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/** Client-only chat shell so the site layout can stay a Server Component. */
const ChatWidget = dynamic(() => import("@/components/ui/ChatWidget"), {
  ssr: false,
});

/** Chat is desktop/tablet only — matches Tailwind's `md` breakpoint. */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Lazily mounts the chat widget on the client (no SSR), and only on `md`+
 * screens so mobile visitors never download the chat bundle.
 */
export default function DeferredChatWidget() {
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  return isDesktop ? <ChatWidget /> : null;
}
