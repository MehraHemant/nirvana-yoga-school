"use client";

import dynamic from "next/dynamic";

/** Client-only chat shell so the site layout can stay a Server Component. */
const ChatWidget = dynamic(() => import("@/components/ui/ChatWidget"), {
  ssr: false,
});

/**
 * Lazily mounts the chat widget on the client (no SSR).
 */
export default function DeferredChatWidget() {
  return <ChatWidget />;
}
