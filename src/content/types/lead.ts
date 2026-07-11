/** Lead / enquiry types for contact and programme forms. */

export type LeadType = "enquiry" | "contact";

export type LeadStatus = "new" | "read" | "replied" | "archived";

/** Whether a lead is still unread in the inbox. */
export function isLeadUnread(lead: { status: LeadStatus }): boolean {
  return lead.status === "new";
}

export type LeadSubmissionInput = {
  type: LeadType;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  program?: string;
  accommodation?: string;
  startDate?: string;
  message: string;
  source?: string;
};

export type LeadSubmissionRecord = LeadSubmissionInput & {
  id: string;
  status: LeadStatus;
  createdAt: string;
  readAt: string | null;
  deletedAt: string | null;
};

export type LeadStats = {
  totalEnquiries: number;
  totalContact: number;
  newCount: number;
  deletedCount: number;
  enquiriesThisWeek: number;
  contactThisWeek: number;
  enquiriesThisMonth: number;
  contactThisMonth: number;
  recent: LeadSubmissionRecord[];
};
