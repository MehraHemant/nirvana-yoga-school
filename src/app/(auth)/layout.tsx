/**
 * Minimal layout for the auth pages (login / signup).
 * Intentionally omits the site header, footer, and all chrome widgets.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
