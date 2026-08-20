/** Booking and payment types for the book-now flow. */

export type BookingType = "course" | "retreat";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "failed"
  | "cancelled";

export type PaymentMode = "full" | "deposit_20";

export type BookingRoomOption = {
  roomType: string;
  priceUsd: number;
  originalPriceUsd?: number;
};

export type BookingProgram = {
  slug: string;
  title: string;
  duration: string;
  rooms: BookingRoomOption[];
  batches: string[];
};

/** Add-on kind in CMS: freeform custom, or a linked course (rooms from catalog). */
export type BookingAddonKind = "manual" | "course";

/** One room / package choice under a course add-on (usually enriched from catalog). */
export type BookingAddonOption = {
  id: string;
  label: string;
  priceUsd: number;
};

/** Fields shared by every booking add-on. */
type BookingAddonCommon = {
  id: string;
  /** Display title; for course add-ons, empty means use linked course title */
  label: string;
  description?: string;
  /** When set, only shown for these booking types. Empty / omitted = both. */
  appliesTo?: BookingType[];
  /**
   * When non-empty, only shown when booking one of these program slugs.
   * Empty / omitted = all programs for the applicable booking type(s).
   */
  programSlugs?: string[];
  /** When false, hidden from checkout. Default true. */
  active?: boolean;
};

/**
 * Optional paid add-on offered at checkout (`global_settings.bookingAddons`).
 * Legacy rows omit `type` and are treated as `manual`.
 */
export type BookingAddon =
  | (BookingAddonCommon & {
      /** Custom label / price / description */
      type?: "manual";
      priceUsd: number;
    })
  | (BookingAddonCommon & {
      /** Upsell another bookable course; guest picks a room from that course */
      type: "course";
      /** Linked residential course slug */
      courseSlug: string;
      /**
       * Room choices. Usually filled at enrich time from the course catalog;
       * not required in CMS storage.
       */
      options?: BookingAddonOption[];
      /** Optional display hint (e.g. min room price after enrich) */
      priceUsd?: number;
    });

/** CMS document for booking add-ons. */
export type BookingAddonsContent = {
  live?: boolean;
  /** Short intro shown above the add-on checklist */
  intro?: string;
  items: BookingAddon[];
};

/** Snapshot of an add-on selected on a booking. */
export type BookingSelectedAddon = {
  id: string;
  label: string;
  priceUsd: number;
  /** Parent add-on id when a nested room option was chosen */
  groupId?: string;
  /** Parent add-on label (course title / custom label) */
  groupLabel?: string;
  /** Resolved kind for admin / display */
  type?: BookingAddonKind;
  /** Linked course slug when type is course */
  courseSlug?: string;
  /** Chosen room / package label when type is course */
  roomType?: string;
};

/** Additional guest on a multi-person room booking (primary guest uses top-level fields). */
export type BookingAdditionalGuest = {
  name: string;
  gender: string;
};

export type BookingPricingBreakdown = {
  basePriceUsd: number;
  fullAmountUsd: number;
  payNowUsd: number;
  paypalFeeUsd: number;
  totalPayNowUsd: number;
  remainingUsd: number;
  paymentMode: PaymentMode;
};

export type CreateBookingInput = {
  type: BookingType;
  programSlug: string;
  programTitle: string;
  roomType: string;
  batchDate: string;
  duration?: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  country?: string;
  referenceCode?: string;
  hearAbout?: string;
  paymentMode: PaymentMode;
  promoCode?: string;
  /**
   * Selected add-on option ids (manual add-on id, or course room option id).
   * At most one room option per course add-on group.
   */
  selectedAddonIds?: string[];
  /** Extra guests when the room sleeps more than one (e.g. double room). */
  additionalGuests?: BookingAdditionalGuest[];
};

export type BookingRecord = CreateBookingInput & {
  id: string;
  status: BookingStatus;
  basePriceUsd: number;
  fullAmountUsd: number;
  payNowUsd: number;
  paypalFeeUsd: number;
  totalPayNowUsd: number;
  remainingUsd: number;
  /** Resolved add-ons stored with the booking */
  addons: BookingSelectedAddon[];
  /** Extra guests beyond the primary booker */
  additionalGuests: BookingAdditionalGuest[];
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  deletedAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
};
