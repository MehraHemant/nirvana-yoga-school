"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { HeaderSiteUser } from "@/components/auth/HeaderAuth";

export type SiteQuizEligibility = {
  remaining: number;
  nextAvailableAt: string | null;
};

type SiteSessionState = {
  /** False until the first `/api/auth/me` response arrives. */
  ready: boolean;
  user: HeaderSiteUser | null;
  quiz: SiteQuizEligibility | null;
  /** Re-reads the session — call after login, signup, or logout. */
  refresh: () => Promise<void>;
};

const SiteSessionContext = createContext<SiteSessionState>({
  ready: false,
  user: null,
  quiz: null,
  refresh: async () => {},
});

/**
 * Loads the public site session in the browser, so pages under the site
 * layout never read cookies on the server and can be cached.
 *
 * @param props - Site shell children
 */
export function SiteSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<SiteSessionState, "refresh">>({
    ready: false,
    user: null,
    quiz: null,
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const body = response.ok
        ? ((await response.json()) as {
            user: HeaderSiteUser | null;
            quiz: SiteQuizEligibility | null;
          })
        : { user: null, quiz: null };
      setState({ ready: true, user: body.user, quiz: body.quiz });
    } catch {
      setState((prev) => ({ ...prev, ready: true }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh]);

  return (
    <SiteSessionContext.Provider value={value}>
      {children}
    </SiteSessionContext.Provider>
  );
}

/**
 * Current public site session from {@link SiteSessionProvider}.
 */
export function useSiteSession(): SiteSessionState {
  return useContext(SiteSessionContext);
}
