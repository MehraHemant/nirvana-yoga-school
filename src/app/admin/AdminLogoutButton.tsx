"use client";

import { logoutAdmin } from "@/lib/api/admin-client";

/**
 * Logout button for the admin header.
 */
export function AdminLogoutButton() {
  async function onLogout() {
    await logoutAdmin();
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" className="admin-btn-ghost" onClick={onLogout}>
      Logout
    </button>
  );
}
