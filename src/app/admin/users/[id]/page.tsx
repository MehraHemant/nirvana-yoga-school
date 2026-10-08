"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminUser } from "@/lib/api/admin-client";
import type { SiteUserDetail } from "@/lib/cms/users";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [userId, setUserId] = useState<string>("");
  const [detail, setDetail] = useState<SiteUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");

    fetchAdminUser(userId)
      .then((body) => {
        if (!body.dbEnabled || !body.user) {
          setError("User not found or database is unavailable.");
          setDetail(null);
        } else {
          setDetail(body.user);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load user");
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div>
        <div className="admin-editor-header">
          <Link href="/admin/users" className="admin-back-link">
            ← Users
          </Link>
          <h1 className="admin-title">Loading…</h1>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div>
        <div className="admin-editor-header">
          <Link href="/admin/users" className="admin-back-link">
            ← Users
          </Link>
          <h1 className="admin-title">User not found</h1>
        </div>
        <div className="admin-card">
          <p className="admin-error">{error || "This user does not exist."}</p>
        </div>
      </div>
    );
  }

  const totalQuizPts = detail.quizAttempts.reduce((s, a) => s + a.score, 0);

  return (
    <div>
      <div className="admin-editor-header">
        <Link href="/admin/users" className="admin-back-link">
          ← Users
        </Link>
        <h1 className="admin-title">{detail.name}</h1>
        <p className="admin-subtitle">
          {detail.email}
          {detail.emailVerifiedAt
            ? ` · Verified ${formatDate(detail.emailVerifiedAt)}`
            : " · Unverified"}
          {" · Joined "}
          {formatDate(detail.createdAt)}
        </p>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card admin-stat-card--neutral">
          <p className="admin-stat-label">Quiz attempts</p>
          <p className="admin-stat-value">{detail.quizAttempts.length}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--neutral">
          <p className="admin-stat-label">Quiz points</p>
          <p className="admin-stat-value">{totalQuizPts}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--neutral">
          <p className="admin-stat-label">Enquiries</p>
          <p className="admin-stat-value">
            {detail.leads.filter((l) => l.type === "enquiry").length}
          </p>
        </div>
        <div className="admin-stat-card admin-stat-card--neutral">
          <p className="admin-stat-label">Bookings</p>
          <p className="admin-stat-value">{detail.bookings.length}</p>
        </div>
      </div>

      {detail.quizAttempts.length > 0 ? (
        <div className="admin-card" style={{ marginTop: "1.5rem" }}>
          <h2
            className="admin-title"
            style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}
          >
            Quiz history
          </h2>
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Skipped</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {detail.quizAttempts.map((attempt) => {
                  const pct = Math.round(
                    (attempt.score / Math.max(1, attempt.maxScore)) * 100,
                  );
                  return (
                    <tr key={attempt.id}>
                      <td>{formatDate(attempt.completedAt)}</td>
                      <td>
                        <span
                          className={`admin-status-chip ${
                            pct >= 70
                              ? "admin-status-chip--ok"
                              : pct >= 40
                                ? "admin-status-chip--warn"
                                : "admin-status-chip--danger"
                          }`}
                        >
                          {pct}%
                        </span>
                        <div className="admin-table-meta">
                          {attempt.score}/{attempt.maxScore} pts
                        </div>
                      </td>
                      <td>{attempt.correct}</td>
                      <td>{attempt.skipped}</td>
                      <td>{formatDurationMs(attempt.totalTimeMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {detail.leads.length > 0 ? (
        <div className="admin-card" style={{ marginTop: "1.5rem" }}>
          <h2
            className="admin-title"
            style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}
          >
            Enquiries & contact
          </h2>
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Program / Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {detail.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td>
                      <span
                        className={`admin-status-chip ${
                          lead.type === "enquiry"
                            ? "admin-status-chip--ok"
                            : "admin-status-chip--warn"
                        }`}
                      >
                        {lead.type === "enquiry" ? "Enquiry" : "Contact"}
                      </span>
                    </td>
                    <td>{lead.program || lead.subject || "—"}</td>
                    <td style={{ maxWidth: "24rem" }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lead.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {detail.bookings.length > 0 ? (
        <div className="admin-card" style={{ marginTop: "1.5rem" }}>
          <h2
            className="admin-title"
            style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}
          >
            Bookings
          </h2>
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Programme</th>
                  <th>Room</th>
                  <th>Batch</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{formatDate(booking.createdAt)}</td>
                    <td>
                      <div className="admin-table-title">
                        {booking.programTitle}
                      </div>
                      <div className="admin-table-slug">
                        {booking.programSlug}
                      </div>
                    </td>
                    <td>{booking.roomType}</td>
                    <td>{booking.batchDate}</td>
                    <td>
                      ${booking.fullAmountUsd.toFixed(2)}
                      {booking.remainingUsd > 0 && (
                        <div className="admin-table-meta">
                          ${booking.remainingUsd.toFixed(2)} remaining
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-status-chip ${
                          booking.status === "confirmed"
                            ? "admin-status-chip--ok"
                            : booking.status === "cancelled"
                              ? "admin-status-chip--danger"
                              : "admin-status-chip--warn"
                        }`}
                      >
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {detail.quizAttempts.length === 0 &&
        detail.leads.length === 0 &&
        detail.bookings.length === 0 && (
          <div className="admin-card" style={{ marginTop: "1.5rem" }}>
            <p className="admin-hint">
              This user has not taken any quiz, submitted an enquiry, or made a
              booking yet.
            </p>
          </div>
        )}
    </div>
  );
}
