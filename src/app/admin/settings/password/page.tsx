"use client";

import { useEffect, useState } from "react";
import { AdminPasswordField } from "@/components/admin/AdminPasswordField";
import {
  changeAdminPassword,
  fetchAdminMe,
} from "@/lib/api/admin-client";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/cms/auth-constants";

/**
 * Admin account page to change the signed-in user's password.
 */
export default function AdminChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAdminMe()
      .then((body) => setEmail(body.user?.email ?? ""))
      .catch(() => setError("Failed to load account"))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
      setError(
        `New password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setSubmitting(true);
    try {
      await changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="admin-cms-shell">
        <p className="admin-hint">Loading account…</p>
      </section>
    );
  }

  return (
    <section className="admin-cms-shell">
      <header className="admin-cms-header">
        <div>
          <p className="admin-cms-kicker">Account</p>
          <h1 className="admin-cms-title">Change password</h1>
          <p className="admin-subtitle admin-subtitle--flush">
            Update your admin login password. You must enter your current
            password to confirm the change.
          </p>
        </div>
      </header>

      <div className="admin-chrome-editor">
        <section className="admin-cms-panel admin-form-panel">
          <div className="admin-cms-panel-head">
            <div>
              <h2 className="admin-cms-panel-title">Update password</h2>
              <p className="admin-cms-panel-desc">
                Choose a strong password you do not use elsewhere. After
                updating, you will stay signed in on this device.
              </p>
            </div>
          </div>

          {email ? (
            <p className="admin-account-badge">
              Signed in as <strong>{email}</strong>
            </p>
          ) : null}

          <form onSubmit={onSubmit} noValidate>
            <AdminPasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
            />

            <AdminPasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              minLength={MIN_ADMIN_PASSWORD_LENGTH}
              hint={`At least ${MIN_ADMIN_PASSWORD_LENGTH} characters. Use a mix of letters, numbers, and symbols for a stronger password.`}
              required
            />

            <AdminPasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              minLength={MIN_ADMIN_PASSWORD_LENGTH}
              hint="Re-enter your new password to confirm."
              required
            />

            {error ? (
              <p className="admin-error" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="admin-success" role="status" aria-live="polite">
                Password updated successfully.
              </p>
            ) : null}

            <div className="admin-form-actions">
              <button
                className="admin-btn"
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
