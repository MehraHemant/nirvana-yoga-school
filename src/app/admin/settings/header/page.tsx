"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { TextField } from "@/components/admin/TextField";
import { ImageField } from "@/components/admin/ImageField";
import { fetchAdminGlobalSettings, saveAdminGlobalSettings } from "@/lib/api/admin-client";
import type { GlobalHeader } from "@/content/types/global-settings";

export default function HeaderSettingsPage() {
  const [settings, setSettings] = useState<GlobalHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminGlobalSettings("header")
      .then((body) => setSettings(body.settings as GlobalHeader))
      .catch(() => setError("Failed to load header settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await saveAdminGlobalSettings("header", settings);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-hint">Loading…</p>;
  if (!settings) return <p className="admin-error">{error || "Not found"}</p>;

  return (
    <div className="admin-editor">
      <header className="admin-editor-header">
        <Link href="/admin/settings" className="admin-back-link">
          ← Settings
        </Link>
        <h1 className="admin-title">Header & Navigation</h1>
        <p className="admin-subtitle">Logo, sign-in link, and CTA button.</p>
      </header>

      <AdminSaveBar saving={saving} saved={saved} error={error} onSave={handleSave} />

      <section className="admin-section-block">
        <h2 className="admin-section-label">Logo</h2>
        <div className="admin-field-grid">
          <ImageField
            label="Light Background Logo"
            value={settings.logo.light}
            onChange={(v) => setSettings({ ...settings, logo: { ...settings.logo, light: v } })}
            hint="Used on dark backgrounds (hero, footer)"
          />
          <ImageField
            label="Dark Background Logo"
            value={settings.logo.dark}
            onChange={(v) => setSettings({ ...settings, logo: { ...settings.logo, dark: v } })}
            hint="Used on light backgrounds"
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Sign In Link</h2>
        <TextField
          label="Sign In URL"
          value={settings.signInUrl}
          onChange={(v) => setSettings({ ...settings, signInUrl: v })}
          hint="External URL for the sign-in button"
        />
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">CTA Button</h2>
        <div className="admin-field-grid">
          <TextField
            label="Label"
            value={settings.cta.label}
            onChange={(v) => setSettings({ ...settings, cta: { ...settings.cta, label: v } })}
          />
          <TextField
            label="Href"
            value={settings.cta.href}
            onChange={(v) => setSettings({ ...settings, cta: { ...settings.cta, href: v } })}
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Navigation Menus</h2>
        <p className="admin-hint">
          Navigation structure is managed in the{" "}
          <Link href="/admin/navigation">Navigation</Link> editor.
        </p>
      </section>
    </div>
  );
}
