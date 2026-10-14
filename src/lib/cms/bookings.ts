import { getBookingAddons } from "@/content/repositories/shared-sections";
import type {
  BookingAdditionalGuest,
  BookingRecord,
  BookingSelectedAddon,
  BookingStatus,
  CreateBookingInput,
} from "@/content/types/booking";
import {
  enrichBookingAddons,
  filterBookingAddonsForType,
  resolveSelectedAddons,
} from "@/lib/booking/addons";
import {
  getBookingProgram,
  getCourseBookingCatalog,
  getRetreatBookingCatalog,
} from "@/lib/booking/catalog";
import { getRoomOccupancy } from "@/lib/booking/occupancy";
import {
  calculateBookingPricing,
  centsToUsd,
  usdToCents,
} from "@/lib/booking/pricing";
import { db } from "@/lib/db";
import type { ParseResult } from "@/lib/types/api";

/**
 * Map a Neon booking row to an API record.
 *
 * @param row - Database booking
 */
function toBookingRecord(row: {
  id: string;
  type: "course" | "retreat";
  status: BookingStatus;
  programSlug: string;
  programTitle: string;
  roomType: string;
  batchDate: string;
  duration: string | null;
  name: string;
  gender: string;
  email: string;
  phone: string;
  country: string | null;
  referenceCode: string | null;
  hearAbout: string | null;
  paymentMode: "full" | "deposit_20";
  basePriceCents: number;
  fullAmountCents: number;
  payNowCents: number;
  paypalFeeCents: number;
  totalPayNowCents: number;
  remainingCents: number;
  promoCode: string | null;
  addons?: unknown;
  additionalGuests?: unknown;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  confirmedAt: Date | null;
}): BookingRecord {
  const addons = Array.isArray(row.addons)
    ? (row.addons as BookingSelectedAddon[])
    : [];
  const additionalGuests = Array.isArray(row.additionalGuests)
    ? (row.additionalGuests as BookingAdditionalGuest[])
    : [];
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    programSlug: row.programSlug,
    programTitle: row.programTitle,
    roomType: row.roomType,
    batchDate: row.batchDate,
    duration: row.duration ?? undefined,
    name: row.name,
    gender: row.gender,
    email: row.email,
    phone: row.phone,
    country: row.country ?? undefined,
    referenceCode: row.referenceCode ?? undefined,
    hearAbout: row.hearAbout ?? undefined,
    paymentMode: row.paymentMode,
    promoCode: row.promoCode ?? undefined,
    selectedAddonIds: addons.map((item) => item.id),
    addons,
    additionalGuests,
    basePriceUsd: centsToUsd(row.basePriceCents),
    fullAmountUsd: centsToUsd(row.fullAmountCents),
    payNowUsd: centsToUsd(row.payNowCents),
    paypalFeeUsd: centsToUsd(row.paypalFeeCents),
    totalPayNowUsd: centsToUsd(row.totalPayNowCents),
    remainingUsd: centsToUsd(row.remainingCents),
    paypalOrderId: row.paypalOrderId,
    paypalCaptureId: row.paypalCaptureId,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
  };
}

const ACTIVE_BOOKING_FILTER = { deletedAt: null } as const;

/**
 * Normalizes additional guest rows from the public booking form.
 *
 * @param value - Raw JSON value
 */
function parseAdditionalGuests(value: unknown): BookingAdditionalGuest[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const name =
        typeof record.name === "string" ? record.name.trim() : "";
      const gender =
        typeof record.gender === "string" ? record.gender.trim() : "";
      if (!name || !gender) return null;
      return { name, gender };
    })
    .filter((entry): entry is BookingAdditionalGuest => Boolean(entry));
}

/**
 * Validates guest count against the selected room occupancy.
 *
 * @param roomType - Selected room label
 * @param additionalGuests - Extra guest rows
 */
