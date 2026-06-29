/** High-resolution Unsplash stock — replaces live-site image URLs. */

const BASE = "https://images.unsplash.com";

export const STOCK_IMAGES = {
  yogaPractice:
    `${BASE}/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=85`,
  meditation:
    `${BASE}/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=85`,
  asana:
    `${BASE}/photo-1599901860904-17e06ed708c2?auto=format&fit=crop&w=1600&q=85`,
  outdoorYoga:
    `${BASE}/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=85`,
  studio:
    `${BASE}/photo-1593811160657-8443f7660669?auto=format&fit=crop&w=1600&q=85`,
  rishikesh:
    `${BASE}/photo-1626621341517-bbf3d9992a23?auto=format&fit=crop&w=1600&q=85`,
  ganges:
    `${BASE}/photo-1582510004616-1c00a200d980?auto=format&fit=crop&w=1600&q=85`,
  himalaya:
    `${BASE}/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85`,
  teacher:
    `${BASE}/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1600&q=85`,
  groupClass:
    `${BASE}/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=85`,
  wellness:
    `${BASE}/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=85`,
  food:
    `${BASE}/photo-1498837167922-ddd275504608?auto=format&fit=crop&w=1600&q=85`,
  room:
    `${BASE}/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=85`,
  retreat:
    `${BASE}/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1600&q=85`,
  certificate:
    `${BASE}/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=85`,
  badge:
    `${BASE}/photo-1434030216411-0b79348cddf5?auto=format&fit=crop&w=800&q=85`,
} as const;

/** Stable pick from pool by string seed (same URL always maps to same image). */
export function stockImage(seed: string, variant = 0): string {
  const pool = Object.values(STOCK_IMAGES);
  let hash = variant;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

/** Indexed gallery helper — e.g. room photo 3 of 17. */
export function stockGalleryImage(category: string, index: number): string {
  return stockImage(`${category}-${index}`, index);
}

export const RYT_BADGE = STOCK_IMAGES.badge;
export const CERTIFICATE_SAMPLE = STOCK_IMAGES.certificate;
