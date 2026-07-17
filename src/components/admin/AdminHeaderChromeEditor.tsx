"use client";

import { useEffect, useState, useTransition } from "react";
import { saveFullHeaderAction } from "@/app/admin/components/navigation/actions";
import { AdminHeaderCtasEditor } from "@/components/admin/AdminHeaderCtasEditor";
import { AdminHeaderNavEditor } from "@/components/admin/AdminHeaderNavEditor";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { ImageField } from "@/components/admin/ImageField";
import type { GlobalHeader } from "@/content/types/global-settings";
import {
  DEFAULT_HEADER_CTAS,
  normalizeHeaderCtas,
  prepareHeaderForSave,
} from "@/lib/cms/header-fields";
import { fetchAdminGlobalSettings } from "@/lib/api/admin-client";

const DEFAULT_HEADER: GlobalHeader = {
  navigation: [],
  logo: { light: "/logo.png", dark: "/logo_white.png" },
  ctas: DEFAULT_HEADER_CTAS.map((c) => ({ ...c })),
};

/**
 * Unified admin editor for site header branding, ordered CTAs, and navigation.
 */
export function AdminHeaderChromeEditor() {
  const [settings, setSettings] = useState<GlobalHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetchAdminGlobalSettings("header")
      .then((body) => {
        const header = body.settings as GlobalHeader;
        setSettings({
          ...DEFAULT_HEADER,
          ...header,
          logo: { ...DEFAULT_HEADER.logo, ...header.logo },
          ctas: normalizeHeaderCtas(header),
          navigation: Array.isArray(header.navigation)
            ? header.navigation
            : DEFAULT_HEADER.navigation,
        });
      })
      .catch(() => setError("Failed to load header settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    if (!settings) return;
    setSaved(false);
    setError("");
    startTransition(async () => {
      const result = await saveFullHeaderAction(prepareHeaderForSave(settings));
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  if (loading) return <p className="admin-hint">Loading header…</p>;
  if (!settings) {
    return (
      <p className="admin-error">{error || "Header settings not found."}</p>
    );
  }

  return (
    <div className="admin-chrome-editor">
      <section className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Branding & CTAs</h2>
            <p className="admin-cms-panel-desc">
              Logos and ordered header actions (Sign in, Enquire now, or custom
              buttons). Drag CTAs to change their order.
            </p>
          </div>
        </div>
        <div className="admin-field-grid">
          <ImageField
            label="Logo (light backgrounds)"
            value={settings.logo.light}
            onChange={(value) =>
              setSettings({
                ...settings,
                logo: { ...settings.logo, light: value },
              })
            }
            hint="Used when the header sits on sand / white"
          />
          <ImageField
            label="Logo (dark / hero)"
            value={settings.logo.dark}
            onChange={(value) =>
              setSettings({
                ...settings,
                logo: { ...settings.logo, dark: value },
              })
            }
            hint="Used over the home hero video"
          />
        </div>
        <AdminHeaderCtasEditor
          ctas={settings.ctas}
          onChange={(ctas) => setSettings({ ...settings, ctas })}
        />
      </section>

      <section id="navigation" className="admin-cms-panel">
        <div className="admin-cms-panel-head">
          <div>
            <h2 className="admin-cms-panel-title">Navigation</h2>
            <p className="admin-cms-panel-desc">
              Primary menu on every page. Drag rows to reorder top-level items
              and dropdown children. Use the copy icon to duplicate a row.
            </p>
          </div>
        </div>
        <AdminHeaderNavEditor
          navigation={settings.navigation}
          onChange={(navigation) => setSettings({ ...settings, navigation })}
        />
      </section>

      <AdminSaveBar
        title="Header & navigation"
        subtitle="Site-wide chrome"
        saving={pending}
        saved={saved}
        error={error}
        onSave={handleSave}
        previewHref="/"
      />
    </div>
  );
}
