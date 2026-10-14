"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const IMMERSIVE_PATHS = new Set(["/quiz"]);

/**
 * Renders its children except on full-viewport immersive routes like `/quiz`,
 * where floating widgets would cover the step controls.
 *
 * @param props - Chrome to hide on immersive routes
 */
export default function HideOnImmersive({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  if (pathname !== null && IMMERSIVE_PATHS.has(pathname)) {
    return null;
  }

  return children;
}
