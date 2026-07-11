import { getServerSession } from "@/lib/cms/auth";

/**
 * Return the current admin session user.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({ user: session });
}
