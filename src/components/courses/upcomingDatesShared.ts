export interface PricingOption {
  /** Shared room id when linked to the catalog */
  roomId?: string;
  roomType: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  image?: string;
}

export type UpcomingDatesProps = {
  duration: string;
  pricing: PricingOption[];
  pricingDescription: string;
  batches?: BatchItem[];
  lodgingTitle?: string;
  datesTitle?: string;
  /** Course or retreat slug for book-now links */
  programSlug?: string;
  /** When set, Reserve buttons link to the booking flow instead of WhatsApp */
  bookingType?: "course" | "retreat";
  /** Public section HTML id (defaults to `pricing`) */
  htmlId?: string;
  buildWhatsAppHref?: (
    duration: string,
    roomType: string,
    batch: string,
  ) => string;
  buildReserveHref?: (
    duration: string,
    roomType: string,
    batch: string,
  ) => string;
  /** Controlled selection — when set with callbacks, parent owns booking state */
  selectedRoomType?: string;
  selectedBatch?: string;
  onRoomSelect?: (roomType: string) => void;
  onBatchSelect?: (batch: string) => void;
};

export type BatchItem = {
  dates: string;
  status: string;
  spaces: string;
  statusColor: string;
  tone: "open" | "fast" | "last";
};

// Actual course dates with real seat availability
export function getBatchDates(_durationStr: string): BatchItem[] {
  const rawBatches: Array<{ dates: string; seats: number }> = [
    { dates: "2nd Jul to 26th Jul 2026", seats: 2 },
    { dates: "2nd Aug to 26th Aug 2026", seats: 4 },
    { dates: "2nd Sep to 26th Sep 2026", seats: 3 },
    { dates: "2nd Oct to 26th Oct 2026", seats: 4 },
    { dates: "2nd Nov to 26th Nov 2026", seats: 7 },
    { dates: "2nd Dec to 26th Dec 2026", seats: 6 },
    { dates: "4th Jan to 28th Jan 2027", seats: 7 },
    { dates: "2nd Feb to 26th Feb 2027", seats: 9 },
    { dates: "2nd Mar to 26th Mar 2027", seats: 10 },
    { dates: "2nd Apr to 26th Apr 2027", seats: 12 },
    { dates: "2nd May to 26th May 2027", seats: 12 },
  ];

  return rawBatches.map(({ dates, seats }) => {
    const spaces = `${seats} seat${seats === 1 ? "" : "s"} left`;

    if (seats <= 3) {
      return {
        dates,
        status: "Filling Fast",
        spaces,
        statusColor: "text-amber-700 bg-amber-50 border-amber-200",
        tone: "fast" as const,
      };
    }

    return {
      dates,
      status: "Open",
      spaces,
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      tone: "open" as const,
    };
  });
}

export function whatsAppHref(
  duration: string,
  roomType: string,
  batch: string,
) {
  const text = encodeURIComponent(
    `Hi Nirvana Yoga School, I would like to register for the ${duration} ${roomType} YTT batch starting on ${batch}.`,
  );
  return `https://wa.me/919876543210?text=${text}`;
}

/**
 * Build a book-now URL with program, room, and date pre-filled.
 *
 * @param bookingType - Course or retreat booking page
 * @param programSlug - Program slug
 * @param roomType - Selected room label
 * @param batch - Selected batch date string
 */
export function bookingReserveHref(
  bookingType: "course" | "retreat",
  programSlug: string,
  roomType: string,
  batch: string,
): string {
  const base = bookingType === "course" ? "/booking" : "/retreat-booking";
  const params = new URLSearchParams({
    course: programSlug,
    room: roomType,
    date: batch,
  });
  return `${base}?${params.toString()}`;
}
