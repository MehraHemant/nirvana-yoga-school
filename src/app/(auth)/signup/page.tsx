import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/auth/safe-next";
import { getSiteServerSession } from "@/lib/auth/site-session";

export const metadata: Metadata = {
  title: "Sign up",
};

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * Public signup page.
 *
 * @param props - Optional path to open after the account is created
 */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await getSiteServerSession();
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  if (session) redirect(nextPath);

  return <AuthForm mode="signup" nextPath={nextPath} />;
}
