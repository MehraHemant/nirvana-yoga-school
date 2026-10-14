"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { BookingRecord, BookingStatus } from "@/content/types/booking";
import {
  deleteAdminBooking,
  fetchAdminBookings,
  patchAdminBooking,
} from "@/lib/api/admin-client";

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
 * Format USD for admin display.
 *
 * @param amount - Dollar amount
 */
function formatUsd(amount: number): string {
  return `${Math.round(amount)} USD`;
}

/**
 * Human label for booking payment status.
 *
 * @param status - Booking status
 */
function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending_payment":
      return "Pending payment";
    case "confirmed":
      return "Confirmed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

/**
 * CSS modifier for a booking status chip.
 *
 * @param status - Booking status
 */
function statusTone(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "admin-status-chip--ok";
    case "pending_payment":
      return "admin-status-chip--warn";
    case "failed":
    case "cancelled":
      return "admin-status-chip--danger";
    default:
      return "";
  }
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

    try {
      const body = await fetchAdminBookings(view === "deleted");
      if (!body.dbEnabled) {
        setError("Database is not connected — bookings cannot be loaded.");
        setBookings([]);
      } else {
        setBookings(body.bookings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function deleteBooking(id: string) {
    if (!window.confirm("Move this booking to Deleted?")) return;

    try {
      await deleteAdminBooking(id);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete booking");
    }
  }

  async function restoreBooking(id: string) {
    try {
      await patchAdminBooking(id, true);
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not restore booking",
      );
    }
  }

  return (
    <div>
      <div className="admin-editor-header">
        <Link href="/admin" className="admin-back-link">
          ← Dashboard
        </Link>
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">Bookings</h1>
            <p className="admin-subtitle">
              Course and retreat reservations paid via PayPal.
            </p>
          </div>
          <Link href="/admin/bookings/addons" className="admin-btn-sm">
            Manage add-ons
          </Link>
        </div>
      </div>

      <div className="admin-chip-row admin-leads-filters">
        <button
          type="button"
          className={`admin-chip${view === "active" ? " admin-chip--active" : ""}`}
          onClick={() => setView("active")}
        >
          Active
          {view === "active" && !loading ? (
            <span className="admin-chip-count">{bookings.length}</span>
          ) : null}
        </button>
        <button
          type="button"
          className={`admin-chip${view === "deleted" ? " admin-chip--active" : ""}`}
          onClick={() => setView("deleted")}
        >
          Deleted
          {view === "deleted" && !loading ? (
            <span className="admin-chip-count">{bookings.length}</span>
          ) : null}
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {loading ? <p className="admin-hint">Loading bookings…</p> : null}

      {!loading && bookings.length === 0 ? (
        <div className="admin-empty-card">
          <p>No bookings in this view yet.</p>
        </div>
      ) : null}

      {!loading && bookings.length > 0 ? (
        <div className="admin-card admin-bookings-card">
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section admin-bookings-table">
              <thead>
                <tr>
                  <th scope="col">Guest</th>
                  <th scope="col">Program</th>
                  <th scope="col">Stay</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Status</th>
                  <th scope="col">Booked</th>
                  <th scope="col" className="admin-table-col--actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const addons = booking.addons ?? [];
                  return (
                    <tr key={booking.id}>
                      <td>
                        <p className="admin-table-title">{booking.name}</p>
                        <p className="admin-table-slug">{booking.email}</p>
                        <p className="admin-table-slug">{booking.phone}</p>
                        {booking.gender ? (
                          <p className="admin-table-slug">{booking.gender}</p>
                        ) : null}
                        {(booking.additionalGuests ?? []).map((guest, index) => (
                          <p
                            key={`${guest.name}-${index}`}
                            className="admin-table-slug"
                          >
                            + {guest.name}
                            {guest.gender ? ` · ${guest.gender}` : ""}
                          </p>
                        ))}
                      </td>
                      <td>
                        <p className="admin-table-title admin-bookings-program">
                          {booking.programTitle}
                        </p>
                        <p className="admin-table-slug">
                          <span className="admin-type-pill">
                            {booking.type}
                          </span>
                          {booking.duration ? ` · ${booking.duration}` : ""}
                        </p>
                      </td>
                      <td>
                        <p className="admin-table-title">{booking.roomType}</p>
                        <p className="admin-table-slug">{booking.batchDate}</p>
                        {addons.length > 0 ? (
                          <p className="admin-table-slug">
                            + {addons.map((item) => item.label).join(", ")}
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <p className="admin-table-title">
                          {formatUsd(booking.totalPayNowUsd)}
                        </p>
                        <p className="admin-table-slug">
                          {booking.paymentMode === "deposit_20"
                            ? "20% deposit"
                            : "Full payment"}
                        </p>
                        {booking.remainingUsd > 0 ? (
                          <p className="admin-table-slug">
                            {formatUsd(booking.remainingUsd)} due on arrival
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <span
                          className={`admin-status-chip ${statusTone(booking.status)}`}
                        >
                          {statusLabel(booking.status)}
                        </span>
                      </td>
                      <td>
                        <p className="admin-table-slug">
                          {formatDate(booking.createdAt)}
                        </p>
                      </td>
                      <td className="admin-row-actions">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
