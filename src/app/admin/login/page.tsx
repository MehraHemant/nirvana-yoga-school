import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

/**
 * Admin login page with search params for redirect.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="admin-hint">Loading…</p>}>
      <AdminLoginForm />
    </Suspense>
  );
}
