import Link from "next/link";
import { redirect } from "next/navigation";
import type { LeadStats } from "@/content/types/lead";
import { isLeadUnread } from "@/content/types/lead";
import { getServerSession } from "@/lib/cms/auth";
import { getBookingStats } from "@/lib/cms/bookings";
import { getLeadStats } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * Format an ISO date for the admin dashboard.
 *
 * @param iso - ISO timestamp
 */
function formatLeadDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  accent?: "primary" | "secondary" | "neutral";
};

/**
 * Metric tile for enquiry and contact counts.
 *
 * @param props - Label, value, hint, and accent color
 */
function StatCard({ label, value, hint, accent = "neutral" }: StatCardProps) {
  return (
    <div className={`admin-stat-card admin-stat-card--${accent}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value.toLocaleString()}</p>
      <p className="admin-stat-hint">{hint}</p>
    </div>
  );
}

type DashboardLeadsProps = {
  stats: LeadStats;
};

/**
 * Enquiry and contact overview for the CMS dashboard.
 *
 * @param props - Aggregated lead statistics
 */
function DashboardLeads({ stats }: DashboardLeadsProps) {
  return (
    <>
      <div className="admin-stat-grid">
        <StatCard
          label="Programme enquiries"
          value={stats.totalEnquiries}
          hint={`${stats.enquiriesThisWeek} this week · ${stats.enquiriesThisMonth} this month`}
          accent="primary"
        />
        <StatCard
          label="Contact queries"
          value={stats.totalContact}
          hint={`${stats.contactThisWeek} this week · ${stats.contactThisMonth} this month`}
          accent="secondary"
        />
        <StatCard
          label="Unread"
          value={stats.newCount}
          hint="Awaiting review in the inbox"
          accent="neutral"
        />
        <StatCard
          label="In deleted"
          value={stats.deletedCount}
          hint="Soft-deleted — restore from /admin/leads"
          accent="neutral"
        />
      </div>

      <div className="admin-card admin-card--flush">
        <div className="admin-card-header">
          <h2>Recent submissions</h2>
          <Link href="/admin/leads" className="admin-link-inline">
            View all →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="admin-hint admin-hint--padded">
            No submissions yet. Enquiries from{" "}
            <Link href="/enquire-now" target="_blank" rel="noopener noreferrer">
              /enquire-now
            </Link>{" "}
            and contact messages from{" "}
            <Link href="/contact" target="_blank" rel="noopener noreferrer">
              /contact
            </Link>{" "}
            will appear here.
          </p>
        ) : (
          <div className="admin-leads-table">
            {stats.recent.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads?highlight=${lead.id}`}
                className="admin-leads-row"
              >
                <span
                  className={`admin-lead-badge admin-lead-badge--${lead.type}`}
                >
                  {lead.type === "enquiry" ? "Enquiry" : "Query"}
                </span>
                <span className="admin-leads-row-main">
                  <strong>{lead.name}</strong>
                  <span className="admin-leads-row-meta">
                    {lead.type === "enquiry"
                      ? (lead.program ?? "Programme enquiry")
                      : (lead.subject ?? "Contact message")}
                  </span>
                </span>
                <span className="admin-leads-row-date">
                  {formatLeadDate(lead.createdAt)}
                </span>
                {isLeadUnread(lead) ? (
                  <span className="admin-lead-status admin-lead-status--unread">
                    Unread
                  </span>
                ) : (
                  <span className="admin-lead-status admin-lead-status--read">
                    Read
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * CMS admin dashboard with lead metrics and content quick links.
 */
export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const dbEnabled = isDbEnabled();
  const stats = dbEnabled ? await getLeadStats() : null;
  const bookingStats = dbEnabled ? await getBookingStats() : null;

  return (
    <div>
      <h1 className="admin-title">Content dashboard</h1>
      <p className="admin-subtitle">
        Track enquiries, contact queries, and manage site content.
      </p>

      {dbEnabled && bookingStats ? (
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <h2 className="admin-section-title">Bookings</h2>
            <Link href="/admin/bookings" className="admin-btn-sm">
              View all
            </Link>
          </div>
          <div className="admin-stat-grid">
            <StatCard
              label="Confirmed"
              value={bookingStats.confirmed}
              hint="Paid via PayPal"
              accent="primary"
            />
            <StatCard
              label="Pending payment"
              value={bookingStats.pending}
              hint="Started but not completed"
              accent="neutral"
            />
            <StatCard
              label="In deleted"
              value={bookingStats.deleted}
              hint="Soft-deleted bookings"
              accent="neutral"
            />
          </div>
        </section>
      ) : null}

      {dbEnabled && stats ? (
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <h2 className="admin-section-title">Leads & enquiries</h2>
            <Link href="/admin/leads" className="admin-btn-sm">
              Open inbox
            </Link>
          </div>
          <DashboardLeads stats={stats} />
        </section>
      ) : (
        <div className="admin-card">
          <h2>Leads & enquiries</h2>
          <p className="admin-hint">
            Connect Neon Postgres via NEON_DB_POSTGRES_URL to track contact and enquiry
            form submissions on the dashboard.
          </p>
        </div>
      )}

      <section className="admin-dashboard-section">
        <h2 className="admin-section-title">Site management</h2>
        <div className="admin-grid-2">
          <div className="admin-card">
            <h2>Data source</h2>
            <p className="admin-hint">
              {dbEnabled
                ? "Neon Postgres is connected via NEON_DB_POSTGRES_URL."
                : "NEON_DB_POSTGRES_URL is not set — CMS data is unavailable."}
            </p>
          </div>
          <div className="admin-card">
            <h2>Quick links</h2>
            <p>
              <Link href="/admin/sections/courses">Courses →</Link>
            </p>
            <p>
              <Link href="/admin/sections/online">Online courses →</Link>
            </p>
            <p>
              <Link href="/admin/blog">Blog →</Link>
            </p>
            <p>
              <Link href="/admin/components/header">Header →</Link>
            </p>
            <p>
              <Link href="/admin/components/footer">Footer →</Link>
            </p>
            <p>
              <Link href="/admin/media">Media library →</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
