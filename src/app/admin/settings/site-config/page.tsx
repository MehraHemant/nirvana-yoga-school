"use client";

import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSiteChromeTabs } from "@/components/admin/AdminSiteChromeTabs";
import { ImageField } from "@/components/admin/ImageField";
import { TextField } from "@/components/admin/TextField";
import type { SiteConfig } from "@/content/types/global-settings";
import {
  fetchAdminGlobalSettings,
  saveAdminGlobalSettings,
} from "@/lib/api/admin-client";

/**
 * Admin editor for global site identity, SEO defaults, and WhatsApp/contact.
 */
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

  if (loading) {
    return (
      <section className="admin-cms-shell">
        <p className="admin-hint">Loading site config…</p>
      </section>
    );
  }

  if (!settings) {
    return (
      <section className="admin-cms-shell">
        <p className="admin-error">{error || "Site config not found"}</p>
      </section>
    );
  }

  return (
    <section className="admin-cms-shell">
      <header className="admin-cms-header">
        <div>
          <p className="admin-cms-kicker">Site chrome</p>
          <h1 className="admin-cms-title">Site config</h1>
          <p className="admin-subtitle admin-subtitle--flush">
            Global site name, default SEO, and WhatsApp / contact used across
            the live site (browser tab title, Open Graph, floating WhatsApp
            button). Footer contact details are edited under Footer.
          </p>
        </div>
      </header>

      <AdminSiteChromeTabs />

      <div className="admin-chrome-editor">
        <section className="admin-cms-panel">
          <div className="admin-cms-panel-head">
            <div>
              <h2 className="admin-cms-panel-title">General</h2>
              <p className="admin-cms-panel-desc">
                Identity used in titles and Open Graph site name.
              </p>
            </div>
          </div>
          <div className="admin-field-grid">
            <TextField
              label="Site name"
              value={settings.siteName}
              onChange={(v) => setSettings({ ...settings, siteName: v })}
              hint="e.g. Nirvana Yoga School"
            />
            <TextField
              label="Site URL"
              value={settings.siteUrl}
              onChange={(v) => setSettings({ ...settings, siteUrl: v })}
              hint="Canonical origin, e.g. https://www.nirvanayogaschoolindia.com"
            />
          </div>
        </section>

        <section className="admin-cms-panel">
          <div className="admin-cms-panel-head">
            <div>
              <h2 className="admin-cms-panel-title">Default SEO</h2>
              <p className="admin-cms-panel-desc">
                Fallback title, description, and social share image when a page
                does not set its own.
              </p>
            </div>
          </div>
          <div className="admin-field-grid">
            <TextField
              label="Default title"
              value={settings.defaultSeo.title}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  defaultSeo: { ...settings.defaultSeo, title: v },
                })
              }
            />
            <TextField
              label="Default description"
              value={settings.defaultSeo.description}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  defaultSeo: { ...settings.defaultSeo, description: v },
                })
              }
              multiline
              rows={3}
            />
            <ImageField
              label="Default OG image"
              value={settings.defaultSeo.ogImage}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  defaultSeo: { ...settings.defaultSeo, ogImage: v },
                })
              }
              hint="Recommended 1200×630"
            />
          </div>
        </section>

        <section className="admin-cms-panel">
          <div className="admin-cms-panel-head">
            <div>
              <h2 className="admin-cms-panel-title">WhatsApp & contact</h2>
              <p className="admin-cms-panel-desc">
                WhatsApp powers the floating chat button. Email / phone /
                address here are global defaults (footer has its own display
                contact block).
              </p>
            </div>
          </div>
          <div className="admin-field-grid">
            <TextField
              label="WhatsApp number"
              value={settings.whatsappNumber}
              onChange={(v) => setSettings({ ...settings, whatsappNumber: v })}
              hint="Digits only, country code included (e.g. 919876543210)"
            />
            <TextField
              label="Contact email"
              value={settings.contactEmail}
              onChange={(v) => setSettings({ ...settings, contactEmail: v })}
            />
            <TextField
              label="Contact phone (display)"
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

      <AdminSaveBar
        title="Site config"
        subtitle="SEO · WhatsApp · identity"
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        previewHref="/"
      />
    </section>
  );
}
