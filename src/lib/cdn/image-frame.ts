export type ImageOrientation = "square" | "portrait" | "landscape";

const ORIENTATION_LABEL: Record<ImageOrientation, string> = {
  square: "Square",
  portrait: "Portrait",
  landscape: "Landscape",
};

/** Largest integer still shown as a simplified ratio (for example 21:9). */
const MAX_CLEAN_RATIO_PART = 21;

export type ImageFrame = {
  orientation: ImageOrientation;
  label: string;
  ratio: string;
  width: number;
  height: number;
};

/**
 * Positive whole-pixel length, or null when the value is missing or invalid.
 *
 * @param value - Stored or reported dimension
 */
export function toImagePixel(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric);
}

/**
 * Greatest common divisor of two positive integers.
 *
 * @param a - First integer
 * @param b - Second integer
 */
function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

/**
 * Drops trailing zeros from a two-decimal ratio part (1.50 → 1.5, 2.00 → 2).
 *
 * @param value - Ratio of the two sides
 */
function formatDecimalPart(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Orientation from pixel dimensions. Square requires exact equality.
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 */
export function imageOrientation(
  width: number,
  height: number,
): ImageOrientation | null {
  const pixelWidth = toImagePixel(width);
  const pixelHeight = toImagePixel(height);
  if (pixelWidth == null || pixelHeight == null) return null;
  if (pixelWidth === pixelHeight) return "square";
  return pixelHeight > pixelWidth ? "portrait" : "landscape";
}

/**
 * Simplified aspect ratio when it reduces cleanly (16:9), otherwise a
 * rounded decimal such as 1.85:1 or 1:1.33.
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 */
export function formatAspectRatio(
  width: number,
  height: number,
): string | null {
  const pixelWidth = toImagePixel(width);
  const pixelHeight = toImagePixel(height);
  if (pixelWidth == null || pixelHeight == null) return null;

  const divisor = gcd(pixelWidth, pixelHeight);
  const ratioWidth = pixelWidth / divisor;
  const ratioHeight = pixelHeight / divisor;
  if (
    ratioWidth <= MAX_CLEAN_RATIO_PART &&
    ratioHeight <= MAX_CLEAN_RATIO_PART
  ) {
    return `${ratioWidth}:${ratioHeight}`;
  }

  if (pixelWidth >= pixelHeight) {
    return `${formatDecimalPart(pixelWidth / pixelHeight)}:1`;
  }
  return `1:${formatDecimalPart(pixelHeight / pixelWidth)}`;
}

/**
 * Orientation label and aspect ratio for an image with known dimensions.
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 */
export function describeImageFrame(
  width: number | null | undefined,
  height: number | null | undefined,
): ImageFrame | null {
  const pixelWidth = toImagePixel(width);
  const pixelHeight = toImagePixel(height);
  if (pixelWidth == null || pixelHeight == null) return null;
  const orientation = imageOrientation(pixelWidth, pixelHeight);
  const ratio = formatAspectRatio(pixelWidth, pixelHeight);
  if (!orientation || !ratio) return null;
  return {
    orientation,
    label: ORIENTATION_LABEL[orientation],
    ratio,
    width: pixelWidth,
    height: pixelHeight,
  };
}
