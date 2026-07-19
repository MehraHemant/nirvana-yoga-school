import type { BookingAddonsContent } from "@/content/types/booking";

/**
 * Default optional booking add-ons (campus extras).
 * Editable in admin under Bookings → Add-ons.
 */
export function createDefaultBookingAddons(): BookingAddonsContent {
  return {
    live: true,
    intro:
      "Optional extras for your stay. Select any that apply — they are added to your program fee.",
    items: [
      {
        id: "heater",
        label: "Room heater",
        priceUsd: 100,
        description: "Portable heater for cooler months (per stay).",
        appliesTo: ["course", "retreat"],
        active: true,
      },
      {
        id: "air-conditioner",
        label: "Air conditioner",
        priceUsd: 100,
        description: "In-room AC for warmer months (per stay).",
        appliesTo: ["course", "retreat"],
        active: true,
      },
    ],
  };
}