function validateAdditionalGuests(
  roomType: string,
  additionalGuests: BookingAdditionalGuest[],
): string | null {
  const requiredExtraGuests = Math.max(0, getRoomOccupancy(roomType) - 1);
  if (requiredExtraGuests === 0) {
    return additionalGuests.length > 0
      ? "This room does not require additional guest details"
      : null;
  }
  if (additionalGuests.length !== requiredExtraGuests) {
    return `Please add details for ${requiredExtraGuests} additional guest${
      requiredExtraGuests === 1 ? "" : "s"
    }`;
  }
  return null;
}

/**
 * Create a pending booking before PayPal checkout.
 *
 * @param input - Validated booking form payload
 */
export async function createBooking(input: CreateBookingInput) {
  const program = await getBookingProgram(input.type, input.programSlug);
  if (!program) {
    throw new Error("Program not found");
  }

  const room = program.rooms.find((item) => item.roomType === input.roomType);
  if (!room) {
    throw new Error("Room option not found");
  }

  const additionalGuests = input.additionalGuests ?? [];
  const guestError = validateAdditionalGuests(input.roomType, additionalGuests);
  if (guestError) {
    throw new Error(guestError);
  }

  const addonsResult = await getBookingAddons();
  // Course add-ons resolve rooms from the residential course catalog.
  const courseCatalog = await getCourseBookingCatalog();
  const addonCatalogPrograms =
    input.type === "course"
      ? courseCatalog
      : [...(await getRetreatBookingCatalog()), ...courseCatalog];
  const catalog = enrichBookingAddons(
    filterBookingAddonsForType(
      input.type,
      addonsResult.data ?? null,
      input.programSlug,
    ),
    addonCatalogPrograms,
  );
  const selectedAddons: BookingSelectedAddon[] = resolveSelectedAddons(
    catalog,
    input.selectedAddonIds,
  );
  const addonsTotal = selectedAddons.reduce(
    (sum, item) => sum + item.priceUsd,
    0,
  );
  const basePriceUsd = room.priceUsd + addonsTotal;
  const pricing = calculateBookingPricing(basePriceUsd, input.paymentMode);

  const booking = await db.booking.create({
    data: {
      type: input.type,
      status: "pending_payment",
      programSlug: input.programSlug,
      programTitle: input.programTitle || program.title,
      roomType: input.roomType,
      batchDate: input.batchDate,
      duration: input.duration ?? program.duration,
      name: input.name.trim(),
      gender: input.gender,
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: input.country?.trim() || null,
      referenceCode: input.referenceCode?.trim() || null,
      hearAbout: input.hearAbout?.trim() || null,
      paymentMode: input.paymentMode,
      basePriceCents: usdToCents(basePriceUsd),
      fullAmountCents: usdToCents(pricing.fullAmountUsd),
      payNowCents: usdToCents(pricing.payNowUsd),
      paypalFeeCents: usdToCents(pricing.paypalFeeUsd),
      totalPayNowCents: usdToCents(pricing.totalPayNowUsd),
      remainingCents: usdToCents(pricing.remainingUsd),
      promoCode: input.promoCode?.trim() || null,
      addons: selectedAddons,
      additionalGuests,
    },
  });

  return toBookingRecord(booking);
}

/**
 * List bookings for admin (excludes soft-deleted by default).
 *
 * @param deleted - When true, return only deleted bookings
 */
