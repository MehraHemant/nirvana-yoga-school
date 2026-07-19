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

/** One optional paid add-on offered at checkout (global_settings.bookingAddons). */
export type BookingAddon = {
  id: string;
  label: string;
  priceUsd: number;
  description?: string;
  /** When set, only shown for these booking types. Empty / omitted = both. */
  appliesTo?: BookingType[];
  /** When false, hidden from checkout. Default true. */
  active?: boolean;
};

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
  /** Selected add-on ids from global bookingAddons catalog */
  selectedAddonIds?: string[];
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
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  deletedAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
};
