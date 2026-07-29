"use client";

import { useState } from "react";
import { ChatKnowledgePdfsPanel } from "@/components/admin/ChatKnowledgePdfsPanel";
import { syncAdminChatIndex } from "@/lib/api/admin-client";

/**
 * Admin tools page to sync the live CMS/KB/PDF chat RAG index in Qdrant.
 */
export default function AdminChatIndexPage() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSync(mode: "incremental" | "full") {
    setSyncing(true);
    setError("");
    setMessage("");
    try {
      const result = await syncAdminChatIndex(mode);
      setMessage(
        `Synced (${result.mode}): ${result.upserted} upserted, ${result.deleted} deleted, ${result.skipped} unchanged · ${result.total} live chunks · ${result.durationMs}ms`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="admin-cms-shell">
      <header className="admin-cms-header">
        <div>
          <p className="admin-cms-kicker">CMS</p>
          <h1 className="admin-cms-title">Chat index</h1>
          <p className="admin-subtitle admin-subtitle--flush">
            Sync all published CMS content except blog posts — pages (courses,
            venues, home, contact, modules), teacher/faculty profiles, shared
            global sections (FAQs, travel, residential life, Why Nirvana,
            reviews, site contact), knowledge-base rows, and uploaded PDFs into
            the Qdrant vector store used by the site chatbot. Drafts,
            unpublished pages, and blogs are excluded; removed sources are
            deleted from the index.
          </p>
        </div>
      </header>

      <div className="admin-chrome-editor">
        <section className="admin-cms-panel">
          <div className="admin-cms-panel-head">
            <h2 className="admin-cms-panel-title">Sync RAG index</h2>
            <p className="admin-hint">
              Prefer incremental sync after CMS, teacher, shared-section, or PDF
              edits. Use full re-index if the embedding model or collection
              settings change.
            </p>
          </div>

          <div className="admin-toolbar">
            <button
              type="button"
              className="admin-btn"
              disabled={syncing}
              onClick={() => handleSync("incremental")}
            >
              {syncing ? "Syncing…" : "Sync chat index"}
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              disabled={syncing}
              onClick={() => handleSync("full")}
            >
              Full re-index
            </button>
          </div>

          {error ? <p className="admin-error">{error}</p> : null}
          {message ? <p className="admin-hint">{message}</p> : null}
        </section>

        <ChatKnowledgePdfsPanel
          disabled={syncing}
          onChanged={(hint) => {
            setError("");
            setMessage(hint);
          }}
        />
      </div>
    </section>
  );
}
