import {
  adminSessionCookieName,
  authenticateAdmin,
  createSessionToken,
} from "@/lib/cms/auth";
import { isDbEnabled } from "@/lib/db";

/**
 * Admin login — sets httpOnly session cookie.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return Response.json(
      { error: "Database not configured. Set DATABASE_URL." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return Response.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const session = await authenticateAdmin(body.email, body.password);
  if (!session) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(session);
  const response = Response.json({ user: session });
  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`,
  );
  return response;
}
