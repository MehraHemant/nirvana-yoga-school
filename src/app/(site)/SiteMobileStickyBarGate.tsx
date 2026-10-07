"use client";

import { usePathname } from "next/navigation";
import MobileStickyBar from "@/components/ui/MobileStickyBar";

const IMMERSIVE_PATHS = new Set(["/quiz"]);

/**
 * Renders the mobile sticky CTA bar except on full-viewport immersive routes.
 */
export default function SiteMobileStickyBarGate() {
  const pathname = usePathname();

  if (pathname !== null && IMMERSIVE_PATHS.has(pathname)) {
    return null;
  }

  return <MobileStickyBar />;
}
