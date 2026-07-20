import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromNextRequest } from "@/lib/cms/auth-session";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/auth/login"];

/**
 * Protect admin UI and API routes with session auth.
 * Next.js Proxy always runs on the Node.js runtime.
 * Session check is JWT-only (no Neon) so it stays lightweight.
 *
 * @param request - Incoming Next.js request
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminUi = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminUi && !isAdminApi) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const session = await getSessionFromNextRequest(request);
  if (!session) {
    if (isAdminApi) {
      return jsonUnauthorized();
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
