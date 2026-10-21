import { getSiteServerSession } from "@/lib/auth/site-session";
import { jsonOk } from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";
import { getQuizEligibility } from "@/lib/quiz/attempts";
import { getQuizSettings } from "@/lib/quiz/settings";

/**
 * Signed-in site account and its quiz chances, read by the client session
 * provider so the public site shell can stay static (no cookies in layouts).
 */
export async function GET() {
  const session = await getSiteServerSession().catch(() => null);
  const headers = { "Cache-Control": "private, no-store" };
  if (!session) return jsonOk({ user: null, quiz: null }, { headers });

  const settings = await getQuizSettings();
  const quiz =
    settings.live && isDbEnabled()
      ? await getQuizEligibility(session.userId, settings.monthlyLimit).catch(
          () => ({ remaining: settings.monthlyLimit, nextAvailableAt: null }),
        )
      : null;

  return jsonOk(
    { user: { name: session.name, email: session.email }, quiz },
    { headers },
  );
}
