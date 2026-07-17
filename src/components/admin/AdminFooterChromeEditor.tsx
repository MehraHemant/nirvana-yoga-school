"use client";

import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { ImageField } from "@/components/admin/ImageField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type { GlobalFooter } from "@/content/types/global-settings";
import { Copy, Plus, Trash } from "@/icons";
import {
  fetchAdminGlobalSettings,
  saveAdminGlobalSettings,
} from "@/lib/api/admin-client";

const ICON_OPTIONS = ["instagram", "youtube", "facebook", "whatsapp"] as const;

/**
 * Creates a UUID list for nested footer column links.
 *
 * @param count - Number of link keys
 * @returns Fresh key list
 */
function createLinkKeys(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

/**
 * Structured admin editor for global footer brand, social, columns, contact, legal.
 */
export function AdminFooterChromeEditor() {
  const [settings, setSettings] = useState<GlobalFooter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [linkKeys, setLinkKeys] = useState<string[][]>([]);
  const socialKeys = useStableListKeys(settings?.social.length ?? 0);
  const columnKeys = useStableListKeys(settings?.columns.length ?? 0);
  const legalKeys = useStableListKeys(settings?.legal.length ?? 0);

  useEffect(() => {
    fetchAdminGlobalSettings("footer")
      .then((body) => {
        const footer = body.settings as GlobalFooter;
        setSettings(footer);
        setLinkKeys(
          footer.columns.map((column) => createLinkKeys(column.links.length)),
        );
      })
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
    setSettings({
      ...settings,
      contact: { ...settings.contact, [field]: value },
    });
  }

  function updateSocial(
    index: number,
    field: "label" | "href" | "icon",
    value: string,
  ) {
    if (!settings) return;
    setSettings({
      ...settings,
      social: settings.social.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    });
  }

  function addSocial() {
    if (!settings) return;
    socialKeys.addKey();
    setSettings({
      ...settings,
      social: [...settings.social, { label: "", href: "", icon: "instagram" }],
    });
  }

  function removeSocial(index: number) {
    if (!settings) return;
    socialKeys.removeKey(index);
    setSettings({
      ...settings,
      social: settings.social.filter((_, i) => i !== index),
    });
  }

  function updateColumn(colIndex: number, field: "heading", value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex ? { ...c, [field]: value } : c,
      ),
    });
  }

  function addColumn() {
    if (!settings) return;
    columnKeys.addKey();
    setLinkKeys((prev) => [...prev, []]);
    setSettings({
      ...settings,
      columns: [...settings.columns, { heading: "", links: [] }],
    });
  }

  function removeColumn(colIndex: number) {
    if (!settings) return;
    columnKeys.removeKey(colIndex);
    setLinkKeys((prev) => prev.filter((_, i) => i !== colIndex));
    setSettings({
      ...settings,
      columns: settings.columns.filter((_, i) => i !== colIndex),
    });
  }

  function updateColumnLink(
    colIndex: number,
    linkIndex: number,
    field: "label" | "href" | "external",
    value: string,
  ) {
    if (!settings) return;
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex
          ? {
              ...c,
              links: c.links.map((l, j) =>
                j === linkIndex
                  ? {
                      ...l,
                      [field]: field === "external" ? value === "true" : value,
                    }
                  : l,
              ),
            }
          : c,
      ),
    });
  }

  function addColumnLink(colIndex: number) {
    if (!settings) return;
    setLinkKeys((prev) =>
      prev.map((keys, i) =>
        i === colIndex ? [...keys, crypto.randomUUID()] : keys,
      ),
    );
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex
          ? {
              ...c,
              links: [...c.links, { label: "", href: "", external: false }],
            }
          : c,
      ),
    });
  }

  function removeColumnLink(colIndex: number, linkIndex: number) {
    if (!settings) return;
    setLinkKeys((prev) =>
      prev.map((keys, i) =>
        i === colIndex ? keys.filter((_, j) => j !== linkIndex) : keys,
      ),
    );
    setSettings({
      ...settings,
      columns: settings.columns.map((c, i) =>
        i === colIndex
          ? { ...c, links: c.links.filter((_, j) => j !== linkIndex) }
          : c,
      ),
    });
  }

  if (loading) return <p className="admin-hint">Loading footer…</p>;
  if (!settings) {
    return (
      <p className="admin-error">{error || "Footer settings not found."}</p>
    );
  }

  return (
    <div className="admin-chrome-editor">
      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Brand</h2>
            <p className="admin-cms-panel-desc">
              Logo, tagline, and credentials in the footer brand column.
            </p>
          </div>
        </div>
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

      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Social links</h2>
            <p className="admin-cms-panel-desc">
              Icons shown in the footer. Copy a row to duplicate it quickly.
            </p>
          </div>
          <button
            type="button"
            onClick={addSocial}
            className="admin-btn-sm admin-btn-sm--ghost"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {settings.social.map((social, index) => (
          <div key={socialKeys.keys[index]} className="admin-chrome-row">
            <div className="admin-field-grid admin-field-grid--row">
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
              <label className="admin-field">
                <span className="admin-label">Icon</span>
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
              </label>
            </div>
            <div className="admin-list-row-actions admin-list-row-actions--icons">
              <button
                type="button"
                className="admin-icon-btn"
                aria-label="Copy social link"
                title="Copy"
                onClick={() => {
                  socialKeys.addKey();
                  setSettings({
                    ...settings,
                    social: [
                      ...settings.social.slice(0, index + 1),
                      { ...social, label: `${social.label} (copy)` },
                      ...settings.social.slice(index + 1),
                    ],
                  });
                }}
              >
                <Copy size={16} />
              </button>
              <button
                type="button"
                className="admin-icon-btn admin-icon-btn--danger"
                aria-label="Remove social link"
                title="Remove"
                onClick={() => removeSocial(index)}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Link columns</h2>
            <p className="admin-cms-panel-desc">
              Footer link groups such as Programs and School.
            </p>
          </div>
          <button
            type="button"
            onClick={addColumn}
            className="admin-btn-sm admin-btn-sm--ghost"
          >
            <Plus size={14} /> Add column
          </button>
        </div>
        {settings.columns.map((column, colIndex) => (
          <div key={columnKeys.keys[colIndex]} className="admin-chrome-nested">
            <div className="admin-chrome-row">
              <TextField
                label="Column heading"
                value={column.heading}
                onChange={(v) => updateColumn(colIndex, "heading", v)}
              />
              <div className="admin-list-row-actions admin-list-row-actions--icons">
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn--danger"
                  aria-label="Remove column"
                  title="Remove column"
                  onClick={() => removeColumn(colIndex)}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>

            {column.links.map((link, linkIndex) => (
              <div
                key={
                  linkKeys[colIndex]?.[linkIndex] ??
                  `${columnKeys.keys[colIndex]}-${link.href}-${link.label}`
                }
                className="admin-chrome-row"
              >
                <div className="admin-field-grid admin-field-grid--row">
                  <TextField
                    label="Label"
                    value={link.label}
                    onChange={(v) =>
                      updateColumnLink(colIndex, linkIndex, "label", v)
                    }
                  />
                  <TextField
                    label="URL"
                    value={link.href}
                    onChange={(v) =>
                      updateColumnLink(colIndex, linkIndex, "href", v)
                    }
                  />
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={Boolean(link.external)}
                      onChange={(e) =>
                        updateColumnLink(
                          colIndex,
                          linkIndex,
                          "external",
                          e.target.checked.toString(),
                        )
                      }
                    />
                    External
                  </label>
                </div>
                <div className="admin-list-row-actions admin-list-row-actions--icons">
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    aria-label="Remove link"
                    title="Remove"
                    onClick={() => removeColumnLink(colIndex, linkIndex)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addColumnLink(colIndex)}
              className="admin-btn-sm admin-btn-sm--ghost"
            >
              <Plus size={14} /> Add link
            </button>
          </div>
        ))}
      </section>

      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Contact</h2>
            <p className="admin-cms-panel-desc">
              Address and contact details shown in the footer.
            </p>
          </div>
        </div>
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

      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Legal links</h2>
            <p className="admin-cms-panel-desc">Privacy, terms, and similar.</p>
          </div>
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() => {
              legalKeys.addKey();
              setSettings({
                ...settings,
                legal: [...settings.legal, { label: "", href: "#" }],
              });
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {settings.legal.map((legal, index) => (
          <div key={legalKeys.keys[index]} className="admin-chrome-row">
            <div className="admin-field-grid admin-field-grid--row">
              <TextField
                label="Label"
                value={legal.label}
                onChange={(v) => {
                  setSettings({
                    ...settings,
                    legal: settings.legal.map((l, i) =>
                      i === index ? { ...l, label: v } : l,
                    ),
                  });
                }}
              />
              <TextField
                label="URL"
                value={legal.href}
                onChange={(v) => {
                  setSettings({
                    ...settings,
                    legal: settings.legal.map((l, i) =>
                      i === index ? { ...l, href: v } : l,
                    ),
                  });
                }}
              />
            </div>
            <div className="admin-list-row-actions admin-list-row-actions--icons">
              <button
                type="button"
                className="admin-icon-btn admin-icon-btn--danger"
                aria-label="Remove legal link"
                title="Remove"
                onClick={() => {
                  legalKeys.removeKey(index);
                  setSettings({
                    ...settings,
                    legal: settings.legal.filter((_, i) => i !== index),
                  });
                }}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <AdminSaveBar
        title="Footer"
        subtitle="Site-wide chrome"
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        previewHref="/"
      />
    </div>
  );
}
