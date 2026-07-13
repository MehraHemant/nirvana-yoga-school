import Link from "next/link";

/**
 * Global Settings admin index page.
 */
export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="admin-title">Global Settings</h1>
      <p className="admin-subtitle">
        Configure site-wide header, footer, and general settings.
      </p>

      <div className="admin-grid-2" style={{ marginTop: "1.5rem" }}>
        <Link href="/admin/settings/header" className="admin-card admin-card--link">
          <h2>Header & Navigation</h2>
          <p className="admin-hint">Logo, navigation menu, sign-in URL, CTA button</p>
        </Link>

        <Link href="/admin/settings/footer" className="admin-card admin-card--link">
          <h2>Footer</h2>
          <p className="admin-hint">Brand, social links, columns, contact info, legal links</p>
        </Link>

        <Link href="/admin/settings/site-config" className="admin-card admin-card--link">
          <h2>Site Configuration</h2>
          <p className="admin-hint">Site name, SEO defaults, WhatsApp, contact details</p>
        </Link>

        <Link href="/admin/library" className="admin-card admin-card--link">
          <h2>Content Library</h2>
          <p className="admin-hint">Reusable section snippets for pages</p>
        </Link>
      </div>
    </div>
  );
}
