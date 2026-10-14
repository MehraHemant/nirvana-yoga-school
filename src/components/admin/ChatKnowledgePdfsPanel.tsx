"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AdminChatKnowledgePdf,
  deleteAdminChatPdf,
  fetchAdminChatPdfs,
  uploadAdminChatPdfs,
} from "@/lib/api/admin-client";
import { MAX_PDF_UPLOAD_LABEL } from "@/lib/cdn/constants";

type ChatKnowledgePdfsPanelProps = {
  /** Disable destructive/upload actions while parent sync runs. */
  disabled?: boolean;
  /** Called after upload/delete so parent can show sync hints. */
  onChanged?: (message: string) => void;
};

/**
 * Admin panel to upload, preview, and delete chat RAG PDF knowledge files.
 *
 * @param props - Panel props
 */
export function ChatKnowledgePdfsPanel({
  disabled = false,
  onChanged,
}: ChatKnowledgePdfsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfs, setPdfs] = useState<AdminChatKnowledgePdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadPdfs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await fetchAdminChatPdfs();
      setPdfs(body.pdfs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDFs");
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPdfs();
  }, [loadPdfs]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      for (const file of Array.from(files)) {
        form.append("files", file);
      }
      const result = await uploadAdminChatPdfs(form);
      const uploaded = result.pdfs.length;
      const hint =
        result.errors.length > 0
          ? `Uploaded ${uploaded}. Issues: ${result.errors.join("; ")}`
          : `Uploaded ${uploaded} PDF${uploaded === 1 ? "" : "s"}. Run “Sync chat index” to embed.`;
      setMessage(hint);
      onChanged?.(hint);
      await loadPdfs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function handleDelete(pdf: AdminChatKnowledgePdf) {
    if (
      !window.confirm(
        `Delete “${pdf.title}”? This empties the Qdrant collection and re-indexes remaining CMS + PDF sources.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteAdminChatPdf(pdf.id);
      const reindex = result.reindex;
      const hint = reindex
        ? `Deleted PDF. Collection wiped; re-indexed ${reindex.upserted} upserted, ${reindex.skipped} skipped, ${reindex.total} live · ${reindex.durationMs}ms`
        : result.warning
          ? `Deleted PDF. Collection wiped. Re-index warning: ${result.warning}`
          : "Deleted PDF. Collection wiped — run Sync chat index to restore remaining sources.";
      setMessage(hint);
      onChanged?.(hint);
      if (previewUrl === pdf.storageUrl) setPreviewUrl(null);
      await loadPdfs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const locked = disabled || busy;

  return (
    <section className="admin-cms-panel">
      <div className="admin-cms-panel-head">
        <h2 className="admin-cms-panel-title">Chat knowledge PDFs</h2>
        <p className="admin-hint">
          Upload PDFs for chatbot RAG. Text is extracted on upload; use Sync
          chat index to embed chunks into Qdrant. Max {MAX_PDF_UPLOAD_LABEL} per
          file. Duplicate file contents are not re-stored.
        </p>
      </div>

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn"
          disabled={locked}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Working…" : "Upload PDFs"}
        </button>
        <button
          type="button"
          className="admin-btn-ghost"
          disabled={locked || loading}
          onClick={() => loadPdfs()}
        >
          Refresh
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        disabled={locked}
        onChange={handleUpload}
        className="admin-file-input-hidden"
        aria-hidden
        tabIndex={-1}
      />

      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-hint">{message}</p> : null}

      {loading ? (
        <p className="admin-hint">Loading PDFs…</p>
      ) : pdfs.length === 0 ? (
        <p className="admin-hint">No knowledge PDFs uploaded yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Chunks</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pdfs.map((pdf) => (
                <tr key={pdf.id}>
                  <td>
                    <div>{pdf.title}</div>
                    <div className="admin-hint">{pdf.filename}</div>
                    {pdf.errorMessage ? (
                      <div className="admin-error">{pdf.errorMessage}</div>
                    ) : null}
                  </td>
                  <td>{pdf.status}</td>
                  <td>{pdf.chunkCount}</td>
                  <td>{formatBytes(pdf.sizeBytes)}</td>
                  <td>
                    <div className="admin-toolbar">
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        disabled={locked}
                        onClick={() => setPreviewUrl(pdf.storageUrl)}
                      >
                        Preview
                      </button>
                      <a
                        className="admin-btn-ghost"
                        href={pdf.storageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        disabled={locked}
                        onClick={() => handleDelete(pdf)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewUrl ? (
        <div className="admin-cms-panel" style={{ marginTop: "1rem" }}>
          <div className="admin-cms-panel-head">
            <h3 className="admin-cms-panel-title">PDF preview</h3>
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => setPreviewUrl(null)}
            >
              Close preview
            </button>
          </div>
          <iframe
            title="PDF preview"
            src={previewUrl}
            style={{
              width: "100%",
              minHeight: "480px",
              border: "1px solid var(--admin-border, #ddd)",
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

/**
 * Format byte size for the admin table.
 *
 * @param bytes - File size
 */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
