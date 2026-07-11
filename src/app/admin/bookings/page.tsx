"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { BookingRecord } from "@/content/types/booking";

/**
 * Format booking date for admin display.
 *
 * @param iso - ISO timestamp
 */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/**
 * Admin list of course and retreat bookings with soft delete.
 */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [view, setView] = useState<"active" | "deleted">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = view === "deleted" ? "?deleted=true" : "";
    const response = await fetch(`/api/admin/bookings${params}`);
    if (!response.ok) {
      setError("Failed to load bookings");
      setBookings([]);
      setLoading(false);
      return;
    }
    const body = (await response.json()) as { bookings: BookingRecord[] };
    setBookings(body.bookings);
    setLoading(false);
  }, [view]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function deleteBooking(id: string) {
    if (!window.confirm("Move this booking to Deleted?")) return;
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Could not delete booking");
      return;
    }
    await loadBookings();
  }

  async function restoreBooking(id: string) {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    if (!response.ok) {
      setError("Could not restore booking");
      return;
    }
    await loadBookings();
  }

  return (
    <div>
      <div className="admin-editor-header">
        <Link href="/admin" className="admin-back-link">
          ← Dashboard
        </Link>
        <h1 className="admin-title">Bookings</h1>
        <p className="admin-subtitle">
          Course and retreat reservations paid via PayPal.
        </p>
      </div>

      <div className="admin-chip-row admin-leads-filters">
        <button
          type="button"
          className={`admin-chip${view === "active" ? " admin-chip--active" : ""}`}
          onClick={() => setView("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={`admin-chip${view === "deleted" ? " admin-chip--active" : ""}`}
          onClick={() => setView("deleted")}
        >
          Deleted
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {loading ? <p className="admin-hint">Loading bookings…</p> : null}

      {!loading && bookings.length === 0 ? (
        <div className="admin-card">
          <p className="admin-hint">No bookings in this view yet.</p>
        </div>
      ) : null}

      <div className="admin-media-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="admin-media-list-item">
            <div className="admin-media-list-body">
              <p className="admin-media-list-title">
                {booking.name} — {booking.programTitle}
              </p>
              <p className="admin-media-list-desc">
                {booking.type} · {booking.roomType} · {booking.batchDate}
              </p>
              <p className="admin-hint admin-hint--tight">
                {booking.email} · {booking.phone} ·{" "}
                {formatUsd(booking.totalPayNowUsd)} paid · {booking.status} ·{" "}
                {formatDate(booking.createdAt)}
              </p>
            </div>
            <div className="admin-media-list-actions">
              {view === "active" ? (
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--danger"
                  onClick={() => deleteBooking(booking.id)}
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => restoreBooking(booking.id)}
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatUsd(amount: number): string {
  return `${Math.round(amount)} USD`;
}
