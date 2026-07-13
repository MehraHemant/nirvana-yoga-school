"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { TextField } from "@/components/admin/TextField";
import { ImageField } from "@/components/admin/ImageField";
import {
  fetchAdminGlobalSettings,
  saveAdminGlobalSettings,
} from "@/lib/api/admin-client";
import type { GlobalFooter } from "@/content/types/global-settings";

const ICON_OPTIONS = ["instagram", "youtube", "facebook", "whatsapp"] as const;

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<GlobalFooter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminGlobalSettings("footer")
      .then((body) => setSettings(body.settings as GlobalFooter))
      .catch(() => setError("Failed to load footer settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await saveAdminGlobalSettings("footer", settings);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateBrand(field: keyof GlobalFooter["brand"], value: string) {
    if (!settings) return;
    setSettings({ ...settings, brand: { ...settings.brand, [field]: value } });
  }

  function updateContact(field: keyof GlobalFooter["contact"], value: string) {
    if (!settings) return;
    setSettings({ ...settings, contact: { ...settings.contact, [field]: value } });
  }

  function updateSocial(index: number, field: "label" | "href" | "icon", value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      social: settings.social.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    });
  }

  function addSocial() {
    if (!settings) return;
    setSettings({ ...settings, social: [...settings.social, { label: "", href: "", icon: "instagram" }] });
  }

  function removeSocial(index: number) {
    if (!settings) return;
    setSettings({ ...settings, social: settings.social.filter((_, i) => i !== index) });
  }

  function updateColumn(colIndex: number, field: "heading", value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) => (i === colIndex ? { ...c, [field]: value } : c)),
    });
  }

  function addColumn() {
    if (!settings) return;
    setSettings({ ...settings, columns: [...settings.columns, { heading: "", links: [] }] });
  }

  function removeColumn(colIndex: number) {
    if (!settings) return;
    setSettings({ ...settings, columns: settings.columns.filter((_, i) => i !== colIndex) });
  }

  function updateColumnLink(colIndex: number, linkIndex: number, field: "label" | "href" | "external", value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex
          ? {
              ...c,
              links: c.links.map((l, j) =>
                j === linkIndex ? { ...l, [field]: field === "external" ? value === "true" : value } : l,
              ),
            }
          : c,
      ),
    });
  }

  function addColumnLink(colIndex: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex ? { ...c, links: [...c.links, { label: "", href: "", external: false }] } : c,
      ),
    });
  }

  function removeColumnLink(colIndex: number, linkIndex: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex ? { ...c, links: c.links.filter((_, j) => j !== linkIndex) } : c,
      ),
    });
  }

  if (loading) return <p className="admin-hint">Loading…</p>;
  if (!settings) return <p className="admin-error">{error || "Not found"}</p>;

  return (
    <div className="admin-editor">
      <header className="admin-editor-header">
        <Link href="/admin/settings" className="admin-back-link">
          ← Settings
        </Link>
        <h1 className="admin-title">Footer</h1>
        <p className="admin-subtitle">Brand info, social links, columns, contact, and legal.</p>
      </header>

      <AdminSaveBar saving={saving} saved={saved} error={error} onSave={handleSave} />

      <section className="admin-section-block">
        <h2 className="admin-section-label">Brand</h2>
        <div className="admin-field-grid">
          <ImageField
            label="Logo"
            value={settings.brand.logo}
            onChange={(v) => updateBrand("logo", v)}
          />
          <TextField
            label="Tagline"
            value={settings.brand.tagline}
            onChange={(v) => updateBrand("tagline", v)}
            multiline
            rows={2}
          />
          <TextField
            label="Credentials"
            value={settings.brand.credentials}
            onChange={(v) => updateBrand("credentials", v)}
            hint="e.g., Yoga Alliance RYS · Est. 2012 · Tapovan, Rishikesh"
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Social Links</h2>
        {settings.social.map((social, index) => (
          <div key={index} className="admin-repeater-item">
            <div className="admin-field-grid">
              <TextField
                label="Label"
                value={social.label}
                onChange={(v) => updateSocial(index, "label", v)}
              />
              <TextField
                label="URL"
                value={social.href}
                onChange={(v) => updateSocial(index, "href", v)}
              />
              <select
                value={social.icon}
                onChange={(e) => updateSocial(index, "icon", e.target.value)}
                className="admin-input"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => removeSocial(index)} className="admin-btn admin-btn--ghost admin-btn--sm">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addSocial} className="admin-btn admin-btn--outline">
          + Add Social Link
        </button>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Columns</h2>
        {settings.columns.map((column, colIndex) => (
          <div key={colIndex} className="admin-repeater-item admin-repeater-item--nested">
            <div className="admin-repeater-header">
              <TextField
                label="Column Heading"
                value={column.heading}
                onChange={(v) => updateColumn(colIndex, "heading", v)}
              />
              <button type="button" onClick={() => removeColumn(colIndex)} className="admin-btn admin-btn--ghost admin-btn--sm">
                Remove Column
              </button>
            </div>

            {column.links.map((link, linkIndex) => (
              <div key={linkIndex} className="admin-repeater-item admin-repeater-item--link">
                <div className="admin-field-grid">
                  <TextField
                    label="Label"
                    value={link.label}
                    onChange={(v) => updateColumnLink(colIndex, linkIndex, "label", v)}
                  />
                  <TextField
                    label="URL"
                    value={link.href}
                    onChange={(v) => updateColumnLink(colIndex, linkIndex, "href", v)}
                  />
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={link.external}
                      onChange={(e) => updateColumnLink(colIndex, linkIndex, "external", e.target.checked.toString())}
                    />
                    External
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeColumnLink(colIndex, linkIndex)}
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addColumnLink(colIndex)} className="admin-btn admin-btn--outline admin-btn--sm">
              + Add Link
            </button>
          </div>
        ))}
        <button type="button" onClick={addColumn} className="admin-btn admin-btn--outline">
          + Add Column
        </button>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Contact Information</h2>
        <div className="admin-field-grid">
          <TextField
            label="Address"
            value={settings.contact.address}
            onChange={(v) => updateContact("address", v)}
            multiline
            rows={2}
          />
          <TextField
            label="Email"
            value={settings.contact.email}
            onChange={(v) => updateContact("email", v)}
          />
          <TextField
            label="Phone"
            value={settings.contact.phone}
            onChange={(v) => updateContact("phone", v)}
          />
        </div>
      </section>

      <section className="admin-section-block">
        <h2 className="admin-section-label">Legal Links</h2>
        {settings.legal.map((legal, index) => (
          <div key={index} className="admin-repeater-item">
            <div className="admin-field-grid">
              <TextField
                label="Label"
                value={legal.label}
                onChange={(v) => {
                  if (!settings) return;
                  setSettings({
                    ...settings,
                    legal: settings.legal.map((l, i) => (i === index ? { ...l, label: v } : l)),
                  });
                }}
              />
              <TextField
                label="URL"
                value={legal.href}
                onChange={(v) => {
                  if (!settings) return;
                  setSettings({
                    ...settings,
                    legal: settings.legal.map((l, i) => (i === index ? { ...l, href: v } : l)),
                  });
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!settings) return;
                setSettings({ ...settings, legal: settings.legal.filter((_, i) => i !== index) });
              }}
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            if (!settings) return;
            setSettings({ ...settings, legal: [...settings.legal, { label: "", href: "#" }] });
          }}
          className="admin-btn admin-btn--outline"
        >
          + Add Legal Link
        </button>
      </section>
    </div>
  );
}
