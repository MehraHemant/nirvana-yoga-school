"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

function lockScrollTop() {
  window.scrollTo(0, 0);
}

export default function SiteMain({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll on route changes between non-home pages
  useLayoutEffect(() => {
    const html = document.documentElement;

    if (isHome) {
      html.classList.remove("site-inner-page");
      html.style.scrollBehavior = "";
      return;
    }

    html.classList.add("site-inner-page");

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    // Preserve deep links (e.g. `/teacher#slug`) — do not force scroll to top.
    const hasDeepLink = window.location.hash.length > 1;
    let raf1 = 0;

    if (!hasDeepLink) {
      lockScrollTop();
      raf1 = requestAnimationFrame(() => {
        lockScrollTop();
        requestAnimationFrame(lockScrollTop);
      });
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && window.location.hash.length <= 1) {
        lockScrollTop();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      window.removeEventListener("pageshow", onPageShow);
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, [pathname, isHome]);

  // Avoid overflow-x-clip here — it breaks `position: sticky` under the viewport
  // scrollport. Pages that need clip apply it on their own article wrappers.
  return (
    <main className="relative flex min-w-0 flex-1 flex-col">
      {children}
    </main>
  );
}
