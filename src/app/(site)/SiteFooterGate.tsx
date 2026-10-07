"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
const IMMERSIVE_PATHS = new Set(["/quiz"]);

type SiteFooterGateProps = {
  /** CMS footer payload from the site layout. */
  initialData: Parameters<typeof Footer>[0]["initialData"];
};

/**
 * Renders the site footer on standard pages; hidden on immersive routes like `/quiz`.
 *
 * @param props - Footer CMS data
 */
export default function SiteFooterGate({ initialData }: SiteFooterGateProps) {
  const pathname = usePathname();

  if (pathname !== null && IMMERSIVE_PATHS.has(pathname)) {
    return null;
  }

  return <Footer initialData={initialData} />;
}