export async function listBookings(deleted = false) {
  const rows = await db.booking.findMany({
    where: deleted ? { deletedAt: { not: null } } : ACTIVE_BOOKING_FILTER,
    orderBy: deleted ? { deletedAt: "desc" } : { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toBookingRecord);
}

/**
 * Get booking stats for the admin dashboard.
 */
export async function getBookingStats() {
  const [confirmed, pending, deleted, recent] = await Promise.all([
    db.booking.count({
      where: { status: "confirmed", ...ACTIVE_BOOKING_FILTER },
    }),
    db.booking.count({
      where: { status: "pending_payment", ...ACTIVE_BOOKING_FILTER },
    }),
    db.booking.count({ where: { deletedAt: { not: null } } }),
    db.booking.findMany({
      where: ACTIVE_BOOKING_FILTER,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    confirmed,
    pending,
    deleted,
    recent: recent.map(toBookingRecord),
  };
}

/**
 * Load a booking by id.
 *
 * @param id - Booking id
 */
export async function getBookingById(id: string) {
  const row = await db.booking.findFirst({
    where: { id, ...ACTIVE_BOOKING_FILTER },
  });
  return row ? toBookingRecord(row) : null;
}

/**
 * Attach a PayPal order id to a pending booking.
 *
 * @param id - Booking id
 * @param paypalOrderId - PayPal order id
 */
export async function attachPaypalOrder(id: string, paypalOrderId: string) {
  return db.booking.update({
    where: { id },
    data: { paypalOrderId },
  });
}

/**
 * Mark booking confirmed after successful PayPal capture.
 *
 * @param id - Booking id
 * @param paypalCaptureId - PayPal capture id
 */
export async function confirmBooking(id: string, paypalCaptureId: string) {
  return db.booking.update({
    where: { id },
    data: {
      status: "confirmed",
      paypalCaptureId,
      confirmedAt: new Date(),
    },
  });
}

/**
 * Soft-delete a booking.
 *
 * @param id - Booking id
 */
export async function softDeleteBooking(id: string) {
  return db.booking.update({
    where: { id, ...ACTIVE_BOOKING_FILTER },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restore a soft-deleted booking.
 *
 * @param id - Booking id
 */
export async function restoreBooking(id: string) {
  return db.booking.update({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
}

/**
 * Validate create-booking payload from the public API.
 *
 * @param body - Raw JSON body
 */
export function parseCreateBookingInput(
  body: unknown,
): ParseResult<CreateBookingInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const record = body as Record<string, unknown>;
  const type = record.type;
  if (type !== "course" && type !== "retreat") {
    return { ok: false, error: "Invalid booking type" };
  }

  const paymentMode = record.paymentMode;
  if (paymentMode !== "full" && paymentMode !== "deposit_20") {
    return { ok: false, error: "Invalid payment mode" };
  }

  const required = [
    "programSlug",
    "roomType",
    "batchDate",
    "name",
    "gender",
    "email",
    "phone",
  ] as const;

  for (const key of required) {
    if (typeof record[key] !== "string" || !record[key].trim()) {
      return { ok: false, error: `Missing ${key}` };
    }
  }

  const roomType = (record.roomType as string).trim();
  const additionalGuests = parseAdditionalGuests(record.additionalGuests);
  const guestError = validateAdditionalGuests(roomType, additionalGuests);
  if (guestError) {
    return { ok: false, error: guestError };
  }

  return {
    ok: true,
    data: {
      type,
      paymentMode,
      programSlug: (record.programSlug as string).trim(),
      programTitle:
        typeof record.programTitle === "string"
          ? record.programTitle.trim()
          : "",
      roomType,
      batchDate: (record.batchDate as string).trim(),
      duration:
        typeof record.duration === "string"
          ? record.duration.trim()
          : undefined,
      name: (record.name as string).trim(),
      gender: (record.gender as string).trim(),
      email: (record.email as string).trim(),
      phone: (record.phone as string).trim(),
      country:
        typeof record.country === "string" ? record.country.trim() : undefined,
      referenceCode:
        typeof record.referenceCode === "string"
          ? record.referenceCode.trim()
          : undefined,
      hearAbout:
        typeof record.hearAbout === "string"
          ? record.hearAbout.trim()
          : undefined,
      promoCode:
        typeof record.promoCode === "string"
          ? record.promoCode.trim()
          : undefined,
      selectedAddonIds: Array.isArray(record.selectedAddonIds)
        ? record.selectedAddonIds.filter(
            (id): id is string =>
              typeof id === "string" && id.trim().length > 0,
          )
        : [],
      additionalGuests,
    },
  };
}
