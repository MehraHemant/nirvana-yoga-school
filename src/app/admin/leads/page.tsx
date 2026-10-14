"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LeadStatus, LeadSubmissionRecord } from "@/content/types/lead";
import { isLeadUnread } from "@/content/types/lead";
import {
  deleteAdminLead,
  fetchAdminLeads,
  patchAdminLead,
} from "@/lib/api/admin-client";

/**
 * Format an ISO date for the leads inbox.
 *
 * @param iso - ISO timestamp
 */
function formatLeadDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_OPTIONS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "All workflow statuses" },
  { value: "new", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

/**
 * Admin inbox for programme enquiries and contact queries.
 */
export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadSubmissionRecord[]>([]);
  const [view, setView] = useState<"inbox" | "deleted">("inbox");
  const [typeFilter, setTypeFilter] = useState<"" | "enquiry" | "contact">("");
  const [readFilter, setReadFilter] = useState<"" | "unread" | "read">("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (view === "inbox" && statusFilter) params.set("status", statusFilter);
    else if (view === "inbox" && readFilter)
      params.set("readState", readFilter);
    if (view === "deleted") params.set("deleted", "true");

    try {
      const body = await fetchAdminLeads(params);
      if (!body.dbEnabled) {
        setError("Database is not connected — leads cannot be loaded.");
        setLeads([]);
      } else {
        setLeads(body.leads);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, readFilter, statusFilter, view]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (leads.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !leads.some((lead) => lead.id === selectedId)) {
      setSelectedId(leads[0]?.id ?? null);
    }
  }, [leads, selectedId]);

  const selected = leads.find((lead) => lead.id === selectedId) ?? null;

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(true);
    setError("");

    try {
      await patchAdminLead(id, { status });
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteLead(id: string) {
    if (
      !window.confirm(
        "Move this submission to Deleted? You can restore it later from the Deleted section.",
      )
    ) {
      return;
    }

    setUpdating(true);
    setError("");

    try {
      await deleteAdminLead(id);
      setMessage("Moved to Deleted");
      setSelectedId(null);
      await loadLeads();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete submission",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function restoreLead(id: string) {
    setUpdating(true);
    setError("");

    try {
      await patchAdminLead(id, { restore: true });
      setMessage("Restored to inbox");
      setSelectedId(null);
      await loadLeads();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not restore submission",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <div className="admin-editor-header">
        <Link href="/admin" className="admin-back-link">
          ← Dashboard
        </Link>
        <h1 className="admin-title">Enquiries & queries</h1>
        <p className="admin-subtitle">
          Programme enquiries from /enquire-now and contact messages from
          /contact. Delete moves items to the Deleted tab where they can be
          restored.
        </p>
      </div>

      <div className="admin-leads-filters">
        <div className="admin-chip-row">
          <button
            type="button"
            className={`admin-chip${view === "inbox" ? " admin-chip--active" : ""}`}
            onClick={() => {
              setView("inbox");
              setStatusFilter("");
              setReadFilter("");
            }}
          >
            Inbox
          </button>
          <button
            type="button"
            className={`admin-chip${view === "deleted" ? " admin-chip--active" : ""}`}
            onClick={() => {
              setView("deleted");
              setStatusFilter("");
              setReadFilter("");
            }}
          >
            Deleted
          </button>
        </div>

        <div className="admin-chip-row">
          <button
            type="button"
            className={`admin-chip${typeFilter === "" ? " admin-chip--active" : ""}`}
            onClick={() => setTypeFilter("")}
          >
            All types
          </button>
          <button
            type="button"
            className={`admin-chip${typeFilter === "enquiry" ? " admin-chip--active" : ""}`}
            onClick={() => setTypeFilter("enquiry")}
          >
            Enquiries
          </button>
          <button
            type="button"
            className={`admin-chip${typeFilter === "contact" ? " admin-chip--active" : ""}`}
            onClick={() => setTypeFilter("contact")}
          >
            Contact queries
          </button>
        </div>

        {view === "inbox" ? (
          <div className="admin-chip-row">
            <button
              type="button"
              className={`admin-chip${readFilter === "" && statusFilter === "" ? " admin-chip--active" : ""}`}
              onClick={() => {
                setReadFilter("");
                setStatusFilter("");
              }}
            >
              All
            </button>
            <button
              type="button"
              className={`admin-chip${readFilter === "unread" ? " admin-chip--active" : ""}`}
              onClick={() => {
                setReadFilter("unread");
                setStatusFilter("");
              }}
            >
              Unread
            </button>
            <button
              type="button"
              className={`admin-chip${readFilter === "read" ? " admin-chip--active" : ""}`}
              onClick={() => {
                setReadFilter("read");
                setStatusFilter("");
              }}
            >
              Read
            </button>
          </div>
        ) : null}

        {view === "inbox" ? (
          <select
            className="admin-input admin-input--compact"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as LeadStatus | "");
              if (event.target.value) setReadFilter("");
            }}
            aria-label="Filter by workflow status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-hint">{message}</p> : null}
      {loading ? <p className="admin-hint">Loading submissions…</p> : null}

      {!loading && leads.length === 0 ? (
        <div className="admin-card">
          <p className="admin-hint">
            {view === "deleted"
              ? "No deleted submissions. Deleted items appear here and can be restored."
              : "No submissions match this filter yet."}
          </p>
        </div>
      ) : null}

      {!loading && leads.length > 0 ? (
        <div className="admin-leads-layout">
          <div className="admin-leads-list">
            {leads.map((lead) => {
              const unread = isLeadUnread(lead);
              return (
                <button
                  key={lead.id}
                  type="button"
                  className={`admin-leads-list-item${selectedId === lead.id ? " admin-leads-list-item--active" : ""}${unread ? " admin-leads-list-item--unread" : ""}`}
                  onClick={() => {
                    setSelectedId(lead.id);
                    if (view === "inbox" && unread) {
                      void updateStatus(lead.id, "read");
                    }
                  }}
                >
                  <span
                    className={`admin-lead-badge admin-lead-badge--${lead.type}`}
                  >
                    {lead.type === "enquiry" ? "Enquiry" : "Query"}
                  </span>
                  <span className="admin-leads-list-item-title">
                    {lead.name}
                  </span>
                  <span className="admin-leads-list-item-meta">
                    {lead.type === "enquiry"
                      ? (lead.program ?? "Programme")
                      : (lead.subject ?? "Contact")}
                  </span>
                  <span className="admin-leads-list-item-date">
                    {view === "deleted" && lead.deletedAt
                      ? `Deleted ${formatLeadDate(lead.deletedAt)}`
                      : formatLeadDate(lead.createdAt)}
                  </span>
                  {view === "inbox" ? (
                    <span
                      className={`admin-lead-status${unread ? " admin-lead-status--unread" : " admin-lead-status--read"}`}
                    >
                      {unread ? "Unread" : "Read"}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="admin-lead-detail">
              <div className="admin-lead-detail-header">
                <div>
                  <span
                    className={`admin-lead-badge admin-lead-badge--${selected.type}`}
                  >
                    {selected.type === "enquiry" ? "Enquiry" : "Contact query"}
                  </span>
                  <h2 className="admin-lead-detail-title">{selected.name}</h2>
                  <p className="admin-hint">
                    {formatLeadDate(selected.createdAt)}
                    {selected.source ? ` · ${selected.source}` : ""}
                    {view === "inbox" ? (
                      <>
                        {" · "}
                        <span
                          className={`admin-lead-status${isLeadUnread(selected) ? " admin-lead-status--unread" : " admin-lead-status--read"}`}
                        >
                          {isLeadUnread(selected) ? "Unread" : "Read"}
                        </span>
                      </>
                    ) : null}
                    {selected.readAt && !isLeadUnread(selected)
                      ? ` · Opened ${formatLeadDate(selected.readAt)}`
                      : ""}
                    {selected.deletedAt
                      ? ` · Deleted ${formatLeadDate(selected.deletedAt)}`
                      : ""}
                  </p>
                </div>
                {view === "inbox" ? (
                  <select
                    className="admin-input admin-input--compact"
                    value={selected.status}
                    disabled={updating}
                    onChange={(event) =>
                      updateStatus(
                        selected.id,
                        event.target.value as LeadStatus,
                      )
                    }
                    aria-label="Lead status"
                  >
                    {STATUS_OPTIONS.filter((option) => option.value !== "").map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                ) : null}
              </div>

              <dl className="admin-lead-meta">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </dd>
                </div>
                {selected.phone ? (
                  <div>
                    <dt>Phone / WhatsApp</dt>
                    <dd>
                      <a
                        href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selected.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {selected.program ? (
                  <div>
                    <dt>Programme</dt>
                    <dd>{selected.program}</dd>
                  </div>
                ) : null}
                {selected.subject ? (
                  <div>
                    <dt>Subject</dt>
                    <dd>{selected.subject}</dd>
                  </div>
                ) : null}
                {selected.startDate ? (
                  <div>
                    <dt>Preferred start</dt>
                    <dd>{selected.startDate}</dd>
                  </div>
                ) : null}
                {selected.accommodation ? (
                  <div>
                    <dt>Accommodation</dt>
                    <dd>{selected.accommodation}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="admin-lead-message">
                <h3 className="admin-label">Message</h3>
                <p>{selected.message}</p>
              </div>

              <div className="admin-lead-detail-actions">
                {view === "inbox" ? (
                  <>
                    {isLeadUnread(selected) ? (
                      <button
                        type="button"
                        className="admin-btn-sm"
                        disabled={updating}
                        onClick={() => updateStatus(selected.id, "read")}
                      >
                        Mark as read
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn-sm"
                        disabled={updating}
                        onClick={() => updateStatus(selected.id, "new")}
                      >
                        Mark as unread
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn-sm admin-btn-sm--danger"
                      disabled={updating}
                      onClick={() => deleteLead(selected.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="admin-btn-sm"
                    disabled={updating}
                    onClick={() => restoreLead(selected.id)}
                  >
                    Restore to inbox
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
