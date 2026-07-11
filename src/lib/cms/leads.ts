import type {
  LeadStats,
  LeadStatus,
  LeadSubmissionInput,
} from "@/content/types/lead";
import { prisma } from "@/lib/db";

/** Prisma filter for active (non-deleted) leads. */
const ACTIVE_LEAD_FILTER = { deletedAt: null } as const;

/**
 * Persist a contact or enquiry form submission.
 *
 * @param input - Validated lead payload
 * @returns Created lead id
 */
export async function createLeadSubmission(input: LeadSubmissionInput) {
  const lead = await prisma.leadSubmission.create({
    data: {
      type: input.type,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      subject: input.subject?.trim() || null,
      program: input.program?.trim() || null,
      accommodation: input.accommodation?.trim() || null,
      startDate: input.startDate?.trim() || null,
      message: input.message.trim(),
      source: input.source?.trim() || null,
    },
  });

  return lead.id;
}

/**
 * Map a Prisma lead row to an API record.
 *
 * @param lead - Database row
 */
function toLeadRecord(lead: {
  id: string;
  type: "enquiry" | "contact";
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  program: string | null;
  accommodation: string | null;
  startDate: string | null;
  message: string;
  source: string | null;
  createdAt: Date;
  readAt: Date | null;
  deletedAt: Date | null;
}) {
  return {
    id: lead.id,
    type: lead.type,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? undefined,
    subject: lead.subject ?? undefined,
    program: lead.program ?? undefined,
    accommodation: lead.accommodation ?? undefined,
    startDate: lead.startDate ?? undefined,
    message: lead.message,
    source: lead.source ?? undefined,
    createdAt: lead.createdAt.toISOString(),
    readAt: lead.readAt?.toISOString() ?? null,
    deletedAt: lead.deletedAt?.toISOString() ?? null,
  };
}

/**
 * Aggregate enquiry and contact metrics for the admin dashboard.
 *
 * @returns Counts for totals, this week, this month, and recent submissions
 */
export async function getLeadStats(): Promise<LeadStats> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    totalEnquiries,
    totalContact,
    newCount,
    deletedCount,
    enquiriesThisWeek,
    contactThisWeek,
    enquiriesThisMonth,
    contactThisMonth,
    recentRows,
  ] = await Promise.all([
    prisma.leadSubmission.count({
      where: { type: "enquiry", ...ACTIVE_LEAD_FILTER },
    }),
    prisma.leadSubmission.count({
      where: { type: "contact", ...ACTIVE_LEAD_FILTER },
    }),
    prisma.leadSubmission.count({
      where: { status: "new", ...ACTIVE_LEAD_FILTER },
    }),
    prisma.leadSubmission.count({
      where: { deletedAt: { not: null } },
    }),
    prisma.leadSubmission.count({
      where: {
        type: "enquiry",
        createdAt: { gte: weekAgo },
        ...ACTIVE_LEAD_FILTER,
      },
    }),
    prisma.leadSubmission.count({
      where: {
        type: "contact",
        createdAt: { gte: weekAgo },
        ...ACTIVE_LEAD_FILTER,
      },
    }),
    prisma.leadSubmission.count({
      where: {
        type: "enquiry",
        createdAt: { gte: monthAgo },
        ...ACTIVE_LEAD_FILTER,
      },
    }),
    prisma.leadSubmission.count({
      where: {
        type: "contact",
        createdAt: { gte: monthAgo },
        ...ACTIVE_LEAD_FILTER,
      },
    }),
    prisma.leadSubmission.findMany({
      where: ACTIVE_LEAD_FILTER,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    totalEnquiries,
    totalContact,
    newCount,
    deletedCount,
    enquiriesThisWeek,
    contactThisWeek,
    enquiriesThisMonth,
    contactThisMonth,
    recent: recentRows.map(toLeadRecord),
  };
}

/**
 * List lead submissions with optional filters.
 *
 * @param filters - Type, status, and deleted-view filters
 */
export async function listLeadSubmissions(filters?: {
  type?: "enquiry" | "contact";
  status?: LeadStatus;
  readState?: "unread" | "read";
  deleted?: boolean;
  limit?: number;
}) {
  const deletedFilter =
    filters?.deleted === true
      ? { deletedAt: { not: null } }
      : { deletedAt: null };

  const readStateFilter =
    filters?.readState === "unread"
      ? { status: "new" as const }
      : filters?.readState === "read"
        ? { status: { not: "new" as const } }
        : {};

  const rows = await prisma.leadSubmission.findMany({
    where: {
      ...deletedFilter,
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(!filters?.status ? readStateFilter : {}),
    },
    orderBy: filters?.deleted ? { deletedAt: "desc" } : { createdAt: "desc" },
    take: filters?.limit ?? 100,
  });

  return rows.map(toLeadRecord);
}

/**
 * Update lead status (mark read, replied, archived).
 *
 * @param id - Lead id
 * @param status - New status
 */
export async function updateLeadStatus(id: string, status: LeadStatus) {
  const readAt =
    status === "read" || status === "replied"
      ? new Date()
      : status === "new"
        ? null
        : undefined;

  return prisma.leadSubmission.update({
    where: { id, ...ACTIVE_LEAD_FILTER },
    data: {
      status,
      ...(readAt !== undefined ? { readAt } : {}),
    },
  });
}

/**
 * Soft-delete a lead — moves it to the Deleted section.
 *
 * @param id - Lead id
 */
export async function softDeleteLead(id: string) {
  return prisma.leadSubmission.update({
    where: { id, ...ACTIVE_LEAD_FILTER },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restore a soft-deleted lead back to the inbox.
 *
 * @param id - Lead id
 */
export async function restoreLead(id: string) {
  return prisma.leadSubmission.update({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
}

/**
 * Validate a public lead submission payload.
 *
 * @param body - Raw JSON body
 * @returns Parsed input or error message
 */
export function parseLeadInput(
  body: unknown,
): { ok: true; data: LeadSubmissionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const record = body as Record<string, unknown>;
  const type = record.type;

  if (type !== "enquiry" && type !== "contact") {
    return { ok: false, error: "Invalid lead type" };
  }

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const message =
    typeof record.message === "string" ? record.message.trim() : "";

  if (!name || name.length < 2) {
    return { ok: false, error: "Name is required" };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Valid email is required" };
  }
  if (!message || message.length < 5) {
    return { ok: false, error: "Message is required" };
  }

  if (type === "enquiry") {
    const program =
      typeof record.program === "string" ? record.program.trim() : "";
    if (!program) {
      return { ok: false, error: "Program is required for enquiries" };
    }
  }

  if (type === "contact") {
    const subject =
      typeof record.subject === "string" ? record.subject.trim() : "";
    if (!subject) {
      return { ok: false, error: "Subject is required for contact queries" };
    }
  }

  return {
    ok: true,
    data: {
      type,
      name,
      email,
      phone: typeof record.phone === "string" ? record.phone.trim() : undefined,
      subject:
        typeof record.subject === "string" ? record.subject.trim() : undefined,
      program:
        typeof record.program === "string" ? record.program.trim() : undefined,
      accommodation:
        typeof record.accommodation === "string"
          ? record.accommodation.trim()
          : undefined,
      startDate:
        typeof record.startDate === "string"
          ? record.startDate.trim()
          : undefined,
      message,
      source:
        typeof record.source === "string" ? record.source.trim() : undefined,
    },
  };
}
