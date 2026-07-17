import { SectionPageTable } from "@/components/admin/SectionPageTable";
import { isOtherSectionSlug } from "@/lib/cms/page-layout-registry";
import { listSectionPages } from "@/lib/cms/section-lists";

/**
 * Admin section: Other site pages (about, hubs, etc.).
 * Excludes dedicated sidebar entries via isOtherSectionSlug.
 */
export default async function AdminOtherPagesSection() {
  const all = await listSectionPages("site");
  const pages = all.filter((page) => isOtherSectionSlug(page.slug));

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Other Pages</h1>
          <p className="admin-subtitle">
            About, hubs, and editorial site pages. Contact, Enquire, Home, and
            Teachers have their own sidebar entries.
          </p>
        </div>
        <span className="admin-page-count">{pages.length} pages</span>
      </div>
      <SectionPageTable pages={pages} sectionLabel="pages" />
    </div>
  );
}
