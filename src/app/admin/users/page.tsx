"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminUsers } from "@/lib/api/admin-client";
import type { SiteUserRecord } from "@/lib/cms/users";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SiteUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminUsers()
      .then((body) => {
        if (!body.dbEnabled) {
          setError("Database is not connected — users cannot be loaded.");
          setUsers([]);
        } else {
          setUsers(body.users ?? []);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load users");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.emailVerifiedAt !== null).length;

  const stats = [
    { label: "Total users", value: String(totalUsers) },
    { label: "Verified", value: String(verifiedUsers) },
    { label: "Unverified", value: String(totalUsers - verifiedUsers) },
  ];

  return (
    <div>
      <div className="admin-editor-header">
        <Link href="/admin" className="admin-back-link">
          ← Dashboard
        </Link>
        <h1 className="admin-title">Users</h1>
        <p className="admin-subtitle">
          Registered site accounts. Click a user to view their full activity —
          quiz attempts, enquiries, and bookings.
        </p>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="admin-stat-card admin-stat-card--neutral"
          >
            <p className="admin-stat-label">{stat.label}</p>
            <p className="admin-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div
        className="admin-card admin-card--flush"
        style={{ marginTop: "1.5rem" }}
      >
        {loading ? (
          <p className="admin-hint admin-hint--padded">Loading users…</p>
        ) : users.length === 0 ? (
          <div className="admin-empty-card">
            <p className="admin-hint">No registered users yet.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th style={{ width: "8rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table-title">{user.name}</div>
                      <div className="admin-table-slug">{user.email}</div>
                    </td>
                    <td>
                      <span
                        className={`admin-status-chip ${
                          user.emailVerifiedAt
                            ? "admin-status-chip--ok"
                            : "admin-status-chip--warn"
                        }`}
                      >
                        {user.emailVerifiedAt ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td className="admin-row-actions">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="admin-btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
