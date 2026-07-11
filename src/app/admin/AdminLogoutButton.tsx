"use client";

/**
 * Logout button for the admin header.
 */
export function AdminLogoutButton() {
  async function onLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" className="admin-btn-ghost" onClick={onLogout}>
      Logout
    </button>
  );
}
