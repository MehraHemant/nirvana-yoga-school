/**
 * Parses guest count from a room label such as "Private Double Balcony Room (2 people)".
 *
 * @param roomType - Selected room / package label
 */
export function getRoomOccupancy(roomType: string): number {
  const match = roomType.match(/\((\d+)\s*people?\)/i);
  if (match) {
    const count = Number.parseInt(match[1], 10);
    if (Number.isFinite(count) && count > 0) return count;
  }
  return 1;
}

/**
 * Whether the selected room requires details for more than one guest.
 *
 * @param roomType - Selected room / package label
 */
export function requiresMultipleGuests(roomType: string): boolean {
  return getRoomOccupancy(roomType) > 1;
}
