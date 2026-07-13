import {
  AdminActionForm,
  AdminConfirmForm,
} from "@/components/admin/AdminActionForm";
import {
  AdminFilterSelect,
  AdminFilterSubmit,
} from "@/components/admin/AdminFilterSelect";
import { AdminIconLink } from "@/components/admin/AdminIconAction";
import {
  HERO_VARIANT_LABELS,
  MODULE_LIBRARY_LABELS,
  type ModuleLibraryKey,
} from "@/content/types";
import { Copy, Pencil, Trash } from "@/icons";
import {
  getModuleLibraryPreview,
  isModuleLibraryKey,
  listModuleLibraryItems,
} from "@/lib/cms/module-library";
import { deleteLibraryItemAction, duplicateLibraryItemAction } from "./actions";

const MODULE_KEYS = Object.keys(MODULE_LIBRARY_LABELS) as ModuleLibraryKey[];

type AdminLibraryPageProps = {
  searchParams: Promise<{ moduleKey?: string; variant?: string }>;
};

/**
 * Admin content library — server-rendered list with icon row actions.
 *
 * @param props - URL search params for section filters
 */
export default async function AdminLibraryPage({
  searchParams,
}: AdminLibraryPageProps) {
  const params = await searchParams;
  const moduleKey: ModuleLibraryKey = isModuleLibraryKey(params.moduleKey ?? "")
    ? (params.moduleKey as ModuleLibraryKey)
    : "hero";
  const variant = moduleKey === "hero" ? (params.variant ?? "").trim() : "";

  const rows = await listModuleLibraryItems({
    moduleKey,
    variant: variant || undefined,
  });

  const items = rows.map((item) => ({
    ...item,
    preview: getModuleLibraryPreview(item),
  }));

  const sectionLabel = MODULE_LIBRARY_LABELS[moduleKey];
  const variantLabel =
    moduleKey === "hero" && variant
      ? HERO_VARIANT_LABELS[variant as keyof typeof HERO_VARIANT_LABELS]
      : null;

  return (
    <div>
      <h1 className="admin-title">Content library</h1>
      <p className="admin-subtitle">
        Reusable snippets by section type. Each row is one saved block you can
        copy into any page.
      </p>

      <section className="admin-section-block admin-section-block--filters">
        <h2 className="admin-section-label">Filter by section</h2>
        <form method="get" className="admin-filter-bar">
          <AdminFilterSelect
            id="lib-module-key"
            name="moduleKey"
            label="Section type"
            defaultValue={moduleKey}
          >
            {MODULE_KEYS.map((key) => (
              <option key={key} value={key}>
                {MODULE_LIBRARY_LABELS[key]}
              </option>
            ))}
          </AdminFilterSelect>

          {moduleKey === "hero" ? (
            <AdminFilterSelect
              id="lib-variant"
              name="variant"
              label="Hero layout"
              defaultValue={variant}
              wide
            >
              <option value="">All layouts</option>
              {(
                Object.keys(
                  HERO_VARIANT_LABELS,
                ) as (keyof typeof HERO_VARIANT_LABELS)[]
              ).map((key) => (
                <option key={key} value={key}>
                  {HERO_VARIANT_LABELS[key]}
                </option>
              ))}
            </AdminFilterSelect>
          ) : null}

          <AdminFilterSubmit>Apply filters</AdminFilterSubmit>
        </form>
      </section>

      <section className="admin-section-block">
        <div className="admin-section-head">
          <h2 className="admin-section-label">
            {sectionLabel}
            {variantLabel ? ` · ${variantLabel}` : ""}
          </h2>
          <span className="admin-section-count">{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No items in this section yet.</p>
            <p className="admin-hint">
              Save from a page editor with &ldquo;Save to library&rdquo;.
            </p>
          </div>
        ) : (
          <div className="admin-compact-table">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--name">
                Name
              </span>
              <span className="admin-compact-col admin-compact-col--preview">
                Preview
              </span>
              <span className="admin-compact-col admin-compact-col--type">
                Type
              </span>
              <span className="admin-compact-col admin-compact-col--date">
                Updated
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                Actions
              </span>
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  {index + 1}
                </span>
                <span
                  className="admin-compact-col admin-compact-col--name"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span
                  className="admin-compact-col admin-compact-col--preview"
                  title={item.preview}
                >
                  {item.preview}
                </span>
                <span className="admin-compact-col admin-compact-col--type">
                  <span className="admin-library-badge">
                    {item.variant ?? item.moduleKey}
                  </span>
                </span>
                <span className="admin-compact-col admin-compact-col--date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
                <span className="admin-compact-col admin-compact-col--actions admin-row-actions">
                  <AdminIconLink
                    href={`/admin/library/${item.id}`}
                    label="Edit"
                    icon={<Pencil size={16} />}
                  />
                  <AdminActionForm
                    action={duplicateLibraryItemAction}
                    fields={{ id: item.id }}
                    label="Duplicate"
                  >
                    <Copy size={16} />
                  </AdminActionForm>
                  <AdminConfirmForm
                    action={deleteLibraryItemAction}
                    confirmMessage="Delete this library item?"
                    label="Delete"
                    fields={{ id: item.id }}
                  >
                    <Trash size={16} />
                  </AdminConfirmForm>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
