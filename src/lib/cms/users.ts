import { db, isDbEnabled } from "@/lib/db";

export type SiteUserRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerifiedAt: string | null;
};

export type SiteUserDetail = SiteUserRecord & {
  quizAttempts: Array<{
    id: string;
    completedAt: string;
    score: number;
    maxScore: number;
    correct: number;
    incorrect: number;
    skipped: number;
    totalTimeMs: number;
  }>;
  leads: Array<{
    id: string;
    type: "enquiry" | "contact";
    status: string;
    name: string;
    program?: string;
    subject?: string;
    message: string;
    createdAt: string;
  }>;
  bookings: Array<{
    id: string;
    type: "course" | "retreat";
    status: string;
    programSlug: string;
    programTitle: string;
    roomType: string;
    batchDate: string;
    duration?: string;
    fullAmountUsd: number;
    payNowUsd: number;
    remainingUsd: number;
    createdAt: string;
    confirmedAt: string | null;
  }>;
};

function toUserRecord(row: {
  id: string;
  name: string;
  email: string;
  created_at: string;
  email_verified_at: string | null;
}): SiteUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    emailVerifiedAt: row.email_verified_at,
  };
}

export async function listSiteUsers(): Promise<SiteUserRecord[]> {
  if (!isDbEnabled()) return [];

  const rows = await db.$queryRawUnsafe<
    {
      id: string;
      name: string;
      email: string;
      created_at: string;
      email_verified_at: string | null;
    }[]
  >(
    `SELECT "id", "name", "email", "created_at", "email_verified_at"
       FROM "site_users"
      ORDER BY "created_at" DESC`,
  );

  return rows.map(toUserRecord);
}

export async function getSiteUserDetail(
  id: string,
): Promise<SiteUserDetail | null> {
  if (!isDbEnabled()) return null;

  const userRows = await db.$queryRawUnsafe<
    Array<{
      id: string;
      name: string;
      email: string;
      created_at: string;
      email_verified_at: string | null;
    }>
  >(
    `SELECT "id", "name", "email", "created_at", "email_verified_at"
       FROM "site_users"
      WHERE "id" = $1
      LIMIT 1`,
    id,
  );

  const user = userRows[0];
  if (!user) return null;

  const [quizRows, leadRows, bookingRows] = await Promise.all([
    db.$queryRawUnsafe<
      Array<{
        id: string;
        completed_at: string;
        score: number;
        max_score: number;
        correct_count: number;
        skipped_count: number;
        duration_ms: number | null;
      }>
    >(
      `SELECT "id", "completed_at", "score", "max_score",
              "correct_count", "skipped_count", "duration_ms"
         FROM "quiz_attempts"
        WHERE "user_id" = $1
        ORDER BY "completed_at" DESC`,
      id,
    ),
    db.$queryRawUnsafe<
      Array<{
        id: string;
        type: string;
        status: string;
        name: string;
        program: string | null;
        subject: string | null;
        message: string;
        created_at: string;
      }>
    >(
      `SELECT "id", "type", "status", "name", "program", "subject", "message", "created_at"
         FROM "lead_submissions"
        WHERE "email" = $1
        ORDER BY "created_at" DESC`,
      user.email,
    ),
    db.$queryRawUnsafe<
      Array<{
        id: string;
        type: string;
        status: string;
        program_slug: string;
        program_title: string;
        room_type: string;
        batch_date: string;
        duration: string | null;
        full_amount_cents: number;
        total_pay_now_cents: number;
        remaining_cents: number;
        created_at: string;
        confirmed_at: string | null;
      }>
    >(
      `SELECT "id", "type", "status", "program_slug", "program_title",
              "room_type", "batch_date", "duration",
              "full_amount_cents", "total_pay_now_cents", "remaining_cents",
              "created_at", "confirmed_at"
         FROM "bookings"
        WHERE "email" = $1
        ORDER BY "created_at" DESC`,
      user.email,
    ),
  ]);

  return {
    ...toUserRecord(user),
    quizAttempts: quizRows.map((row) => ({
      id: row.id,
      completedAt: row.completed_at,
      score: row.score,
      maxScore: row.max_score,
      correct: row.correct_count,
      incorrect: Math.max(0, row.max_score - row.score),
      skipped: row.skipped_count,
      totalTimeMs: row.duration_ms ?? 0,
    })),
    leads: leadRows.map((row) => ({
      id: row.id,
      type: row.type as "enquiry" | "contact",
      status: row.status,
      name: row.name,
      program: row.program ?? undefined,
      subject: row.subject ?? undefined,
      message: row.message,
      createdAt: row.created_at,
    })),
    bookings: bookingRows.map((row) => ({
      id: row.id,
      type: row.type as "course" | "retreat",
      status: row.status,
      programSlug: row.program_slug,
      programTitle: row.program_title,
      roomType: row.room_type,
      batchDate: row.batch_date,
      duration: row.duration ?? undefined,
      fullAmountUsd: row.full_amount_cents / 100,
      payNowUsd: row.total_pay_now_cents / 100,
      remainingUsd: row.remaining_cents / 100,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
    })),
  };
}
