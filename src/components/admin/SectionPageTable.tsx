"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { duplicatePageAction } from "@/app/admin/sections/actions";
import { Copy, Link as LinkIcon, Pencil } from "@/icons";
import { publicViewHref } from "@/lib/cms/page-layout-registry";
import { AdminPublishToggle } from "./AdminPublishToggle";

type SectionPageItem = {
  id: string;
  slug: string;
  type: string;
  title: string;
  image: string;
  published: boolean;
};

type SectionPageTableProps = {
  /** Pages to display in the table */
  pages: SectionPageItem[];
  /** Section label for the empty state */
  sectionLabel: string;
};

/**
 * Admin table listing pages of a section type with icon View, Edit, Copy, Publish.
 *
 * @param props - Pages array and section label
 */
export function SectionPageTable({
  pages,
  sectionLabel,
}: SectionPageTableProps) {
  if (pages.length === 0) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-state-title">No {sectionLabel} yet</p>
        <p className="admin-hint">
          Nothing in the database for this section. Run a seed or create a page
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card admin-card--flush">
      <div className="admin-table-scroll">
        <table className="admin-table admin-table--section">
          <colgroup>
            <col className="admin-table-col-page" />
            <col className="admin-table-col-status" />
            <col className="admin-table-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Page</th>
              <th>Status</th>
              <th className="admin-table-col--actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const viewHref = publicViewHref(page.type, page.slug);
              return (
                <tr key={page.id}>
                  <td>
                    <div className="admin-table-page">
                      <PageThumb title={page.title} image={page.image} />
                      <div className="admin-table-page-copy">
                        <span className="admin-table-title">{page.title}</span>
                        <code className="admin-table-slug">/{page.slug}</code>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-pill${page.published ? " admin-pill--published" : ""}`}
                    >
                      {page.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="admin-row-actions">
                    <div className="admin-list-row-actions admin-list-row-actions--icons">
                      <a
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-icon-btn"
                        aria-label="View live page"
                        title="View"
                      >
                        <LinkIcon size={16} />
                      </a>
                      <NextLink
                        href={`/admin/pages/${page.slug}`}
                        className="admin-icon-btn"
                        aria-label="Edit page"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </NextLink>
                      <CopyPageButton pageId={page.id} />
                      <AdminPublishToggle
                        pageId={page.id}
                        published={page.published}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PageThumbProps = {
  title: string;
  image: string;
};

/**
 * Compact page thumbnail for section table rows.
 *
 * @param props - Title used as alt text and image URL
 */
function PageThumb({ title, image }: PageThumbProps) {
  if (!image) {
    return (
      <div className="admin-table-thumb admin-table-thumb--empty" aria-hidden />
    );
  }

  return (
    <div className="admin-table-thumb">
      <Image
        src={image}
        alt=""
        width={56}
        height={40}
        className="admin-table-thumb-img"
        sizes="56px"
        unoptimized
      />
      <span className="sr-only">{title}</span>
    </div>
  );
}

type CopyPageButtonProps = {
  pageId: string;
};

/**
 * Icon control that duplicates a section page via server action.
 *
 * @param props - Page id to copy
 */
function CopyPageButton({ pageId }: CopyPageButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="admin-icon-btn"
      disabled={pending}
      aria-busy={pending}
      aria-label="Copy page"
      title="Copy"
      onClick={() => {
        const formData = new FormData();
        formData.set("id", pageId);
        startTransition(async () => {
          await duplicatePageAction(formData);
          router.refresh();
        });
      }}
    >
      <Copy size={16} />
      <span className="sr-only">Copy</span>
    </button>
  );
}
