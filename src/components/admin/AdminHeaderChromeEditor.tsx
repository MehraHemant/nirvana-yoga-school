"use client";

import { useEffect, useState, useTransition } from "react";
import { saveFullHeaderAction } from "@/app/admin/components/navigation/actions";
import { AdminHeaderCtasEditor } from "@/components/admin/AdminHeaderCtasEditor";
import { AdminHeaderNavEditor } from "@/components/admin/AdminHeaderNavEditor";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { ImageField } from "@/components/admin/ImageField";
import type { GlobalHeader } from "@/content/types/global-settings";
import { fetchAdminGlobalSettings } from "@/lib/api/admin-client";
import {
  DEFAULT_HEADER_CTAS,
  normalizeHeaderCtas,
  prepareHeaderForSave,
} from "@/lib/cms/header-fields";

const DEFAULT_HEADER: GlobalHeader = {
  navigation: [],
  logo: {
    light: "/logo.png",
    dark: "/logo_white.png",
    lightAlt: "Nirvana Yoga School",
    darkAlt: "Nirvana Yoga School",
    href: "/",
  },
  ctas: DEFAULT_HEADER_CTAS.map((c) => ({ ...c })),
};

type LogoVariant = "light" | "dark";

/**
 * Compact editor for one header logo variant and its accessibility text.
 *
 * @param props - Logo settings and change callback
 */
function HeaderLogoFields({
  variant,
  settings,
  onChange,
}: {
  variant: LogoVariant;
  settings: GlobalHeader;
  onChange: (logo: GlobalHeader["logo"]) => void;
}) {
  const isLight = variant === "light";
  const label = isLight ? "Light background logo" : "Dark / hero logo";
  const hint = isLight
    ? "Used when the header sits on sand or white."
    : "Used over transparent and hero headers.";
  const altKey = isLight ? "lightAlt" : "darkAlt";

  return (
    <div className="admin-header-logo-card">
      <div className="admin-header-logo-card-head">
        <div>
          <h3 className="admin-header-logo-card-title">{label}</h3>
          <p className="admin-hint admin-hint--tight">{hint}</p>
        </div>
      </div>
      <ImageField
        label={label}
        value={settings.logo[variant]}
        onChange={(value) => onChange({ ...settings.logo, [variant]: value })}
        hideLabel
        compact
      />
      <div className="admin-header-logo-fields">
        <div className="admin-field admin-field--flush">
          <label className="admin-label" htmlFor={`header-logo-${variant}-alt`}>
            Alt text
          </label>
          <input
            id={`header-logo-${variant}-alt`}
            className="admin-input"
            type="text"
            value={settings.logo[altKey]}
            placeholder="Nirvana Yoga School"
            onChange={(event) =>
              onChange({ ...settings.logo, [altKey]: event.target.value })
            }
          />
        </div>
        <div className="admin-field admin-field--flush">
          <label
            className="admin-label"
            htmlFor={`header-logo-${variant}-href`}
          >
            Logo destination (shared)
          </label>
          <input
            id={`header-logo-${variant}-href`}
            className="admin-input"
            type="text"
            value={settings.logo.href}
            placeholder="/"
            onChange={(event) =>
              onChange({ ...settings.logo, href: event.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

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
              Logos and ordered header actions (Enquire now or custom buttons).
              Drag CTAs to change their order.
            </p>
          </div>
        </div>
        <div className="admin-header-logo-grid">
          <HeaderLogoFields
            variant="light"
            settings={settings}
            onChange={(logo) => setSettings({ ...settings, logo })}
          />
          <HeaderLogoFields
            variant="dark"
            settings={settings}
            onChange={(logo) => setSettings({ ...settings, logo })}
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
