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
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  deletedAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
};
