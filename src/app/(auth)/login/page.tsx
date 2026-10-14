import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/auth/safe-next";
import { getSiteServerSession } from "@/lib/auth/site-session";

export const metadata: Metadata = {
  title: "Log in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * Public login page.
 *
 * @param props - Optional post-login path
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSiteServerSession();
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  if (session) redirect(nextPath);

  return <AuthForm mode="login" nextPath={nextPath} />;
}
