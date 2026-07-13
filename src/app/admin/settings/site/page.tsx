"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { TextField } from "@/components/admin/TextField";
import { fetchAdminGlobalSettings, saveAdminGlobalSettings } from "@/lib/api/admin-client";
import type { SiteConfig } from "@/content/types/global-settings";

export default function SiteConfigSettingsPage() {
  const [settings, setSettings] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminGlobalSettings("siteConfig")
      .then((body) => setSettings(body.settings as SiteConfig))
      .catch(() => setError("Failed to load site config"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await saveAdminGlobalSettings("siteConfig", settings);
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
        <h1 className="admin-title">Site Configuration</h1>
        <p className="admin-subtitle">Site name, URL, SEO defaults, WhatsApp, contact info, and address.</p>
      </header>

      <AdminSaveBar saving={saving} saved={saved} error={error} onSave={handleSave} />

      <section className="admin-section-block">
        <h2 className="admin-section-label">Site Identity</h2>
        <div className="admin-field-grid">
          <TextField
            label="Site Name"
            value={settings.siteName}
            onChange={(v) => setSettings({ ...settings, siteName: v })}
          />
          <TextField
            label="Site URL"
            value={settings.siteUrl}
            onChange={(v) => setSettings({ ...settings, siteUrl: v })}
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Default SEO</h2>
        <div className="admin-field-grid">
          <TextField
            label="Default Title"
            value={settings.defaultSeo.title}
            onChange={(v) => setSettings({ ...settings, defaultSeo: { ...settings.defaultSeo, title: v } })}
          />
          <TextField
            label="Default Description"
            value={settings.defaultSeo.description}
            onChange={(v) => setSettings({ ...settings, defaultSeo: { ...settings.defaultSeo, description: v } })}
            multiline
            rows={2}
          />
          <TextField
            label="Default OG Image"
            value={settings.defaultSeo.ogImage}
            onChange={(v) => setSettings({ ...settings, defaultSeo: { ...settings.defaultSeo, ogImage: v } })}
            hint="Full URL or path from public folder"
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Contact & WhatsApp</h2>
        <div className="admin-field-grid">
          <TextField
            label="WhatsApp Number"
            value={settings.whatsappNumber}
            onChange={(v) => setSettings({ ...settings, whatsappNumber: v })}
            hint="Digits only, no + or spaces (e.g., 919876543210)"
          />
          <TextField
            label="Contact Email"
            value={settings.contactEmail}
            onChange={(v) => setSettings({ ...settings, contactEmail: v })}
          />
          <TextField
            label="Contact Phone (display)"
            value={settings.contactPhone}
            onChange={(v) => setSettings({ ...settings, contactPhone: v })}
          />
          <TextField
            label="Address"
            value={settings.address}
            onChange={(v) => setSettings({ ...settings, address: v })}
            multiline
            rows={2}
          />
        </div>
      </section>
    </div>
  );
}
