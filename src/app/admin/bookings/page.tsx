"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import type {
  BookingRecord,
  BookingStatus,
  BookingType,
} from "@/content/types/booking";
import {
  deleteAdminBooking,
  fetchAdminBookings,
  patchAdminBooking,
} from "@/lib/api/admin-client";

type StatusFilter = BookingStatus | "";
type TypeFilter = BookingType | "";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "", label: "Courses & retreats" },
  { value: "course", label: "Courses" },
  { value: "retreat", label: "Retreats" },
];

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
  return `$${Math.round(amount).toLocaleString("en-US")}`;
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
 * Digits-only phone for wa.me links.
 *
 * @param phone - Stored phone (may include +, spaces, dashes)
 */
function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

/**
 * Sum of add-on prices on a booking.
 *
 * @param booking - Booking row
 */
function addonsTotal(booking: BookingRecord): number {
  return (booking.addons ?? []).reduce((sum, item) => sum + item.priceUsd, 0);
}

/**
 * Lowercased text a booking can be searched by.
 *
 * @param booking - Booking row
 */
function searchHaystack(booking: BookingRecord): string {
  return [
    booking.name,
    booking.email,
    booking.phone,
    booking.programTitle,
    booking.roomType,
    booking.batchDate,
    booking.country,
    booking.referenceCode,
    booking.paypalOrderId,
    booking.id,
    ...(booking.addons ?? []).map((item) => item.label),
    ...(booking.additionalGuests ?? []).map((guest) => guest.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Escapes one CSV cell.
 *
 * @param value - Cell value
 */
function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Downloads the given bookings as a CSV file.
 *
 * @param rows - Bookings to export
 */
function downloadCsv(rows: BookingRecord[]) {
  const header = [
    "Booked at",
    "Status",
    "Type",
    "Program",
    "Batch",
    "Room",
    "Guest",
    "Gender",
    "Email",
    "Phone",
    "Country",
    "Additional guests",
    "Add-ons",
    "Add-ons USD",
    "Total USD",
    "Payment mode",
    "Paid now USD",
    "PayPal fee USD",
    "Due on arrival USD",
    "Reference code",
    "Heard about us",
    "PayPal order",
    "Booking id",
  ];
  const lines = rows.map((b) =>
    [
      b.createdAt,
      statusLabel(b.status),
      b.type,
      b.programTitle,
      b.batchDate,
      b.roomType,
      b.name,
      b.gender,
      b.email,
      b.phone,
      b.country,
      (b.additionalGuests ?? [])
        .map((g) => (g.gender ? `${g.name} (${g.gender})` : g.name))
        .join("; "),
      (b.addons ?? [])
        .map((a) => `${a.label} ($${Math.round(a.priceUsd)})`)
        .join("; "),
      addonsTotal(b),
      b.fullAmountUsd,
      b.paymentMode === "deposit_20" ? "20% deposit" : "Full",
      b.totalPayNowUsd,
      b.paypalFeeUsd,
      b.remainingUsd,
      b.referenceCode,
      b.hearAbout,
      b.paypalOrderId,
      b.id,
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Admin list of course and retreat bookings with filters, details and soft delete.
 */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [view, setView] = useState<"active" | "deleted">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter && booking.status !== statusFilter) return false;
      if (typeFilter && booking.type !== typeFilter) return false;
      if (needle && !searchHaystack(booking).includes(needle)) return false;
      return true;
    });
  }, [bookings, query, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const confirmed = filtered.filter((b) => b.status === "confirmed");
    return {
      total: filtered.length,
      confirmed: confirmed.length,
      pending: filtered.filter((b) => b.status === "pending_payment").length,
      collected: confirmed.reduce((sum, b) => sum + b.totalPayNowUsd, 0),
      due: confirmed.reduce((sum, b) => sum + b.remainingUsd, 0),
      addons: confirmed.reduce((sum, b) => sum + addonsTotal(b), 0),
    };
  }, [filtered]);

  const hasFilters = Boolean(query.trim() || statusFilter || typeFilter);

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
          <div className="admin-bookings-header-actions">
            <button
              type="button"
              className="admin-btn-sm"
              disabled={filtered.length === 0}
              onClick={() => downloadCsv(filtered)}
            >
              Export CSV
            </button>
            <Link href="/admin/bookings/addons" className="admin-btn-sm">
              Manage add-ons
            </Link>
          </div>
        </div>
      </div>

      {view === "active" && !loading && bookings.length > 0 ? (
        <div className="admin-stat-grid">
          <div className="admin-stat-card admin-stat-card--primary">
            <p className="admin-stat-label">Bookings</p>
            <p className="admin-stat-value">{stats.total}</p>
            <p className="admin-stat-hint">
              {stats.confirmed} confirmed · {stats.pending} pending
            </p>
          </div>
          <div className="admin-stat-card admin-stat-card--secondary">
            <p className="admin-stat-label">Collected</p>
            <p className="admin-stat-value">{formatUsd(stats.collected)}</p>
            <p className="admin-stat-hint">Paid online, confirmed only</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Due on arrival</p>
            <p className="admin-stat-value">{formatUsd(stats.due)}</p>
            <p className="admin-stat-hint">Balance from 20% deposits</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Add-on revenue</p>
            <p className="admin-stat-value">{formatUsd(stats.addons)}</p>
            <p className="admin-stat-hint">Within confirmed totals</p>
          </div>
        </div>
      ) : null}

      <div className="admin-leads-filters">
        <div className="admin-chip-row">
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
        <AdminSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search guest, email, phone, program, add-on…"
          ariaLabel="Search bookings"
        />
        <select
          className="admin-input admin-input--compact"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="admin-input admin-input--compact"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          aria-label="Filter by booking type"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasFilters ? (
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              setQuery("");
              setStatusFilter("");
              setTypeFilter("");
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {loading ? <p className="admin-hint">Loading bookings…</p> : null}

      {!loading && filtered.length === 0 ? (
        <div className="admin-empty-card">
          <p>
            {hasFilters && bookings.length > 0
              ? "No bookings match these filters."
              : "No bookings in this view yet."}
          </p>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className="admin-card admin-bookings-card">
          <div className="admin-table-scroll">
            <table className="admin-table admin-table--section admin-bookings-table">
              <thead>
                <tr>
                  <th scope="col" className="admin-bookings-col-guest">
                    Guest
                  </th>
                  <th scope="col" className="admin-bookings-col-program">
                    Program &amp; stay
                  </th>
                  <th scope="col" className="admin-bookings-col-addons">
                    Add-ons
                  </th>
                  <th scope="col" className="admin-bookings-col-amount">
                    Amount
                  </th>
                  <th scope="col" className="admin-bookings-col-status">
                    Status
                  </th>
                  <th scope="col" className="admin-bookings-col-booked">
                    Booked
                  </th>
                  <th scope="col" className="admin-table-col--actions">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const addons = booking.addons ?? [];
                  const guests = booking.additionalGuests ?? [];
                  const expanded = expandedId === booking.id;
                  const wa = whatsappHref(booking.phone);
                  return (
                    <Fragment key={booking.id}>
                      <tr
                        className={`admin-bookings-row${expanded ? " admin-bookings-row--open" : ""}`}
                      >
                        <td>
                          <p className="admin-table-title">
                            {booking.name}
                            {guests.length > 0 ? (
                              <span className="admin-bookings-guest-count">
                                +{guests.length}
                              </span>
                            ) : null}
                          </p>
                          <a
                            className="admin-table-slug admin-bookings-link"
                            href={`mailto:${booking.email}`}
                          >
                            {booking.email}
                          </a>
                          {wa ? (
                            <a
                              className="admin-table-slug admin-bookings-link"
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              title="Open in WhatsApp"
                            >
                              {booking.phone}
                            </a>
                          ) : (
                            <p className="admin-table-slug">{booking.phone}</p>
                          )}
                        </td>
                        <td>
                          <p className="admin-table-title admin-bookings-program">
                            {booking.programTitle}
                          </p>
                          <p className="admin-table-slug">
                            <span className="admin-type-pill">
                              {booking.type}
                            </span>{" "}
                            {booking.roomType}
                          </p>
                          <p className="admin-table-slug">
                            {booking.batchDate}
                          </p>
                        </td>
                        <td className="admin-bookings-col-addons">
                          {addons.length > 0 ? (
                            <ul className="admin-bookings-addons">
                              {addons.map((item) => (
                                <li key={item.id}>
                                  <span className="admin-bookings-addon-label">
                                    {item.label}
                                  </span>
                                  <span className="admin-bookings-addon-price">
                                    {formatUsd(item.priceUsd)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="admin-bookings-muted">—</span>
                          )}
                        </td>
                        <td className="admin-bookings-col-amount">
                          <p className="admin-table-title">
                            {formatUsd(booking.fullAmountUsd)}
                          </p>
                          <p className="admin-table-slug">
                            {booking.paymentMode === "deposit_20"
                              ? `Deposit ${formatUsd(booking.totalPayNowUsd)}`
                              : `Paid in full ${formatUsd(booking.totalPayNowUsd)}`}
                          </p>
                          {booking.remainingUsd > 0 ? (
                            <p className="admin-table-slug">
                              {formatUsd(booking.remainingUsd)} on arrival
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
                          <button
                            type="button"
                            className="admin-btn-sm"
                            aria-expanded={expanded}
                            onClick={() =>
                              setExpandedId(expanded ? null : booking.id)
                            }
                          >
                            {expanded ? "Hide" : "Details"}
                          </button>
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
                      {expanded ? (
                        <tr className="admin-bookings-detail-row">
                          <td colSpan={7}>
                            <BookingDetails booking={booking} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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

/**
 * One labelled value in the booking detail panel.
 *
 * @param props - Label, value, and optional presentation
 */
function DetailRow({
  label,
  value,
  money = false,
  total = false,
  mono = false,
}: {
  label: string;
  value: string;
  money?: boolean;
  total?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={`admin-bookings-detail-row-item${total ? " admin-bookings-detail-row-item--total" : ""}${money ? " admin-bookings-detail-row-item--money" : ""}`}
    >
      <span className="admin-bookings-detail-label">{label}</span>
      <span
        className={`admin-bookings-detail-value${mono ? " admin-bookings-mono" : ""}${money ? " admin-bookings-detail-value--money" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Expanded panel: guests, price breakdown, and payment references.
 *
 * @param props - Booking to describe
 */
function BookingDetails({ booking }: { booking: BookingRecord }) {
  const addons = booking.addons ?? [];
  const guests = booking.additionalGuests ?? [];
  const roomUsd = booking.basePriceUsd - addonsTotal(booking);

  return (
    <div className="admin-bookings-detail">
      <section className="admin-bookings-detail-card">
        <h3 className="admin-bookings-detail-title">Guests</h3>
        <div className="admin-bookings-detail-list">
          <DetailRow
            label="Primary"
            value={`${booking.name}${booking.gender ? ` · ${booking.gender}` : ""}`}
          />
          {guests.map((guest, index) => (
            <DetailRow
              key={`${guest.name}-${index}`}
              label={`Guest ${index + 2}`}
              value={`${guest.name}${guest.gender ? ` · ${guest.gender}` : ""}`}
            />
          ))}
          {booking.country ? (
            <DetailRow label="Country" value={booking.country} />
          ) : null}
          {booking.hearAbout ? (
            <DetailRow label="Heard via" value={booking.hearAbout} />
          ) : null}
          {booking.referenceCode ? (
            <DetailRow label="Reference" value={booking.referenceCode} />
          ) : null}
        </div>
      </section>

      <section className="admin-bookings-detail-card">
        <h3 className="admin-bookings-detail-title">Price breakdown</h3>
        <div className="admin-bookings-detail-list admin-bookings-detail-list--money">
          <DetailRow
            label={booking.roomType}
            value={formatUsd(roomUsd)}
            money
          />
          {addons.map((item) => (
            <DetailRow
              key={item.id}
              label={item.label}
              value={formatUsd(item.priceUsd)}
              money
            />
          ))}
          <DetailRow
            label="Total"
            value={formatUsd(booking.fullAmountUsd)}
            money
            total
          />
          <DetailRow
            label={
              booking.paymentMode === "deposit_20"
                ? "20% deposit"
                : "Paid in full"
            }
            value={formatUsd(booking.payNowUsd)}
            money
          />
          <DetailRow
            label="PayPal fee"
            value={formatUsd(booking.paypalFeeUsd)}
            money
          />
          <DetailRow
            label="Charged online"
            value={formatUsd(booking.totalPayNowUsd)}
            money
            total
          />
          <DetailRow
            label="Due on arrival"
            value={formatUsd(booking.remainingUsd)}
            money
          />
        </div>
      </section>

      <section className="admin-bookings-detail-card">
        <h3 className="admin-bookings-detail-title">Payment</h3>
        <div className="admin-bookings-detail-list admin-bookings-detail-list--stack">
          <DetailRow label="Booking id" value={booking.id} mono />
          <DetailRow
            label="PayPal order"
            value={booking.paypalOrderId ?? "—"}
            mono
          />
          <DetailRow
            label="PayPal capture"
            value={booking.paypalCaptureId ?? "—"}
            mono
          />
          {booking.promoCode ? (
            <DetailRow label="Promo code" value={booking.promoCode} />
          ) : null}
          <DetailRow label="Booked" value={formatDate(booking.createdAt)} />
          {booking.confirmedAt ? (
            <DetailRow
              label="Confirmed"
              value={formatDate(booking.confirmedAt)}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
