export interface PricingOption {
  roomType: string;
  price: string;
  description: string;
  features: string[];
}

export interface UpcomingDatesProps {
  duration: string;
  pricing: PricingOption[];
  pricingDescription: string;
}

export type BatchItem = {
  dates: string;
  status: string;
  spaces: string;
  statusColor: string;
  tone: "open" | "fast" | "last";
};

export function getRoomImage(roomType: string) {
  const type = roomType.toLowerCase();
  if (type.includes("triple")) {
    return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80";
  }
  if (
    type.includes("double") ||
    type.includes("twin") ||
    type.includes("shared")
  ) {
    return "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80";
}

export function getBatchDates(durationStr: string): BatchItem[] {
  const numDays = Number.parseInt(durationStr.split(" ")[0], 10) || 25;
  const months = [
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months.map((month, index) => {
    const startDay = 2;
    const endDay = startDay + numDays - 1;
    let endMonth = month;
    let endDayAdjusted = endDay;

    if (endDay > 30) {
      if (numDays > 50) {
        const nextMonthIdx = (months.indexOf(month) + 1) % months.length;
        endMonth = months[nextMonthIdx];
        endDayAdjusted = endDay - 30;
      }
    }

    const dateString =
      numDays > 50
        ? `${month} 2 – ${endMonth} 30, 2026`
        : `${month} 2 – ${month} ${endDayAdjusted}, 2026`;

    let status = "Open";
    let spaces = "Spaces available";
    let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let tone: BatchItem["tone"] = "open";

    if (index === 0) {
      status = "Filling Fast";
      spaces = "Only 3 spots left";
      statusColor = "text-amber-700 bg-amber-50 border-amber-200";
      tone = "fast";
    } else if (index === 1) {
      status = "Last Call";
      spaces = "Only 5 spots left";
      statusColor = "text-rose-700 bg-rose-50 border-rose-200";
      tone = "last";
    }

    return { dates: dateString, status, spaces, statusColor, tone };
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

export const BOOKING_GUARANTEE = {
  deposit: "$200 USD",
  lines: [
    "A registration deposit secures your reservation. The remaining balance is payable on arrival via cash or card.",
    "All deposits are transferable to future dates up to 12 months in advance.",
  ],
};
